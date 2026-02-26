-- TimescaleDB schema for Tenmás engineering metrics
-- Run: psql "$TIMESCALE_URL" -f infra/timescale/schema.sql

CREATE EXTENSION IF NOT EXISTS timescaledb;

-- PR metrics (raw, one row per merged PR)
CREATE TABLE IF NOT EXISTS pr_metrics (
  time                 TIMESTAMPTZ NOT NULL,
  repo                 TEXT NOT NULL,
  pr_number            INTEGER NOT NULL,
  author               TEXT,
  opened_at            TIMESTAMPTZ,
  merged_at            TIMESTAMPTZ,
  cycle_time_hours     FLOAT,
  additions            INTEGER DEFAULT 0,
  deletions            INTEGER DEFAULT 0,
  ai_assisted          BOOLEAN DEFAULT FALSE,
  has_tests            BOOLEAN DEFAULT FALSE
);

SELECT create_hypertable('pr_metrics', 'time', if_not_exists => TRUE);

-- Weekly aggregates (pre-computed for Grafana performance)
CREATE TABLE IF NOT EXISTS weekly_metrics (
  week                    DATE NOT NULL,
  repo                    TEXT NOT NULL,
  prs_merged              INTEGER DEFAULT 0,
  avg_cycle_time_hours    FLOAT,
  bug_prs                 INTEGER DEFAULT 0,
  ai_prs                  INTEGER DEFAULT 0,
  PRIMARY KEY (week, repo)
);

-- Test coverage (populated from CI)
CREATE TABLE IF NOT EXISTS test_coverage (
  time          TIMESTAMPTZ NOT NULL,
  repo          TEXT NOT NULL,
  coverage_pct  FLOAT NOT NULL,
  branch        TEXT DEFAULT 'main'
);

SELECT create_hypertable('test_coverage', 'time', if_not_exists => TRUE);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pr_metrics_repo ON pr_metrics (repo, time DESC);
CREATE INDEX IF NOT EXISTS idx_test_coverage_repo ON test_coverage (repo, time DESC);
