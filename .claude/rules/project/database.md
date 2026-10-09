---
paths:
  - "__MIGRATION_GLOBS__"
  - "__SCHEMA_GLOBS__"
---
<!--
  Project rule (owned by this project, at most 80 lines). Loads only when Claude works on
  migrations, schema or model files. The two __..._GLOBS__ entries are placeholders that match
  nothing: /team:new-project replaces them with the stack's globs (MIGRATIONS_GLOB in
  ops/project.conf, plus the models or schema folder).
-->
# Database and migrations

## Expand/contract, always
Rollback redeploys older code and never runs a down migration, so every migration must work
with both the previous release's code and the new one:
1. Expand: add new tables or columns as nullable or with a default. Add, don't change.
2. Migrate: backfill in batches; the new code writes both old and new shapes if needed.
3. Switch: the code reads the new shape (behind a flag when it's a feature).
4. Contract: drop or rename the old column only in a later release, once no deployed code uses it.

- Never rename or drop a column, table or index in the same release that stops using it.
- Dropping or renaming tables or columns, and deleting data, are destructive: the PR is guarded and
  waits for the owner's yes. Say so in the PR report's risks line.
- Don't edit a migration that has already merged; add a new one.
- Avoid long locks on big tables: batch backfills, and build indexes the non-blocking way where the engine
  supports it.
- Migrations run on every deploy through MIGRATE_CMD, before the switch to the new release, and on
  production right after a backup. A failing migration stops the deploy.

## Time columns
- Timestamps are stored in UTC: Postgres `timestamptz`; MySQL and MariaDB `DATETIME` written as UTC
  with the session time zone set to `+00:00`. Never the server's local time.
- Store dates that are local by nature (a birthday, a business day) as plain dates, and name the
  timezone the business day belongs to.

## Personal data
- Every new column that can hold personal data (name, email, phone, address, birth date, tokens,
  passwords, notes about a person) gets a line in `ops/anonymize` in the same PR: a rule, or an
  ignore with a reason. The PII guard in ci fails without it.
- Secrets and tokens are stored hashed, or encrypted when they must be read back.

## Feature flags
- Flags live in the `feature_flags` table (`name`, `enabled`, `updated_at`, `updated_by`). A new
  flag is added by migration, enabled on staging and off on production.

## Connections and data
- Connect with DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASSWORD from the env file; never rely on a
  default socket or port.
- Seed data is fake only (see `ops/anonymize` for the allowed email domains).

<!-- Stack-specific additions (migration tool, naming, how to generate one) go below this line. -->
