-- Vérification de l'adresse e-mail par code à 6 chiffres.
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ;

-- Un code en cours par compte et par usage ; seul son empreinte est gardée.
CREATE TABLE email_codes (
  user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  purpose    TEXT        NOT NULL CHECK (purpose IN ('verify')),
  code_hash  TEXT        NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts   SMALLINT    NOT NULL DEFAULT 0,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, purpose)
);
