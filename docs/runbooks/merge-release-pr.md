# Runbook: merge a release PR (admin bypass)

release-please keeps one release PR open (branch `release-please--branches--main`, titled like
`chore(main): release 0.4.0`). It collects the changes merged since the last release, and updates
`CHANGELOG.md` and `version.txt`. Merging it creates the release and starts the production deploy.

Agents never review, label or merge release PRs. The PR never gets the `ai-*` statuses, so only your
admin bypass can merge it.

## Steps
1. **Client approval.** Paste the release PR into the planner chat and send the client the release
   notes it drafts (times in the project timezone). The client tests on staging and approves in a
   comment on the release PR.
2. **Partial approval.** If the client approves only part of the release, it still ships. Leave the
   unapproved features' flags off in production (they default to off), and note which ones in a PR
   comment.
3. **Checks.** `ci` and the gates must be green on the release PR. Don't merge a red one.
4. **Merge as admin.** On the PR page, tick "Merge without waiting for requirements to be met
   (bypass rules)", then squash merge. Keep the title release-please wrote.
   Or from your own terminal (never inside Claude Code): `gh pr merge <number> --squash --admin`.
5. **Deploy.** The push to `main` runs the pipeline. `release` creates the tag `vX.Y.Z` and its
   GitHub Release, and `deploy-production` waits for your approval
   (`docs/runbooks/deploy.md`, "Production: a release").
6. **Flags.** After `smoke-production` passes, switch on the approved flags:
   `ops/flag production <name> on`.
7. **Tell the client** the version and the time it went live, naming the timezone.

## Notes
- The release PR needs the `RELEASE_PLEASE_TOKEN` secret (a fine-grained token). Without it, the
  `release` job skips with a notice and no release PR appears.
- Releases are immutable once published. A wrong release is fixed by a new release, never by moving
  or deleting its tag.
- The first release is `0.1.0`. Before `1.0.0`, `feat` bumps the minor version and `!` (breaking)
  also bumps the minor version.
