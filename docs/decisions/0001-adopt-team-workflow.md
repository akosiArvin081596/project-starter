# 0001: Adopt the team workflow pack

- Status: accepted
- Date: 2026-10-09 (UTC)
- Deciders: the owner

## Context
This project is built by one developer who runs Claude Code agents in git worktrees as if they were
a team. Without shared rules, agents can push to `main`, weaken tests, leak personal data into a
public repo, or deploy without approval. The developer also runs several projects in different
stacks, so the process must not depend on a programming language.

## Decision
Use the team workflow pack from `akosiArvin081596/dev-standards` (plugin `team`, pinned to `v1`),
starting from the `project-starter` template:
- **Trunk-based.** `main` is the only long-lived branch and deploys to staging. Production runs
  release-please versions. Rollback redeploys an earlier version.
- **PRs only.** Branches are named `type/<issue>-<slug>`, PR titles follow Conventional Commits, and
  PRs are squash-merged by auto-merge once every required check is green.
  - The required checks are `ci`, `guarded-paths` and `pr-title`, plus the reviewer agents'
    `ai-review`, `ai-security` and `ai-qa` statuses.
  - Guarded changes (the safety system, destructive migrations) wait for the owner's
    `owner-approved` label.
- **Fences.** Claude Code deny and ask rules, plus a PreToolUse hook, stop agents from pushing to
  `main`, tagging, changing GitHub settings, reading credentials or touching production.
- **Context.** `CLAUDE.md` stays lean. Path-scoped rules live in `.claude/rules/project/`, the shared
  rule in `.claude/rules/team/`, and auto memory is off. Lessons reach the repo through PR reports
  and `/team:tidy-context`.
- **Operations.** There is one server, with separate staging and production environments.
  - Deploys are atomic, with an automatic switch back.
  - Production has nightly backups and anonymized snapshots, and feature flags gate unapproved
    features.
  - Times are stored in UTC and shown in the project timezone.

## Consequences
- No manual code review: quality rests on tests, CI checks and the reviewer agents. Every bug fix
  needs a regression test, and tests are never weakened.
- The owner approves guarded PRs, production deploys, release merges (admin bypass), production flag
  switches and anything that connects to the server.
- Managed files (`.claude/settings.json`, `.claude/hooks/`, `.claude/rules/team/`, the PR and issue
  templates, the workflow callers) change only through `/team:sync-standards`, never by hand here.
- The fences only work inside Claude Code; commands typed in a normal terminal aren't fenced.
- Changing any of this is a new decision record that supersedes this one.
