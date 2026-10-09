# Feature flags

New features ship behind a flag; bug fixes don't. Each flag is a row in the `feature_flags` table
(`name`, `enabled`, `updated_at`, `updated_by`). Staging seeds every flag on. Production starts
off and is switched by the owner with `ops/flag production <name> on|off` once the client approves.

Rules for this registry:
- `/team:build-feature` adds a row when it creates a flag. Name it after the issue, for example
  `orders-csv-export` for #12. Names match `[a-z0-9][a-z0-9_-]{0,63}`.
- `created` is the date the flag was added, as `YYYY-MM-DD` in UTC.
- `status` is `active` while the flag exists in code, and `removed` once the flag and its old code
  path are deleted. Keep removed rows for history.
- The weekly health check flags rows that have been `active` for a long time, so they don't go stale.

| flag | issue | created | status |
|---|---|---|---|
