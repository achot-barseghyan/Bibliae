import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { authRoutes, readUser } from './auth.ts';
import { db, migrate, syncQuestions } from './db.ts';
import { quizRoutes } from './quizRoutes.ts';

// Origines de l'app : Capacitor Android (https://localhost), iOS
// (capacitor://localhost) et le serveur Vite en développement.
const DEFAULT_ORIGINS = ['https://localhost', 'capacitor://localhost', 'http://localhost', 'http://localhost:5173'];
const origins = (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
  trustProxy: process.env.TRUST_PROXY === 'true',
  bodyLimit: 16 * 1024
});

await app.register(cors, {
  origin: origins.length ? origins : DEFAULT_ORIGINS,
  methods: ['GET', 'POST', 'DELETE']
});
await app.register(rateLimit, { global: false });
app.decorateRequest('userId', null);
app.addHook('onRequest', readUser);

app.get('/health', async () => {
  await db.query('SELECT 1');
  return { ok: true };
});
await app.register(authRoutes);
await app.register(quizRoutes);

await migrate();
const count = await syncQuestions();
app.log.info(`${count} questions dans la banque`);

const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: '0.0.0.0' });

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    await app.close();
    await db.end();
    process.exit(0);
  });
}
