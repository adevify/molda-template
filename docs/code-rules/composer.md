# Composer

## Responsibility

Composer is the common Studio UI for reusable project operations. Its project-provided catalog contains only the
explicit `composer.queries` and `composer.mutations` registered in `startProject`. It is not a synonym for the API
router or the complete common MCP tool manifest.

## Non-responsibility

Composer does not expose ordinary project routers, define module MCP tools, or provide arbitrary database access.

## Required rules

When Studio opens a project, it requests the Composer catalog from that project's API. Every entry declares a stable
identifier, label/description, input schema, output schema, required permission, and invocation metadata. Studio derives
the input UI from the supported schema vocabulary and renders the validated result with an explicit output
configuration. Unsupported schema constructs fail catalog validation instead of producing a guessed form.

The catalog has exactly two groups:

1. `composer.queries`, for reusable read-only interactions;
2. `composer.mutations`, for reusable state changes.

Selected-module MCP tools and generic structural data tools are not Composer UI entries. They join Composer operations
only in the common MCP `tools/list` result used by the Studio LLM. An ordinary API route is never included merely because
its router is registered.

### Query and mutation contract

Queries are read-only. Mutations validate typed input, authorize the project owner/session, execute within project scope,
and return an operation receipt. Studio may invoke a catalog entry directly through the project API with the current
operation session identifier; it does not need to route a saved Composer interaction through MCP. The Studio LLM may
invoke the same definition through common MCP, avoiding rediscovery or reconstruction of an already registered action.

A receipt identifies the mutation and affected resources, records the relevant before/after values or versions needed
for safe conditional revert, and reports whether the change was applied.

Revert is conditional: it succeeds only while the resource is still at the state/version produced by that mutation. If later work changed the resource, report a conflict and preserve that work. Revert is a new audited mutation; it does not erase history.

Require an idempotency key for retryable externally invoked mutations. Repeating a key with the same actor and equivalent request returns the original outcome; reusing it for a different request is a conflict. Keys are scoped and retained long enough to cover the documented retry window.

## Limitations

Apply project and actor authorization at invocation time, not only at discovery. Filter outputs to the caller's permitted fields and resources. Avoid returning credentials, secret configuration, or unbounded structural data. Generic tools must expose a constrained schema and supported operations, not arbitrary database queries or collection access.

Composer does not infer intent, bypass module policy, or turn arbitrary functions into tools. Every operation needs an
input/output schema, description, authorization rule, no hidden handler context parameter, idempotency behavior where
mutating, and audit/revert policy. Runtime context is injected by the project runtime, never accepted from user input.

## Correct example

```ts
composer: {
  queries: [defineComposerQuery({ id: "records.list", input: ListInput, output: ListOutput, handler: listRecords })],
  mutations: [defineComposerMutation({ id: "records.update", input: UpdateInput, output: UpdateOutput, handler: updateRecord })],
}
```

Definitions are schematic; use the installed project-runtime contract. Handlers receive validated business input only;
the runtime injects project, actor, session, repositories, and audit services outside the handler input schema.

## Avoid

- Calling Composer queries `questions` or mixing queries and mutations in one untyped list.
- Adding every tRPC route or module tool to the owner-facing catalog.
- Accepting `projectId`, `actorId`, collection names, or raw selectors from the form as authority.

## Verification

Test catalog validation, stable identifiers, supported input/output schema projection, authorization, read-only query
behavior, mutation idempotency, receipts, conditional revert, and absence of ordinary routes/module-only tools from the
Composer UI catalog.
