-- ============================================================
-- DSAlytics — Production-Grade PostgreSQL Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50)     NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    display_name    VARCHAR(100),
    avatar_url      TEXT,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email)
);

-- ============================================================
-- 2. platforms
-- ============================================================
CREATE TABLE platforms (
    id          SMALLINT        PRIMARY KEY,
    name        VARCHAR(50)     NOT NULL,
    slug        VARCHAR(30)     NOT NULL,
    base_url    TEXT            NOT NULL,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_platforms_name UNIQUE (name),
    CONSTRAINT uq_platforms_slug UNIQUE (slug)
);

-- Seed data
INSERT INTO platforms (id, name, slug, base_url) VALUES
    (1, 'Codeforces',    'codeforces',    'https://codeforces.com'),
    (2, 'CodeChef',      'codechef',      'https://www.codechef.com'),
    (3, 'LeetCode',      'leetcode',      'https://leetcode.com'),
    (4, 'GeeksForGeeks', 'geeksforgeeks', 'https://www.geeksforgeeks.org'),
    (5, 'CSES',          'cses',          'https://cses.fi'),
    (6, 'AtCoder',       'atcoder',       'https://atcoder.jp'),
    (7, 'Project Euler', 'projecteuler',  'https://projecteuler.net');

-- ============================================================
-- 3. user_platform_handles
-- ============================================================
CREATE TABLE user_platform_handles (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform_id     SMALLINT        NOT NULL REFERENCES platforms(id),
    handle          VARCHAR(100)    NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    last_synced_at  TIMESTAMPTZ,
    sync_cursor     TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_platform_handle
        UNIQUE (user_id, platform_id, handle)
);

-- ============================================================
-- 4. problems
-- ============================================================
CREATE TABLE problems (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id     SMALLINT        NOT NULL REFERENCES platforms(id),
    external_id     VARCHAR(100)    NOT NULL,
    title           VARCHAR(500)    NOT NULL,
    url             TEXT            NOT NULL,
    difficulty      VARCHAR(30),
    tags            TEXT[],
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    CONSTRAINT uq_platform_problem
        UNIQUE (platform_id, external_id)
);

-- ============================================================
-- 5. submissions
-- ============================================================
CREATE TABLE submissions (
    id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_platform_handle_id     UUID            NOT NULL
        REFERENCES user_platform_handles(id) ON DELETE CASCADE,
    problem_id                  UUID            NOT NULL
        REFERENCES problems(id),
    submitted_at                TIMESTAMPTZ     NOT NULL,
    language                    VARCHAR(50),
    submission_external_id      VARCHAR(100),
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    -- Idempotency: same handle + problem + exact timestamp = duplicate
    CONSTRAINT uq_submission
        UNIQUE (user_platform_handle_id, problem_id, submitted_at)
);

-- ============================================================
-- 6. daily_activity
-- ============================================================
CREATE TABLE daily_activity (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date   DATE        NOT NULL,
    total_count     INTEGER     NOT NULL DEFAULT 0 CHECK (total_count >= 0),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_daily_activity
        UNIQUE (user_id, activity_date)
);

-- ============================================================
-- 7. daily_platform_activity
-- ============================================================
CREATE TABLE daily_platform_activity (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform_id     SMALLINT    NOT NULL REFERENCES platforms(id),
    activity_date   DATE        NOT NULL,
    count           INTEGER     NOT NULL DEFAULT 0 CHECK (count >= 0),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_daily_platform_activity
        UNIQUE (user_id, platform_id, activity_date)
);

-- ============================================================
-- Indexes
-- ============================================================

-- — users —————————————————————————————————————
CREATE INDEX idx_users_email       ON users (email);
CREATE INDEX idx_users_username    ON users (username);

-- — user_platform_handles ————————————————————
CREATE INDEX idx_uph_user_id       ON user_platform_handles (user_id);
CREATE INDEX idx_uph_platform      ON user_platform_handles (platform_id);

-- — problems —————————————————————————————————
CREATE INDEX idx_problems_platform ON problems (platform_id);
CREATE INDEX idx_problems_tags     ON problems USING GIN (tags);

-- — submissions ——————————————————————————————
CREATE INDEX idx_sub_handle        ON submissions (user_platform_handle_id);
CREATE INDEX idx_sub_submitted     ON submissions (submitted_at);
CREATE INDEX idx_sub_problem       ON submissions (problem_id);

-- — daily_activity ———————————————————————————
CREATE INDEX idx_da_user_date      ON daily_activity (user_id, activity_date DESC);

-- — daily_platform_activity ——————————————————
CREATE INDEX idx_dpa_user_date     ON daily_platform_activity (user_id, activity_date DESC);
CREATE INDEX idx_dpa_platform      ON daily_platform_activity (platform_id);
