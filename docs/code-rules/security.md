# Security rules

## Responsibility

Security rules protect project data and operations across API, MCP, persistence, configuration, logging, and generated UI boundaries.

## Non-responsibility

This guide is not a substitute for the approved product permission model, threat review, or deployment-specific security policy.

## Required rules

- Treat network payloads, environment values, database documents, and MCP arguments as untrusted; validate before use.
- Authenticate callers and authorize each operation against trusted identity and project scope. Check authorization on the server for every request.
- Apply least privilege to external credentials and service access. Never put secrets in source, fixtures, client bundles, examples, or logs.
- Use allowlisted fields and safe query construction; encode/escape output in the context that renders it.
- Return stable, minimal client errors. Log actionable context without credentials, tokens, personal payloads, or raw secrets.
- Expose MCP tools explicitly with validated arguments, authorization, bounded work, and deliberate side-effect semantics.
- Treat LLM text, project content, tool output, uploaded files, and retrieved records as untrusted data, never as a
  higher-priority authorization instruction. Enforce permissions below the prompt layer.
- Require confirmation/policy checks for consequential mutations, persist affected-record evidence, and permit revert
  only when current versions still match the recorded post-change state.

## Limitations

Types and schemas do not establish permission. CORS, UI hiding, and client checks are not access control. Deployment controls must be decided in the approved architecture.

## Correct example

```ts
const actor = requireAuthenticatedActor(ctx);
await authorizeProjectRole(actor, ctx.projectId, "records:read");
const result = await records.findById(ctx.projectId, input.id);
```

Scope is derived from trusted context and checked before the service read.

## Avoid

- Trusting a client-supplied role, project ID, or “admin” flag.
- Sending MongoDB errors or stack traces directly to clients.
- Registering all internal procedures as externally discoverable tools.
- Allowing prompt text or tool output to select a project/database, widen permissions, reveal secrets, or suppress audit.

## Verification

Review each boundary for validation, authentication, authorization, project scope, secret exposure, and safe errors. Add deterministic tests for unauthenticated, unauthorized, cross-project, malformed-input, and redaction cases.
