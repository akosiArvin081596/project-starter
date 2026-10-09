# Architecture

<!-- Skeleton: /team:new-project fills in the stack-specific parts (marked <…>). Keep it short and
current; the reasons behind choices go in docs/decisions/, not here. -->

## Overview
<Two or three sentences: what the system does, who uses it, and the main parts.>

## Components
| Part | Where | What it does |
|---|---|---|
| Web app | <folder> | <serves pages and the API on PORT; health at HEALTH_PATH> |
| Workers / scheduler | <folder or none> | <background jobs; listed in ops/services.conf> |
| Database | <postgres, mysql, mariadb or none> | <main tables; the feature_flags table> |
| Browser tests | e2e/ | Playwright smoke and timezone tests, any stack |

## Data flow
<How a typical request moves through the parts: from the browser to the app, the database and outside
services, and back.>

## Environments
- **Local worktrees:** one per issue, each with its own port (8000–8099), database and env file.
  Outside services run in log or sandbox mode.
- **Staging:** every merge to `main` deploys here automatically. It is password-protected, has
  `noindex`, and uses sandbox keys for every outside service. Data is refreshed from the sanitized
  production snapshot only on demand.
- **Production:** runs release tags `vX.Y.Z` after the client approves on staging and the owner
  approves the deploy. It gets the same build artifact staging got.

Both environments run on one server, each with its own OS user, folder, env file, services,
database, database user and deploy key. Server details are never in this repo.

## Deploys
Build once per commit → secret scan of the artifact → deploy to staging → E2E there → release-please
→ (on a release) production with approval → smoke test. Each deploy backs up first (production),
migrates, switches the `current` link atomically, reloads, checks health, and switches back if the
check fails. Rollback switches to an earlier release; migrations are expand/contract, so no down
migrations exist. Runbooks: `docs/runbooks/`.

## Time
- Stored and logged in UTC. Shown and scheduled in the project timezone (`PROJECT_TIMEZONE`).
- Nightly jobs (snapshot, backup) run at `LOW_TRAFFIC_HOUR` in the project timezone. The server's
  own timezone is never changed.

## Feature flags
New features ship behind flags in the `feature_flags` table (`name`, `enabled`, `updated_at`,
`updated_by`). Staging has every flag on; production defaults to off until the client approves.
The registry is `docs/flags.md`.

## Personal data
Production data never leaves the server raw. A nightly job anonymizes a copy with `ops/anonymize`,
checks it, and only that sanitized dump reaches worktrees (`make db-pull`) and staging.

## Outside services
| Service | Purpose | Mode by environment |
|---|---|---|
| <mail provider or none> | <…> | local: log · staging: sandbox · production: live |
| <payments or none> | <…> | local: sandbox · staging: sandbox · production: live |

<!-- phase-4 template probe: closed without merging -->
