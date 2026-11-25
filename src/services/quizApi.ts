import { Preferences } from '@capacitor/preferences';
import { QUIZ_API_URL } from '../config/quizApi';

// Client de l'API du quiz du jour. Le serveur garde les bonnes réponses et
// chronomètre chaque question : l'app n'affiche que ce qu'il renvoie.

const TOKEN_KEY = 'bibliae.quiz.token';

export interface QuizUser {
  id: number;
  pseudo: string;
  avatar: number;
  email: string;
  emailVerified: boolean;
}

export interface QuizToday {
  day: string;
  secondsLeft: number;
  total: number;
  timeLimit: number;
  players: number;
  streak: number;
  attempt: {
    status: 'none' | 'in_progress' | 'finished';
    index: number;
    score: number;
    correct: number;
    rank: number | null;
  };
}

export interface QuizQuestion {
  index: number;
  total: number;
  text: string;
  choices: string[];
  timeLimit: number;
  remaining: number;
  score: number;
  correct: number;
  /** Réussite des questions déjà répondues, dans l'ordre. */
  answers: boolean[];
}

export interface QuizAnswerResult {
  correct: boolean;
  late: boolean;
  gain: number;
  good: number;
  answer: string;
  ref: string;
  score: number;
  correctCount: number;
  finished: boolean;
}

export interface QuizReview {
  day: string;
  score: number;
  correct: number;
  items: { q: string; choices: string[]; good: number; answer: string; ref: string; pick: number; gain: number }[];
}

export type LeaderboardPeriod = 'day' | 'week' | 'all';

export interface LeaderboardEntry {
  rank: number;
  pseudo: string;
  avatar: number;
  score: number;
  correct: number;
  played: number;
  me: boolean;
}

export interface Leaderboard {
  period: LeaderboardPeriod;
  total: number;
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

export class QuizApiError extends Error {
  readonly status: number;
  /** Code machine renvoyé par le serveur (ex. « email_unverified »). */
  readonly code: string;
  /** Secondes avant de pouvoir redemander un code, le cas échéant. */
  readonly retryIn: number;
  constructor(status: number, message: string, code = '', retryIn = 0) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryIn = retryIn;
  }
}

let token: string | null = null;
let tokenLoaded = false;

async function loadToken(): Promise<string | null> {
  if (!tokenLoaded) {
    token = (await Preferences.get({ key: TOKEN_KEY })).value;
    tokenLoaded = true;
  }
  return token;
}

async function saveToken(value: string | null): Promise<void> {
  token = value;
  tokenLoaded = true;
  if (value) await Preferences.set({ key: TOKEN_KEY, value });
  else await Preferences.remove({ key: TOKEN_KEY });
}

async function request<T>(method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const tok = await loadToken();
  let response: Response;
  try {
    response = await fetch(QUIZ_API_URL + path, {
      method,
      headers: {
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        ...(tok ? { Authorization: `Bearer ${tok}` } : {})
      },
      body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined
    });
  } catch {
    throw new QuizApiError(0, 'Impossible de joindre le serveur du quiz. Vérifie ta connexion.');
  }
  if (response.status === 401 && tok && !path.startsWith('/auth/')) {
    await saveToken(null);
  }
  const text = await response.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!response.ok) {
    const message = typeof data.error === 'string' ? data.error : 'Une erreur est survenue. Réessaie dans un instant.';
    throw new QuizApiError(
      response.status,
      message,
      typeof data.code === 'string' ? data.code : '',
      typeof data.retryIn === 'number' ? data.retryIn : 0
    );
  }
  return data as T;
}

export async function hasQuizSession(): Promise<boolean> {
  return !!(await loadToken());
}

/** Crée le compte ; le serveur envoie aussitôt un code de vérification (codeSent). */
export async function signup(input: {
  pseudo: string;
  email: string;
  password: string;
  avatar: number;
}): Promise<{ user: QuizUser; codeSent: boolean }> {
  const res = await request<{ token: string; user: QuizUser; codeSent: boolean }>('POST', '/auth/signup', input);
  await saveToken(res.token);
  return { user: res.user, codeSent: res.codeSent };
}

/** (Re)envoie le code de vérification ; retryIn : secondes avant le prochain envoi possible. */
export const sendVerificationCode = () =>
  request<{ sent: boolean; alreadyVerified: boolean; retryIn: number }>('POST', '/auth/verify/send');

/** Confirme l'adresse e-mail avec le code reçu. */
export async function verifyEmail(code: string): Promise<QuizUser> {
  return (await request<{ user: QuizUser }>('POST', '/auth/verify', { code })).user;
}

export async function login(input: { email: string; password: string }): Promise<QuizUser> {
  const res = await request<{ token: string; user: QuizUser }>('POST', '/auth/login', input);
  await saveToken(res.token);
  return res.user;
}

export async function logout(): Promise<void> {
  await saveToken(null);
}

export async function fetchMe(): Promise<QuizUser> {
  return (await request<{ user: QuizUser }>('GET', '/me')).user;
}

export async function deleteAccount(): Promise<void> {
  await request('DELETE', '/me');
  await saveToken(null);
}

export const fetchToday = () => request<QuizToday>('GET', '/quiz/today');
export const nextQuestion = () => request<QuizQuestion>('POST', '/quiz/today/next');
export const sendAnswer = (index: number, pick: number) =>
  request<QuizAnswerResult>('POST', '/quiz/today/answer', { index, pick });
export const fetchReview = () => request<QuizReview>('GET', '/quiz/today/review');
export const fetchLeaderboard = (period: LeaderboardPeriod) =>
  request<Leaderboard>('GET', `/leaderboard?period=${period}`);
