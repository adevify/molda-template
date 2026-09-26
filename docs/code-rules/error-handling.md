# Error-handling rules

## Responsibility

Defines stable expected failures, safe unexpected-failure mapping, retry classification, and evidence needed to diagnose
an operation without exposing internals.

## Non-responsibility

Errors do not replace validation, authorization, idempotency, monitoring, or compensation/revert design.

## Required rules

- Represent expected domain outcomes as typed discriminated results or stable domain errors with a code, safe message,
  retryability, and relevant resource/field metadata.
- Throw unexpected infrastructure/programmer failures; map them once at API, MCP, event-worker, and process boundaries.
- Preserve the causal error internally and attach trace/operation identifiers. Return only allowlisted safe details.
- Classify retryable transient failures separately from permanent validation, authorization, conflict, and not-found
  outcomes. Workers retry only classified transient failures with bounded backoff.
- Treat optimistic-version/revert mismatch as conflict, not internal failure. Never force overwrite newer state.
- Do not reveal whether a cross-project resource exists when the caller lacks scope.

## Limitations

A stable error contract cannot guarantee an external provider's text or availability. Provider/driver errors require an
owned adapter mapping and may retain protected evidence only under the data-retention policy.

## Correct example

```ts
type UpdateResult =
  | { ok: true; value: RecordSummary }
  | { ok: false; reason: "invalid_input" | "not_found" | "conflict" | "not_allowed" };
```

The transport maps this result to its protocol without leaking driver messages; unexpected exceptions receive a trace ID
and a generic client response.

## Avoid

- Returning stack traces, database/provider errors, secrets, tokens, raw inputs, or cross-project identifiers.
- Catching and returning `undefined`, retrying every failure, or converting all failures into HTTP 500.
- Comparing error message strings as program logic.

## Verification

Test every expected result, boundary mapping, retry classification, redaction, causal logging, conflict semantics,
cross-project indistinguishability, and process-level rejection/exception handling.
