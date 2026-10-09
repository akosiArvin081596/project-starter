# Runbook: incident (production down)

The `uptime` workflow checks production's health URL every 15 minutes (UTC schedule). After two
failures in a row it opens one `incident` issue, and closes it when the check passes again. So
detection can take up to about 30 minutes; the owner may also notice first.

## Steps
1. **Acknowledge.** Comment on the `incident` issue with the time you started, naming the timezone.
   The repo is public: never put customer data, URLs with tokens, or server details in the issue.
2. **Confirm.** Open the health URL and the home page yourself. Is it down for everyone, slow, or
   only one feature?
3. **Recent change?** Look at Actions → pipeline. If a production deploy finished shortly before the
   failures began, roll back first (`docs/runbooks/rollback.md`) and investigate afterwards.
4. **Look at the server** (from your own terminal, with your usual server alias). Times in the
   commands below are UTC (`--utc`), to match the logs and the issue.
   - Services: `systemctl status 'team-<project>-production-*'`
   - App logs: `journalctl --utc -u 'team-<project>-production-*' --since '-1h'`
   - Web server: `sudo nginx -t` and the nginx error log
   - Disk and memory: `df -h` and `free -m`. A full disk is a common cause.
   - Database service: `systemctl status postgresql` (or `mysql` / `mariadb`)
5. **Fix.**
   - For a code problem: roll back, then fix forward with a PR labelled `bug`.
   - For a service that stopped: start it and find out why from the logs.
   - For data damage: `docs/runbooks/restore-from-backup.md`.
6. **Recover.** The uptime check closes the issue by itself once production is healthy. Add a short
   summary to the issue: what happened, when (with the timezone), the impact, and the fix.
7. **Tell the client** in plain language, with start and end times in the project timezone, for
   example "down from 2:05 PM to 2:40 PM Asia/Manila".
8. **Learn.** Put lessons on the fix PR's `Lessons:` line. A design change gets a record in
   `docs/decisions/`.

## Notes
- Scheduled workflows pause after 60 days without repo activity. If the uptime runs have stopped,
  re-enable it: Actions → uptime → Enable workflow. `team-verify-repo` warns about this.
- Staging outages don't open incidents; they show up as red `pipeline` runs.
