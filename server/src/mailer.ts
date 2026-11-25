import { readFileSync } from 'node:fs';
import nodemailer from 'nodemailer';

// Envoi des e-mails par SMTP (n'importe quel fournisseur : Brevo, OVH, Gmail…).
// En développement, docker compose fournit Mailpit : http://localhost:8025.
const SMTP_URL = process.env.SMTP_URL ?? '';
const MAIL_FROM = process.env.MAIL_FROM ?? 'Bibliae <no-reply@bibliae.app>';

const transport = SMTP_URL ? nodemailer.createTransport(SMTP_URL) : null;

export const mailConfigured = transport != null;

/** Gabarit du design « Code de confirmation » (templates/), variables {{nom}}. */
const VERIFY_TEMPLATE = readFileSync(new URL('../templates/verify-code.html', import.meta.url), 'utf8');

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Remplit un gabarit ; toutes les valeurs sont échappées. */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in vars)) throw new Error(`Variable de gabarit manquante : ${key}`);
    return escapeHtml(vars[key]);
  });
}

export function verificationEmail(pseudo: string, code: string): { subject: string; html: string; text: string } {
  const spaced = `${code.slice(0, 3)} ${code.slice(3)}`;
  const digits = Object.fromEntries([...code].map((d, i) => [`d${i + 1}`, d]));
  return {
    subject: `${spaced} — ton code Bibliae`,
    html: fillTemplate(VERIFY_TEMPLATE, { pseudo, code, codeSpaced: spaced, ...digits }),
    text:
      `Bonjour ${pseudo},\n\n` +
      `Voici ton code pour entrer dans Bibliae : ${spaced}\n` +
      `Il est valable 15 minutes.\n\n` +
      `« Voici que je me tiens à la porte, et je frappe. » (Apocalypse 3, 20)\n\n` +
      `Tu n'as pas créé de compte Bibliae ? Ignore ce message, rien ne sera fait sans ce code. ` +
      `Ne le transmets à personne : l'équipe Bibliae ne te le demandera jamais.\n\n` +
      `Paix et joie,\nL'équipe Bibliae\ncontact@bibliae.app\n`
  };
}

/** E-mail contenant le code de vérification de l'adresse. */
export async function sendVerificationCode(to: string, pseudo: string, code: string): Promise<void> {
  if (!transport) throw new Error('SMTP_URL manquant : impossible d’envoyer des e-mails.');
  await transport.sendMail({ from: MAIL_FROM, to, ...verificationEmail(pseudo, code) });
}
