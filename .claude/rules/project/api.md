---
paths:
  - "__API_GLOBS__"
---
<!--
  Project rule (owned by this project, at most 80 lines). Loads only when Claude works on API
  files. __API_GLOBS__ is a placeholder that matches nothing: /team:new-project replaces it with
  the stack's route, controller and handler globs.
-->
# API

## Health endpoint
- HEALTH_PATH (`ops/project.conf`, default /health) returns 200 without auth when the app can serve
  requests (it may check the database), and a non-200 otherwise. Deploys switch back and uptime opens
  an incident on failure, so keep it fast, cheap and free of secrets or version details.

## Compatibility
- Deploys and rollbacks briefly run old and new code side by side, so API changes follow
  expand/contract too: add fields and endpoints; remove or rename only after no client uses them.
- Never change the meaning or type of an existing field; add a new one.

## Requests and responses
- Validate every request body, query and path parameter at the boundary; reject unknown or
  malformed input with 400 or 422 and a field-level message.
- One error shape everywhere (for example `{"error": {"code", "message", "fields"}}`); never return
  stack traces, SQL or internal ids of other users.
- Status codes mean what they say: 401 not signed in, 403 not allowed, 404 not found (also for
  records the caller may not see), 409 conflict, 429 rate limited.
- Times are ISO 8601 in UTC with a `Z` suffix. Dates that are local by nature are plain `YYYY-MM-DD`.
- Lists are paginated with a stable order; never return unbounded collections.

## Side effects
- Endpoints that create payments, send messages or receive webhooks are idempotent: accept an
  idempotency key or detect duplicates.
- Outside calls go through one client per provider that honors MAIL_MODE, SMS_MODE, PAYMENTS_MODE
  and WEBHOOKS_MODE, with timeouts and limited retries.
- Every endpoint checks authentication and authorization (see the security rule for high-risk areas).

<!-- Stack-specific additions (router, serializers, versioning scheme, API docs location) go below this line. -->
