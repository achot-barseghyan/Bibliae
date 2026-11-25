import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { db } from './db.ts';
import { sendVerificationCode } from './mailer.ts';

const JWT_SECRET = process.env.JWT_SECRET ?? '';
if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET manquant ou trop court (32 caractères minimum).');
}
const TOKEN_TTL = '180d';
const AVATAR_COUNT = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PSEUDO_RE = /^[\p{L}\p{N} ._'-]{3,16}$/u;
const DUMMY_HASH = bcrypt.hashSync('bibliae-dummy-password', 11);

/** Code de vérification : 6 chiffres, 15 minutes, 5 essais, un envoi par minute au plus. */
const CODE_TTL_MIN = 15;
const CODE_MAX_ATTEMPTS = 5;
const CODE_RESEND_S = 60;

/** Le compte vu par son propriétaire (jamais renvoyé pour un autre joueur). */
export interface OwnUser {
  id: number;
  pseudo: string;
  avatar: number;
  email: string;
  emailVerified: boolean;
}

interface UserRow {
  id: string;
  pseudo: string;
  avatar: number;
  email: string;
  email_verified_at: Date | null;
  password_hash: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: number | null;
  }
}

const USER_COLUMNS = 'id, pseudo, avatar, email, email_verified_at';

function ownUser(row: Omit<UserRow, 'password_hash'>): OwnUser {
  return {
    id: Number(row.id),
    pseudo: row.pseudo,
    avatar: row.avatar,
    email: row.email,
    emailVerified: row.email_verified_at != null
  };
}

function sign(userId: number): string {
  return jwt.sign({}, JWT_SECRET, { subject: String(userId), expiresIn: TOKEN_TTL, algorithm: 'HS256' });
}

const codeHash = (userId: number, code: string) =>
  createHmac('sha256', JWT_SECRET).update(`verify:${userId}:${code}`).digest('hex');

/** Lit le jeton Bearer s'il y en a un ; ne rejette jamais (voir requireUser). */
export async function readUser(req: FastifyRequest): Promise<void> {
  req.userId = null;
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return;
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET, { algorithms: ['HS256'] });
    const id = Number(typeof payload === 'object' ? payload.sub : NaN);
    if (Number.isSafeInteger(id)) req.userId = id;
  } catch {
    // jeton expiré ou invalide : la requête continue sans utilisateur
  }
}

export async function requireUser(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (req.userId == null) {
    await reply.code(401).send({ error: 'Connecte-toi pour continuer.' });
  }
}

/** Compte connecté ET adresse e-mail confirmée. */
export async function requireVerified(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (req.userId == null) {
    await reply.code(401).send({ error: 'Connecte-toi pour continuer.' });
    return;
  }
  const { rows } = await db.query<{ verified: boolean }>(
    'SELECT email_verified_at IS NOT NULL AS verified FROM users WHERE id = $1',
    [req.userId]
  );
  if (!rows[0]) {
    await reply.code(401).send({ error: 'Compte introuvable.' });
  } else if (!rows[0].verified) {
    await reply.code(403).send({ error: 'Confirme ton adresse e-mail pour jouer.', code: 'email_unverified' });
  }
}

/**
 * Crée un nouveau code et l'envoie. Renvoie le délai d'attente restant (en s)
 * si un code vient déjà d'être envoyé.
 */
async function issueCode(user: { id: number; email: string; pseudo: string }, force = false): Promise<number> {
  if (!force) {
    const { rows } = await db.query<{ wait: number }>(
      `SELECT GREATEST(0, $2 - EXTRACT(EPOCH FROM now() - sent_at))::int AS wait
         FROM email_codes WHERE user_id = $1 AND purpose = 'verify'`,
      [user.id, CODE_RESEND_S]
    );
    if (rows[0] && rows[0].wait > 0) return rows[0].wait;
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await db.query(
    `INSERT INTO email_codes (user_id, purpose, code_hash, expires_at, attempts, sent_at)
     VALUES ($1, 'verify', $2, now() + make_interval(mins => $3), 0, now())
     ON CONFLICT (user_id, purpose) DO UPDATE
       SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts = 0, sent_at = now()`,
    [user.id, codeHash(user.id, code), CODE_TTL_MIN]
  );
  await sendVerificationCode(user.email, user.pseudo, code);
  return 0;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const limited = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

  app.post('/auth/signup', limited, async (req, reply) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const pseudo = str(body.pseudo).trim().replace(/\s+/g, ' ');
    const email = str(body.email).trim().toLowerCase();
    const password = str(body.password);
    const avatar = Number(body.avatar ?? 0);

    if (!PSEUDO_RE.test(pseudo)) {
      return reply.code(400).send({ error: 'Choisis un pseudo de 3 à 16 caractères (lettres, chiffres, espace, . _ - \').' });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return reply.code(400).send({ error: "Cette adresse e-mail n'est pas valide." });
    }
    if (password.length < 8 || password.length > 200) {
      return reply.code(400).send({ error: 'Le mot de passe doit faire au moins 8 caractères.' });
    }
    if (!Number.isInteger(avatar) || avatar < 0 || avatar >= AVATAR_COUNT) {
      return reply.code(400).send({ error: 'Médaillon inconnu.' });
    }

    const hash = await bcrypt.hash(password, 11);
    let user: OwnUser;
    try {
      const { rows } = await db.query<UserRow>(
        `INSERT INTO users (pseudo, email, password_hash, avatar) VALUES ($1, $2, $3, $4) RETURNING ${USER_COLUMNS}`,
        [pseudo, email, hash, avatar]
      );
      user = ownUser(rows[0]);
    } catch (err) {
      const e = err as { code?: string; constraint?: string };
      if (e.code === '23505') {
        const msg =
          e.constraint === 'users_pseudo_key'
            ? 'Ce pseudo est déjà pris.'
            : 'Un compte existe déjà avec cette adresse e-mail.';
        return reply.code(409).send({ error: msg });
      }
      throw err;
    }
    // Le compte est créé même si l'envoi échoue : l'app propose de renvoyer le code.
    let codeSent = true;
    try {
      await issueCode(user, true);
    } catch (err) {
      req.log.error({ err }, "envoi du code de vérification impossible");
      codeSent = false;
    }
    return reply.code(201).send({ token: sign(user.id), user, codeSent });
  });

  app.post('/auth/login', limited, async (req, reply) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = str(body.email).trim().toLowerCase();
    const password = str(body.password);
    const { rows } = await db.query<UserRow>(
      `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE lower(email) = $1`,
      [email]
    );
    const row = rows[0];
    // Comparaison même sans compte, pour ne pas révéler par le temps de réponse
    // quelles adresses sont inscrites.
    const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
    if (!row || !ok) {
      return reply.code(401).send({ error: 'E-mail ou mot de passe incorrect.' });
    }
    const user = ownUser(row);
    return { token: sign(user.id), user };
  });

  app.get('/me', { preHandler: requireUser }, async (req, reply) => {
    const { rows } = await db.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [req.userId]);
    if (!rows[0]) return reply.code(401).send({ error: 'Compte introuvable.' });
    return { user: ownUser(rows[0]) };
  });

  /** (Re)envoie un code de vérification à l'adresse du compte. */
  app.post('/auth/verify/send', { preHandler: requireUser, ...limited }, async (req, reply) => {
    const { rows } = await db.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [req.userId]);
    const user = rows[0] && ownUser(rows[0]);
    if (!user) return reply.code(401).send({ error: 'Compte introuvable.' });
    if (user.emailVerified) return { sent: false, alreadyVerified: true, retryIn: 0 };
    try {
      const wait = await issueCode(user);
      if (wait > 0) {
        return reply.code(429).send({ error: `Patiente ${wait} s avant de redemander un code.`, retryIn: wait });
      }
    } catch (err) {
      req.log.error({ err }, "envoi du code de vérification impossible");
      return reply.code(502).send({ error: "L'e-mail n'a pas pu être envoyé. Réessaie dans un instant." });
    }
    return { sent: true, alreadyVerified: false, retryIn: CODE_RESEND_S };
  });

  /** Vérifie le code reçu par e-mail. */
  app.post('/auth/verify', { preHandler: requireUser, ...limited }, async (req, reply) => {
    const userId = req.userId!;
    const code = str((req.body as Record<string, unknown> | undefined)?.code).replace(/\D/g, '');
    const { rows } = await db.query<{ code_hash: string; expired: boolean; attempts: number }>(
      `SELECT code_hash, expires_at < now() AS expired, attempts FROM email_codes
        WHERE user_id = $1 AND purpose = 'verify'`,
      [userId]
    );
    const row = rows[0];
    if (!row || row.expired || row.attempts >= CODE_MAX_ATTEMPTS) {
      return reply.code(400).send({ error: 'Ce code a expiré. Demande un nouveau code.', code: 'code_expired' });
    }
    const expected = Buffer.from(row.code_hash, 'hex');
    const given = Buffer.from(codeHash(userId, code), 'hex');
    if (code.length !== 6 || !timingSafeEqual(expected, given)) {
      await db.query(`UPDATE email_codes SET attempts = attempts + 1 WHERE user_id = $1 AND purpose = 'verify'`, [userId]);
      const left = CODE_MAX_ATTEMPTS - row.attempts - 1;
      return reply.code(400).send({
        error: left > 0 ? `Code incorrect. Encore ${left} essai${left > 1 ? 's' : ''}.` : 'Code incorrect. Demande un nouveau code.',
        code: left > 0 ? 'code_invalid' : 'code_expired'
      });
    }
    const { rows: users } = await db.query<UserRow>(
      `UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1 RETURNING ${USER_COLUMNS}`,
      [userId]
    );
    await db.query(`DELETE FROM email_codes WHERE user_id = $1 AND purpose = 'verify'`, [userId]);
    return { user: ownUser(users[0]) };
  });

  // Suppression du compte et de toutes ses parties (exigée par les stores).
  app.delete('/me', { preHandler: requireUser }, async (req, reply) => {
    await db.query('DELETE FROM users WHERE id = $1', [req.userId]);
    return reply.code(204).send();
  });
}
