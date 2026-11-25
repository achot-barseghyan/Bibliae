-- Comptes, banque de questions, tirages quotidiens et parties.

CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  pseudo        TEXT        NOT NULL CHECK (char_length(pseudo) BETWEEN 3 AND 16),
  email         TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  avatar        SMALLINT    NOT NULL DEFAULT 0 CHECK (avatar BETWEEN 0 AND 5), -- élargi à 0..7 par 002
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_pseudo_key ON users (lower(pseudo));
CREATE UNIQUE INDEX users_email_key  ON users (lower(email));

-- Banque de questions, synchronisée au démarrage depuis data/questions.json.
CREATE TABLE questions (
  id     INTEGER PRIMARY KEY,
  text   TEXT    NOT NULL,
  answer TEXT    NOT NULL,
  ref    TEXT    NOT NULL DEFAULT '',
  kind   TEXT    NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Tirage figé du jour : le quiz d'une date ne change plus, même si la banque évolue.
-- questions : [{ id, q, choices, good, answer, ref }]
CREATE TABLE daily_quizzes (
  day        DATE        PRIMARY KEY,
  questions  JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Une partie par joueur et par jour. Le serveur sert les questions une à une
-- et chronomètre lui-même chaque réponse (served_at).
-- answers : [{ pick, elapsed, gain }] ; pick = -1 quand le temps est écoulé.
CREATE TABLE attempts (
  user_id       BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  day           DATE        NOT NULL REFERENCES daily_quizzes (day),
  current_index SMALLINT    NOT NULL DEFAULT 0,
  served_at     TIMESTAMPTZ,
  combo         SMALLINT    NOT NULL DEFAULT 0,
  score         INTEGER     NOT NULL DEFAULT 0,
  correct       SMALLINT    NOT NULL DEFAULT 0,
  answers       JSONB       NOT NULL DEFAULT '[]',
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ,
  PRIMARY KEY (user_id, day)
);
CREATE INDEX attempts_finished_day ON attempts (day, score DESC) WHERE finished_at IS NOT NULL;
