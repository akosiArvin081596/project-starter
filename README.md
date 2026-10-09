# project-starter

The GitHub template every new project starts from, for the team workflow pack
([akosiArvin081596/dev-standards](https://github.com/akosiArvin081596/dev-standards)). It is
language- and framework-neutral: the stack is chosen per project and filled in later.

**Don't use this repo directly, and don't click "Use this template".** Run `/team:new-project` from a
checkout of `dev-standards` instead. It:
1. Asks for the name, purpose, owner, GitHub account, visibility, stack, timezone and domain.
2. Creates the new repo from this template under the chosen account, clones it, and runs
   `team-hooks`.
3. On branch `chore/initial-stack`:
   - Fills in `ops/project.conf`.
   - Runs `team-sync --init`, which deletes `.github/workflows/template-ci.yml` and writes
     `.claude/team-standards.lock`.
   - Applies the GitHub settings with `team-bootstrap-repo`.
4. Builds a walking skeleton on the same branch:
   - every Makefile target, the health endpoint, one page and the `feature_flags` table
   - fake seed data and its `ops/anonymize` rules
   - the stack's globs in `.claude/rules/project/`
   - a filled-in `CLAUDE.md`, plus `docs/commands.md` and `docs/architecture.md`
5. Provisions staging and production, prints the planner setup, and ships the skeleton PR.

It also replaces this README with the project's own.

## What's inside
| Path | Owner | What |
|---|---|---|
| `CLAUDE.md` | project | lean skeleton with placeholders (budget: 150 lines) |
| `.claude/settings.json`, `.claude/hooks/`, `.claude/rules/team/` | dev-standards (managed) | plugin enable, deny and ask rules, the plugin check, the always-on team rule |
| `.claude/rules/project/` | project | path-scoped rule templates: testing, database, security, frontend, API |
| `.mcp.json` | template | Playwright MCP, isolated and headless, screenshots in `.team/evidence` |
| `.github/workflows/` | dev-standards (via `team-sync`) | thin callers of the reusable workflows, pinned `@v1`, plus template-only `template-ci.yml` |
| `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/` | dev-standards (managed) | the standard report; bug, feature and client-request forms |
| `.github/dependabot.yml`, `release-please-config.json`, `.release-please-manifest.json`, `version.txt` | project | weekly grouped updates; releases starting at 0.1.0 |
| `Makefile` | project | the shared targets; unconfigured ones exit 3 |
| `e2e/` | project | Playwright smoke and timezone tests with their own `package.json` |
| `.githooks/` | project | commit-msg, pre-commit and pre-push checks |
| `ops/` | project | server and pipeline config, anonymization rules, flag command, env templates |
| `docs/` | project | commands, architecture, flags, decisions, runbooks, planner instructions |

Managed files are identical in every project and change only through `/team:sync-standards`.

## Checks on this repo
While this repo is the template, `ci`, `pipeline`, `rollback` and `uptime` are skipped. `gates`
(profile `template`) and `template-ci` run on every PR:
- shellcheck on every shell file
- the context check
- every JSON file parses
- the Claude Code settings hold the pack's rules

## License
None: projects created from this template are all rights reserved unless they add a license.
