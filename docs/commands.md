# Commands

Every project uses the same command names, whatever its stack. The Makefile maps them to the
stack's tools; the pack's `team-*` commands come from the `team` plugin (dev-standards).

## Make targets

| Target | What it does | Used by |
|---|---|---|
| `make help` | lists the targets (default) | you |
| `make setup` | installs dependencies and prepares this checkout | `team-new-worktree`, ci |
| `make dev` | runs the app on `PORT` from the env file | `team-app up` |
| `make lint` | linters and type checks | pre-push hook, ci |
| `make format-check` | checks formatting without changing files | pre-commit hook |
| `make test` | fast tests (unit and integration), with `TZ=UTC` | pre-push hook, ci |
| `make e2e` | Playwright smoke and timezone tests in `e2e/` against `BASE_URL` or `APP_URL` | `team-qa`, pipeline (staging) |
| `make build` | builds the release into `ARTIFACT_DIR` (default `.team/artifact`) | ci, pipeline |
| `make audit` | dependency audit (known vulnerabilities) | ci |
| `make migrate` | applies migrations (`MIGRATE_CMD` on every deploy) | deploys, `team-db-pull` |
| `make seed` | loads fake seed data (`SEED_CMD`) | `team-db-pull` before the first snapshot |
| `make db-pull` | restores the cached sanitized snapshot into this worktree's database, then migrates | you, `fix-bug` |
| `make db-pull FRESH=1` | downloads the newest sanitized snapshot first | `fix-bug` |
| `make anonymize-check` | proves `ops/anonymize` covers the schema, against fake seed data | ci |
| `make hooks` | points git at `.githooks/` through `team-hooks` (chains to an existing hooks path) | once per clone |

**Not configured yet.** A target the project hasn't filled in prints
`not configured: fill in for your stack` on stderr and its recipe exits 3. GNU make itself then
exits 2 and reports `Error 3`. CI, the git hooks and the `team-*` commands read that as
"not set up yet": they skip with a notice instead of failing, and a `main` run with an unconfigured
build doesn't open `main-red`.

**Filling a target in.** Replace the `$(NOT_CONFIGURED)` line with the stack's command. Keep
`make build` filling `ARTIFACT_DIR` with exactly what gets deployed, including whatever
`MIGRATE_CMD` needs on the server (the pipeline adds `ops/` itself). The Makefile must keep working
with GNU Make 3.81 (macOS): no `.ONESHELL`, `.RECIPEPREFIX`, `undefine` or grouped targets.

**Variables.**
- `FRESH=1`: `make db-pull` downloads first.
- `E2E_ARGS`: extra Playwright arguments, for example `make e2e E2E_ARGS="tests/smoke.spec.ts"`.
- `ARTIFACT_DIR`: overrides `ops/project.conf`.
- `TEAM_BIN`: the plugin's `bin/` folder, for running `make hooks` or `make db-pull` outside
  Claude Code. It is read from the environment or from the pack's `defaults.conf`.

## Browser tests (`e2e/`)
`e2e/` has its own `package.json`, so it works next to any stack. `make e2e` installs it on first use
(`npm ci`) and runs headless Chromium. Settings, in order of precedence: environment variables, then the
worktree env file, then `ops/project.conf`.
- `BASE_URL` or `APP_URL`: the app under test
- `APP_TIMEZONE` or `PROJECT_TIMEZONE`: the browser's timezone (default UTC)
- `HEALTH_PATH`: default `/health`
- `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD`: for staging

Reports, traces and failure screenshots go to `.team/e2e/` (gitignored). A new machine needs the
browser once: `cd e2e && npx playwright install chromium`.

## Git hooks (`.githooks/`)
- `commit-msg`: Conventional Commits subjects (`feat(scope): …`, `!` for breaking changes).
- `pre-commit`: gitleaks on the staged changes (skipped with a notice if gitleaks isn't installed),
  then `make format-check`.
- `pre-push`: refuses pushes to `main` and any tag. Requires branch names like `feat/12-login` or
  `chore/initial-stack`. Then runs `make lint` and `make test`.

## Pack commands (the `team` plugin)
Inside Claude Code these are on PATH. Run them in the project root. Details: `<command> --help`.

| Command | What it does |
|---|---|
| `team-new-worktree <issue>` | creates a worktree, branch, port, env file and database for an issue |
| `team-remove-worktree <path or issue>` | stops the app, drops the recorded database, removes the worktree |
| `team-app up / down / status` | runs `make dev` in the background and waits for the health path |
| `team-db-pull [--fresh]` | behind `make db-pull` |
| `team-hooks [--check]` | behind `make hooks`; the only way to set the hooks path |
| `team-gh <gh args>` | every GitHub write the agents make (PRs, comments, issues, auto-merge) |
| `team-post-check <sha> <context> <state> <description>` | posts `ai-review`, `ai-security` or `ai-qa` |
| `team-sync [--init] [--to <tag>] [--check]` | brings managed files and workflow pins up to a dev-standards release |
| `team-conflict-check <issue>…` | says which issues touch the same files |
| `team-verify-repo <owner/repo>` | reads the repo's GitHub settings back and prints a pass/fail table |

These need the owner's yes, because they change GitHub settings or connect to the server:
`team-bootstrap-repo … --apply`, `team-discover`, `team-provision <env> [--apply]`,
`team-flag <env> <name> on|off` (and `ops/flag`, which calls it), and `team-refresh-staging`.
Production flags, production deploys and rollbacks are the owner's alone (see `docs/runbooks/`).
