# Testing rules

## Responsibility

Tests verify typed contracts, server behavior, and deterministic build/preview rules using Node.js and Jest-style test organization without browser execution.

## Non-responsibility

Tests do not require browser automation, live production services, timing-sensitive behavior, or invented project facts.

## Required rules

- Keep tests deterministic and focused on observable contracts; inject external boundaries and use controlled fixtures derived from accepted facts where project facts are required.
- Cover validation, authorization, project scoping, success, and failure paths at the layer that owns each rule.
- Keep test setup and cleanup explicit; avoid shared mutable state and order-dependent tests.
- Use the repository's Node test runner (`node:test`). When a project explicitly adopts Jest, keep the same deterministic and server-side constraints.
- Preserve preview checks: `npm run typecheck`, `npm test`, `npm run preview:verify`, and `npm run preview:build`.

## Limitations

The template currently runs `node --test tests/*.test.mjs`; it does not include Jest or a browser test runner. Browser testing is outside this project contract. Do not add packages or change dependencies during preview.

## Correct example

```ts
import test from "node:test";
import assert from "node:assert/strict";

test("rejects a record from another project", async () => {
  const result = await service.getById({ projectId: "project-a", id: "record-b" });
  assert.equal(result, null);
});
```

## Avoid

- Browser/UI automation, real remote-service calls, sleep-based timing assertions, or tests that rely on another test's mutation.
- Fabricating product facts solely to make a screenshot or fixture look populated.
- Skipping a deterministic failure-path test because the success path passes.

## Verification

Run `npm test` and `npm run typecheck`; for preview work also run `npm run preview:verify` and `npm run preview:build`. Repeat relevant tests when changing shared contracts and confirm results do not depend on execution order.
