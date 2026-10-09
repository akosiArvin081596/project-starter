# Runbook: restore from backup

For data loss or corruption in production, not for bad code (that's `docs/runbooks/rollback.md`).
Only the owner does this, from their own terminal. Connecting to the server needs the owner's yes,
and agents never do it.

## What exists
- Nightly backups at `LOW_TRAFFIC_HOUR` in the project timezone. There are also pre-deploy backups
  before every production deploy, and a weekly `backup --verify` restore test.
- On the server, in `/var/lib/team/<project>/backups/` (root only):
  - nightly: `backup-<utc>.sql.gz`, the last 14 kept
  - pre-deploy: `backup-<utc>-pre-deploy.sql.gz`, the last 5 kept

  File names use UTC times; convert them to the project timezone before you talk to the client.
- The off-server copy is not set up yet (a TODO in dev-standards); until it is, a lost server means
  lost backups.

## Steps
Placeholders: `<project>` is `PROJECT_NAME`. `<db>` and `<db_user>` are `DB_NAME` and `DB_USER` in
`/etc/team/projects/<project>-production.conf`. `<file>` is the backup you choose.

1. **Decide and tell.** Pick the newest backup from before the damage. Everything written after it
   is lost. Tell the client the restore point, naming the timezone.
2. **Connect.** Use your usual server alias from `defaults.conf`.
3. **Back up the current state first**, even if damaged:
   `sudo /usr/local/lib/team/backup <project> --pre-deploy`.
4. **Restore into a new database**, not over the live one:
   - Postgres:
     - `sudo -u postgres createdb -O <db_user> -T template0 <db>_restore`
     - `gunzip -c <file> | sudo -u postgres psql -X -v ON_ERROR_STOP=1 -d <db>_restore`
   - MySQL/MariaDB: create `<db>_restore` (utf8mb4), grant `<db_user>` on it, then
     `gunzip -c <file> | sudo mysql <db>_restore`.
5. **Check** the restored database: the expected tables exist, row counts look right, and the
   records you care about are there.
6. **Swap**, with the app stopped:
   - Stop the app: `sudo systemctl stop 'team-<project>-production-*.service'`.
   - Postgres: rename the live database away, then rename the restore into its place:
     - `ALTER DATABASE <db> RENAME TO <db>_broken_<utc>;`
     - `ALTER DATABASE <db>_restore RENAME TO <db>;`
   - MySQL/MariaDB: there is no rename, so do this instead:
     - Drop and re-create `<db>`, but only after step 3 succeeded.
     - Restore `<file>` into it, as in step 4.
     - Drop `<db>_restore`.
7. **Migrate if needed.** If migrations ran after the backup was taken, run the current release's
   migrations. Use the app's own user and env file:
   `sudo systemd-run --wait --pipe --uid=<project>-production --gid=<project>-production -p WorkingDirectory=/srv/team/<project>/production/current -p EnvironmentFile=/srv/team/<project>/production/shared/.env /bin/bash -c '<MIGRATE_CMD>'`
8. **Start and check.** `sudo systemctl start 'team-<project>-production-*.service'`, then open the
   health URL.
9. **Clean up later.** Keep `<db>_broken_<utc>` until you're sure, then drop it by its exact name.

## Afterwards
- The next nightly snapshot picks up the restored data automatically.
- Write a short note in the incident issue (no customer data). If the cause was a design flaw, record
  the fix in `docs/decisions/`.
