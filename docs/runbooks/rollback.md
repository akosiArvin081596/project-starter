# Runbook: rollback

Rolling back means running an earlier release again. Migrations follow expand/contract, so older code
works on the newer schema and there are no down migrations. Only the owner rolls back production.

## When
- Production is broken by the latest release, and the fix will take longer than a few minutes.
- If the cause is data, not code, see `docs/runbooks/restore-from-backup.md` instead.

## Steps
1. Find the last good release: Releases on GitHub, or `git tag --list 'v*' --sort=-v:refname`.
   Its tag looks like `v0.3.1`.
2. Run the `rollback` workflow. In the browser: Actions → rollback → Run workflow → tag `v0.3.1`.
   Or from your own terminal (not inside Claude Code): `gh workflow run rollback.yml -f tag=v0.3.1`.
3. Approve the production deployment when it asks (Review deployments → production).
4. The workflow tells the server to switch to that release:
   - if the server still has it (it keeps the last 5), the switch takes seconds;
   - if not, the workflow rebuilds the tag and deploys it the normal way.

   Either way the server checks `HEALTH_PATH` and switches back if the check fails.
5. Check it: the run's smoke step is green, and the health URL answers.

## Afterwards
- `main` still holds the bad change. Open a bug issue for it. The fix goes through a normal PR and
  ships as the next release; don't revert history by hand.
- Production flags keep their values. If the rolled-back release doesn't know a flag, the flag is
  ignored until the fix ships.
- Tell the client what happened and when, naming the timezone, for example
  "rolled back at 3:10 PM Asia/Manila, back to version 0.3.1".
- If a migration made the rollback unsafe, record why in `docs/decisions/` and add a lesson to the
  fix PR's report.
