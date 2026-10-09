---
paths:
  - "__HIGH_RISK_GLOBS__"
---
<!--
  Project rule (owned by this project, at most 80 lines). Loads only when Claude works on
  security-sensitive files. __HIGH_RISK_GLOBS__ is a placeholder that matches nothing:
  /team:new-project replaces it with the same globs as HIGH_RISK_GLOBS in ops/project.conf
  (auth, sessions, permissions, payments, uploads, webhooks, admin). PRs touching them are
  labelled high-risk and get a security review.
-->
# Security-sensitive code

## Input and output
- Every input is untrusted: request data, headers, cookies, files, webhook payloads, queue messages
  and database rows written by users. Validate type, length and format at the boundary.
- Database access uses parameterized queries or the framework's query builder; never build SQL,
  shell commands or file paths by string concatenation with input.
- Encode output for its context (HTML, attributes, URLs, JSON); use the framework's escaping.
- No unsafe deserialization of untrusted data (native object formats, YAML with tags).

## Authentication and authorization
- Check authorization on the server for every action and every record, including ownership
  ("this order belongs to this user"), not only in the UI.
- Deny by default: new endpoints and pages require authentication unless the issue says otherwise.
- Passwords use the framework's standard slow hash. Session and reset tokens are random, expire,
  and are stored hashed.
- Rate-limit login, password reset and other enumeration-prone endpoints; give the same response
  whether or not an account exists.
- Cookie sessions get CSRF protection, plus `Secure`, `HttpOnly` and `SameSite` cookies.

## Secrets and personal data
- Secrets come from the env file only. Never hardcode them, log them or send them to the browser.
- Never log personal data, tokens, passwords or payment data; log ids instead.
- Payment card data never touches this app's storage; use the provider's hosted fields or tokens.

## Outbound calls and files
- Outbound requests to a URL that comes from input go only to an allowlist of hosts (SSRF).
- Uploads: check size and type by content, store outside the web root with generated names,
  and never execute or include them.
- Webhooks: verify the signature and the timestamp before doing anything; treat the payload as data.
- Outside services respect MAIL_MODE, SMS_MODE, PAYMENTS_MODE and WEBHOOKS_MODE: log or sandbox
  everywhere except production.

<!-- Stack-specific additions (auth library, policy classes, middleware names) go below this line. -->
