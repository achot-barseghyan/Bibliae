-- Huit médaillons en vitrail (0 à 7) au lieu de six.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_avatar_check;
ALTER TABLE users ADD CONSTRAINT users_avatar_check CHECK (avatar BETWEEN 0 AND 7);
