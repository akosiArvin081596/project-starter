<!--
  CLAUDE.md holds only facts every session needs. Budget: 150 lines (the context check in ci
  enforces it, together with the rule files). No procedures (skills hold those), no review
  checklists (agents hold those), nothing repeated from .claude/rules/, and no at-sign imports:
  mention docs as plain backtick paths so they are read only when needed.
  /team:new-project fills in every <placeholder> below. Notes for humans go in HTML comments
  like this one; they are stripped before Claude sees the file.
-->
# <Project name>

<One line: what this project does and for whom.>

## Project
- Owner / client: <me, or the client's name>
- Timezone: <IANA name, e.g. Asia/Manila> (`ops/project.conf` PROJECT_TIMEZONE, `.env.example` APP_TIMEZONE)
- Environments: staging deploys every merge to main; production runs release tags vX.Y.Z after the client approves on staging.
- Visibility: <public | private>. <!-- Private repos use the private fallback: see the dev-standards docs. -->

## Stack
- Language and framework: <e.g. the backend and frontend frameworks and their versions>
- Database: <postgres | mysql | mariadb | none> (DB_ENGINE in `ops/project.conf`)
- Web mode: <proxy | php-fpm | static> (WEB_MODE)
- Browser tests: Playwright in `e2e/`, with its own `e2e/package.json`

## Repo map
- <app folders: one line each, e.g. where the server code, the frontend, migrations and tests live>
- `e2e/`: Playwright smoke and timezone tests (settings in `e2e/settings.ts`)
- `ops/`: what the server and pipeline read: `ops/project.conf`, `ops/services.conf`, `ops/anonymize`, `ops/flag`, `ops/env/`
- `docs/`: `docs/architecture.md`, `docs/commands.md`, `docs/flags.md`, `docs/decisions/`, `docs/runbooks/`
- `.claude/rules/team/`: managed by dev-standards, never edited here. `.claude/rules/project/`: this project's path-scoped rules.
- `.githooks/`: commit-msg, pre-commit and pre-push checks (installed by `make hooks`)

## Shared commands
Every stack uses the same make targets; details and the pack commands are in `docs/commands.md`.
A target that isn't set up yet prints "not configured: fill in for your stack" and its recipe exits 3.
- `make setup`: install dependencies and prepare this checkout
- `make dev`: run the app on PORT from the env file
- `make lint`: linters and type checks
- `make test`: fast tests
- `make e2e`: Playwright tests against APP_URL
- `make build`: build the release into ARTIFACT_DIR
- `make audit`: dependency audit
- `make migrate`: apply migrations
- `make db-pull`: restore the sanitized snapshot into this worktree's database (`make db-pull FRESH=1` downloads the newest first)
- `make anonymize-check`: prove `ops/anonymize` covers the schema
- `make hooks`: install the git hooks

## Gotchas
- <none yet: add one line per trap that every session must know about>

## Context and blocks
- New lessons go on the `Lessons:` line of the PR report; `/team:tidy-context` routes them. Don't edit context files during feature work.
- A blocked action means stop and ask, never work around it.
