import type { FastifyInstance } from 'fastify';
import type { PoolClient } from 'pg';
import { requireVerified } from './auth.ts';
import { db } from './db.ts';
import {
  NETWORK_GRACE_S,
  QUESTION_TIME_S,
  drawDailyQuiz,
  gainFor,
  quizDay,
  secondsUntilNextQuiz,
  shiftDay,
  type DrawnQuestion,
  type PoolQuestion
} from './quiz.ts';

interface Answer {
  pick: number;
  elapsed: number;
  gain: number;
}

interface AttemptRow {
  current_index: number;
  served_at: Date | null;
  combo: number;
  score: number;
  correct: number;
  answers: Answer[];
  finished_at: Date | null;
}

const TOP_SIZE = 30;

/** Tirage du jour, créé et figé à la première demande. */
async function dailyQuiz(client: PoolClient | typeof db, day: string): Promise<DrawnQuestion[]> {
  const found = await client.query<{ questions: DrawnQuestion[] }>('SELECT questions FROM daily_quizzes WHERE day = $1', [day]);
  if (found.rows[0]) return found.rows[0].questions;

  const { rows } = await client.query<{ id: number; text: string; answer: string; ref: string; kind: string }>(
    'SELECT id, text, answer, ref, kind FROM questions WHERE active ORDER BY id'
  );
  const pool: PoolQuestion[] = rows.map((r) => ({ q: r.text, a: r.answer, ref: r.ref, t: r.kind }));
  const drawn = drawDailyQuiz(pool, day).map((q) => ({ ...q, id: rows[q.id].id }));
  await client.query('INSERT INTO daily_quizzes (day, questions) VALUES ($1, $2) ON CONFLICT (day) DO NOTHING', [
    day,
    JSON.stringify(drawn)
  ]);
  const again = await client.query<{ questions: DrawnQuestion[] }>('SELECT questions FROM daily_quizzes WHERE day = $1', [day]);
  return again.rows[0].questions;
}

/** Enregistre une réponse (pick = -1 : temps écoulé) et fait avancer la partie. */
function applyAnswer(a: AttemptRow, quiz: DrawnQuestion[], pick: number, elapsed: number) {
  const q = quiz[a.current_index];
  const ok = pick >= 0 && pick === q.good;
  const combo = ok ? a.combo + 1 : 0;
  const gain = ok ? gainFor(elapsed, combo) : 0;
  const index = a.current_index + 1;
  return {
    ok,
    gain,
    q,
    next: {
      current_index: index,
      served_at: null,
      combo,
      score: a.score + gain,
      correct: a.correct + (ok ? 1 : 0),
      answers: [...a.answers, { pick, elapsed: Math.round(elapsed * 100) / 100, gain }],
      finished_at: index >= quiz.length ? new Date() : null
    } satisfies AttemptRow
  };
}

async function saveAttempt(client: PoolClient, userId: number, day: string, a: AttemptRow): Promise<void> {
  await client.query(
    `UPDATE attempts SET current_index = $3, served_at = $4, combo = $5, score = $6, correct = $7,
       answers = $8, finished_at = $9 WHERE user_id = $1 AND day = $2`,
    [userId, day, a.current_index, a.served_at, a.combo, a.score, a.correct, JSON.stringify(a.answers), a.finished_at]
  );
}

async function lockAttempt(client: PoolClient, userId: number, day: string): Promise<AttemptRow | null> {
  const { rows } = await client.query<AttemptRow>(
    `SELECT current_index, served_at, combo, score, correct, answers, finished_at
       FROM attempts WHERE user_id = $1 AND day = $2 FOR UPDATE`,
    [userId, day]
  );
  return rows[0] ?? null;
}

async function inTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

const elapsedSince = (servedAt: Date) => (Date.now() - servedAt.getTime()) / 1000;
const isExpired = (servedAt: Date) => elapsedSince(servedAt) > QUESTION_TIME_S + NETWORK_GRACE_S;

/** Jours consécutifs de quiz terminés, jusqu'à aujourd'hui (ou hier si pas encore joué). */
async function streakOf(userId: number, today: string): Promise<number> {
  const { rows } = await db.query<{ day: string }>(
    'SELECT day FROM attempts WHERE user_id = $1 AND finished_at IS NOT NULL AND day <= $2 ORDER BY day DESC LIMIT 400',
    [userId, today]
  );
  const days = new Set(rows.map((r) => r.day));
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

type Period = 'day' | 'week' | 'all';

async function leaderboard(period: Period, today: string, userId: number | null) {
  const from = period === 'day' ? today : period === 'week' ? shiftDay(today, -6) : '2000-01-01';
  const { rows } = await db.query<{
    user_id: string;
    pseudo: string;
    avatar: number;
    score: number;
    correct: number;
    played: number;
    rank: number;
    pos: number;
    total: number;
    is_me: boolean;
  }>(
    `WITH scores AS (
       SELECT user_id, sum(score)::int AS score, sum(correct)::int AS correct, count(*)::int AS played,
              min(finished_at) AS first_finish
         FROM attempts
        WHERE finished_at IS NOT NULL AND day BETWEEN $1 AND $2
        GROUP BY user_id
     ), ranked AS (
       SELECT s.*, u.pseudo, u.avatar,
              (rank() OVER (ORDER BY s.score DESC))::int AS rank,
              (row_number() OVER (ORDER BY s.score DESC, s.first_finish))::int AS pos,
              (count(*) OVER ())::int AS total
         FROM scores s JOIN users u ON u.id = s.user_id
     )
     SELECT user_id, pseudo, avatar, score, correct, played, rank, pos, total, (user_id = $3) IS TRUE AS is_me
       FROM ranked
      WHERE pos <= $4 OR user_id = $3
      ORDER BY pos`,
    [from, today, userId == null ? null : String(userId), TOP_SIZE]
  );
  const toEntry = (r: (typeof rows)[number]) => ({
    rank: r.rank,
    pseudo: r.pseudo,
    avatar: r.avatar,
    score: r.score,
    correct: r.correct,
    played: r.played,
    me: r.is_me
  });
  const mine = rows.find((r) => r.is_me);
  return {
    period,
    from,
    to: today,
    total: rows[0]?.total ?? 0,
    top: rows.filter((r) => r.pos <= TOP_SIZE).map(toEntry),
    me: mine ? toEntry(mine) : null
  };
}

export async function quizRoutes(app: FastifyInstance): Promise<void> {
  /** État du quiz du jour pour le joueur connecté. */
  app.get('/quiz/today', { preHandler: requireVerified }, async (req) => {
    const userId = req.userId!;
    const day = quizDay();
    const quiz = await dailyQuiz(db, day);
    const [{ rows: att }, { rows: cnt }, streak] = await Promise.all([
      db.query<AttemptRow>(
        'SELECT current_index, served_at, combo, score, correct, answers, finished_at FROM attempts WHERE user_id = $1 AND day = $2',
        [userId, day]
      ),
      db.query<{ n: number }>('SELECT count(*)::int AS n FROM attempts WHERE day = $1 AND finished_at IS NOT NULL', [day]),
      streakOf(userId, day)
    ]);
    const a = att[0];
    let rank: number | null = null;
    if (a?.finished_at) {
      const { rows } = await db.query<{ r: number }>(
        'SELECT (count(*) + 1)::int AS r FROM attempts WHERE day = $1 AND finished_at IS NOT NULL AND score > $2',
        [day, a.score]
      );
      rank = rows[0].r;
    }
    return {
      day,
      secondsLeft: secondsUntilNextQuiz(),
      total: quiz.length,
      timeLimit: QUESTION_TIME_S,
      players: cnt[0].n,
      streak,
      attempt: a
        ? {
            status: a.finished_at ? 'finished' : 'in_progress',
            index: a.current_index,
            score: a.score,
            correct: a.correct,
            rank
          }
        : { status: 'none', index: 0, score: 0, correct: 0, rank: null }
    };
  });

  /**
   * Sert la question en cours (et lance son chrono côté serveur). Redemandée
   * pendant le chrono, elle revient avec le temps restant, sans le remettre à zéro.
   */
  app.post('/quiz/today/next', { preHandler: requireVerified }, async (req, reply) => {
    const userId = req.userId!;
    const day = quizDay();
    return inTransaction(async (client) => {
      const quiz = await dailyQuiz(client, day);
      await client.query('INSERT INTO attempts (user_id, day) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, day]);
      let a = (await lockAttempt(client, userId, day))!;

      if (!a.finished_at && a.served_at) {
        if (isExpired(a.served_at)) {
          a = applyAnswer(a, quiz, -1, QUESTION_TIME_S).next;
        } else {
          const q = quiz[a.current_index];
          return {
            index: a.current_index,
            total: quiz.length,
            text: q.q,
            choices: q.choices,
            timeLimit: QUESTION_TIME_S,
            remaining: Math.max(0, QUESTION_TIME_S - elapsedSince(a.served_at)),
            score: a.score,
            correct: a.correct,
            answers: a.answers.map((x) => x.gain > 0)
          };
        }
      }
      if (a.finished_at) {
        await saveAttempt(client, userId, day, a);
        return reply.code(409).send({ error: 'Tu as déjà joué le quiz du jour.', finished: true });
      }
      a = { ...a, served_at: new Date() };
      await saveAttempt(client, userId, day, a);
      const q = quiz[a.current_index];
      return {
        index: a.current_index,
        total: quiz.length,
        text: q.q,
        choices: q.choices,
        timeLimit: QUESTION_TIME_S,
        remaining: QUESTION_TIME_S,
        score: a.score,
        correct: a.correct,
        answers: a.answers.map((x) => x.gain > 0)
      };
    });
  });

  /** Réponse à la question en cours ; pick = -1 quand le temps est écoulé. */
  app.post('/quiz/today/answer', { preHandler: requireVerified }, async (req, reply) => {
    const userId = req.userId!;
    const day = quizDay();
    const body = (req.body ?? {}) as Record<string, unknown>;
    const index = Number(body.index);
    const pick = Number(body.pick);
    return inTransaction(async (client) => {
      const quiz = await dailyQuiz(client, day);
      const a = await lockAttempt(client, userId, day);
      if (!a || a.finished_at || !a.served_at || index !== a.current_index) {
        return reply.code(409).send({ error: "Cette question n'est plus en cours." });
      }
      const q = quiz[a.current_index];
      if (!Number.isInteger(pick) || pick < -1 || pick >= q.choices.length) {
        return reply.code(400).send({ error: 'Réponse invalide.' });
      }
      const elapsed = elapsedSince(a.served_at);
      const late = elapsed > QUESTION_TIME_S + NETWORK_GRACE_S;
      const result = applyAnswer(a, quiz, late ? -1 : pick, Math.min(QUESTION_TIME_S, elapsed));
      await saveAttempt(client, userId, day, result.next);
      return {
        correct: result.ok,
        late,
        gain: result.gain,
        good: q.good,
        answer: q.answer,
        ref: q.ref,
        score: result.next.score,
        correctCount: result.next.correct,
        finished: !!result.next.finished_at
      };
    });
  });

  /** Correction complète, une fois le quiz du jour terminé. */
  app.get('/quiz/today/review', { preHandler: requireVerified }, async (req, reply) => {
    const day = quizDay();
    const { rows } = await db.query<AttemptRow>(
      'SELECT current_index, served_at, combo, score, correct, answers, finished_at FROM attempts WHERE user_id = $1 AND day = $2',
      [req.userId, day]
    );
    const a = rows[0];
    if (!a?.finished_at) return reply.code(409).send({ error: "Termine d'abord le quiz du jour." });
    const quiz = await dailyQuiz(db, day);
    return {
      day,
      score: a.score,
      correct: a.correct,
      items: quiz.map((q, i) => ({
        q: q.q,
        choices: q.choices,
        good: q.good,
        answer: q.answer,
        ref: q.ref,
        pick: a.answers[i]?.pick ?? -1,
        gain: a.answers[i]?.gain ?? 0
      }))
    };
  });

  /** Classement du jour, des 7 derniers jours ou depuis toujours. */
  app.get('/leaderboard', async (req, reply) => {
    const period = (req.query as Record<string, string>).period ?? 'day';
    if (period !== 'day' && period !== 'week' && period !== 'all') {
      return reply.code(400).send({ error: 'Période inconnue.' });
    }
    return leaderboard(period, quizDay(), req.userId);
  });
}
