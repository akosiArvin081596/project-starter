# Runbook: deploy

Deploys are automatic. You only approve production. Times in GitHub's UI are shown in your
browser's timezone; when you report a time to the client, name the timezone, for example
"3:00 PM Asia/Manila".

## Before the first deploy
- `team-provision staging --apply`, then `team-provision production --apply` (each needs the owner's
  yes). They set the repo variables `STAGING_READY` and `PRODUCTION_READY`.
- Until then the deploy jobs skip with a notice. If the Makefile isn't configured yet, the build
  skips too and no `main-red` issue opens.

## Staging: every merge to `main`
1. A PR is squash-merged. The `pipeline` workflow starts on the push to `main`.
2. `build`: `make build` fills `ARTIFACT_DIR`, and the pipeline packs it with `ops/` as the
   artifact for that commit.
3. `scan-artifact`: gitleaks scans the built artifact for secrets baked into a bundle.
4. `deploy-staging`: the artifact goes to the server's `deploy-receive`. It unpacks into
   `releases/<sha>`, runs `MIGRATE_CMD`, switches `current`, reloads the services and checks
   `HEALTH_PATH`. If the check fails, it switches back to the previous release.
5. `e2e-staging`: `make e2e` runs against staging, using its basic-auth login.
6. `release`: release-please updates its release PR (see `docs/runbooks/merge-release-pr.md`).

Check it in Actions → pipeline → the run for your commit. The staging URL is in the environment's
secrets and in your local `projects/<project>.conf`, never in this repo.

## Production: a release
1. The client tests on staging and approves in a comment on the release PR.
2. You merge the release PR as admin (`docs/runbooks/merge-release-pr.md`). On that push, the
   `release` job creates the tag `vX.Y.Z` and its GitHub Release.
3. `deploy-production` waits for your approval: Actions → the run → Review deployments →
   production → Approve and deploy. It deploys the same artifact staging got. Production backs up
   its database first, then migrates and switches.
4. `smoke-production` runs the smoke test against production.
5. Turn on the flags the client approved, from your own terminal:
   `ops/flag production <name> on`. Leave unapproved ones off.

## When a deploy fails
- If the health check fails, the server switches back to the previous release by itself, and the run
  is red.
- A red `main` run opens one `main-red` issue. Until it closes, every PR except the fix (labelled
  `fixes-main`) fails `ci`. Fix forward with a normal PR; the issue closes when `main` is green again.
- If production is broken right now, roll back first (`docs/runbooks/rollback.md`), then fix forward.
- If the failure is in a migration, read the expand/contract rule in `.claude/rules/project/database.md`
  before trying again: the fix is a new migration, never an edit to a merged one.
