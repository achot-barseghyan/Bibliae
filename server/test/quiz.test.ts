import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { drawDailyQuiz, gainFor, quizDay, secondsUntilNextQuiz, shiftDay, type PoolQuestion } from '../src/quiz.ts';

const pool = JSON.parse(readFileSync(new URL('../data/questions.json', import.meta.url), 'utf8')) as PoolQuestion[];

test('le tirage du jour est déterministe et différent le lendemain', () => {
  const a = drawDailyQuiz(pool, '2026-11-25');
  const b = drawDailyQuiz(pool, '2026-11-25');
  const c = drawDailyQuiz(pool, '2026-11-26');
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.map((q) => q.id), c.map((q) => q.id));
  assert.equal(a.length, 20);
  assert.equal(new Set(a.map((q) => q.id)).size, 20);
});

test('chaque question a sa bonne réponse parmi des propositions distinctes', () => {
  for (const day of ['2026-01-01', '2026-06-15', '2026-11-25', '2027-02-28']) {
    for (const q of drawDailyQuiz(pool, day)) {
      assert.ok(q.good >= 0 && q.good < q.choices.length, q.q);
      assert.equal(new Set(q.choices.map((c) => c.toLowerCase())).size, q.choices.length, q.q);
      assert.ok(q.choices.length === 2 || q.choices.length === 4, q.q);
    }
  }
});

test('barème : 100 + vitesse (≤ 50) + 20 dès 3 bonnes réponses d’affilée', () => {
  assert.equal(gainFor(0, 1), 150);
  assert.equal(gainFor(20, 1), 100);
  assert.equal(gainFor(10, 2), 125);
  assert.equal(gainFor(10, 3), 145);
  assert.equal(gainFor(99, 1), 100);
});

test('jour de Paris et décalage de date', () => {
  assert.equal(quizDay(new Date('2026-11-25T23:30:00Z')), '2026-11-26');
  assert.equal(quizDay(new Date('2026-07-01T21:59:00Z')), '2026-07-01');
  assert.equal(shiftDay('2026-03-01', -1), '2026-02-28');
  assert.equal(secondsUntilNextQuiz(new Date('2026-11-25T22:59:00Z')), 60);
});

test('e-mail de code : chiffres placés, pseudo échappé, aucune variable restante', async () => {
  const { verificationEmail } = await import('../src/mailer.ts');
  const mail = verificationEmail('<Théo & co>', '070412');
  assert.equal(mail.subject, '070 412 — ton code Bibliae');
  assert.ok(mail.html.includes('&lt;Théo &amp; co&gt;'));
  assert.ok(!mail.html.includes('<Théo'));
  assert.ok(mail.html.includes('>070412</span>'));
  assert.ok(!/\{\{\w+\}\}/.test(mail.html));
  assert.equal([...mail.html.matchAll(/class="tile d\d"[^>]*>(\d)<\/td>/g)].map((m) => m[1]).join(''), '070412');
});
