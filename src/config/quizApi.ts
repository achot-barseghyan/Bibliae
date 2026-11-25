// Adresse de l'API du quiz du jour (dossier server/ : Node + PostgreSQL).
// En développement : `docker compose up -d` dans server/, puis
//  - navigateur (npm run dev)      : http://localhost:3000 (défaut)
//  - émulateur Android             : VITE_QUIZ_API_URL=http://10.0.2.2:3000
//  - appareil USB                  : adb reverse tcp:3000 tcp:3000 (garde localhost)
// En production, définir VITE_QUIZ_API_URL (https) au moment du build.
export const QUIZ_API_URL: string = (import.meta.env.VITE_QUIZ_API_URL as string | undefined) || 'http://localhost:3000';
