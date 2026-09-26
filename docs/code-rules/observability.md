# Observability rules

## Responsibility

Observability provides correlated, bounded evidence for Studio operations, APIs, MCP calls, events, releases, and project
runtime health.

## Non-responsibility

Logs and metrics are not the authoritative audit ledger, mutation receipt store, business database, or a place for
payload/secret retention.

## Required rules

- Use structured logs with timestamp, level, service, release digest, project-safe identifier, trace ID, operation/session
  ID, event/job ID where applicable, stable event name, duration, and outcome.
- Propagate trace context through API, common MCP, Composer direct invocation, data operations, event dispatch/handler,
  external adapters, and infrastructure commands.
- Emit bounded metrics for request/tool/job counts, latency, errors by stable code, queue depth/age/retries/dead letters,
  host capacity, release health, and usage reservation/reconciliation.
- Redact secrets/tokens and minimize personal/business payloads. Never use arbitrary user strings, record IDs, paths, or
  tool inputs as metric labels.
- Separate diagnostic retention from immutable audit/receipt evidence and document access/retention for both.
- Readiness reports required dependency state; liveness reports process health without causing restart loops for a single
  downstream failure.

## Limitations

Telemetry can be delayed, sampled, duplicated, or unavailable. It cannot be the sole source for billing, authorization,
mutation revert, or accepted job state.

## Correct example

```ts
logger.info("composer.mutation.completed", {
  projectKeyHash,
  traceId,
  operationId,
  capabilityId,
  affectedCount,
  durationMs,
});
```

No token, prompt, raw input, record body, or secret is logged.

## Avoid

- `console.log(request.body)`, prompt/tool dumps, connection strings, signed URLs, session tokens, or database documents.
- High-cardinality metric labels such as actor, record, filename, error message, or arbitrary capability input.
- Reporting readiness before required migrations/configuration/dependencies are verified.

## Verification

Test trace propagation, required structured fields, redaction, bounded labels, readiness/liveness behavior, telemetry
failure isolation, and separation between diagnostic logs and authoritative audit receipts.
