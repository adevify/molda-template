# Structural project-data tools

## Responsibility

Generic structural tools let the Studio LLM inspect and change project data whose exact schema differs by project,
without generating one MCP server or one tool vocabulary for every business domain.

## Non-responsibility

They are not raw MongoDB access, a replacement for module/domain operations, or permission to bypass invariants,
workflows, provider calls, or purpose-built Composer mutations.

## Required rules

- Resolve the project database, actor, role, and session exclusively from the signed common MCP session.
- Address an allowlisted logical `resource` from the project's registered data catalog—not a database, collection, model
  class, or arbitrary namespace supplied by the caller.
- Expose bounded structural reads such as `describe`, `findOne`, `findMany`, `count`, and `aggregate`. Use a validated AST
  for filters, projections, sorting, grouping, and supported accumulators. Never accept source code or raw Mongo syntax.
- Expose writes such as `createOne`, `updateOne`, `updateMany`, `deleteOne`, and `deleteMany` only when the data catalog and
  actor policy permit them. Use allowlisted paths/operators and enforce module/domain invariants below the tool.
- Split consequential writes into a validated plan and apply step when confirmation policy requires it. Bind the plan to
  project, actor, normalized operation, expected record versions, expiry, and a single/retry-safe application identity.
- Return a receipt containing operation identity, affected resource/record identifiers, bounded before/after evidence or
  protected evidence reference, versions, counts, timestamps, and revert eligibility.
- Revert only records that still match the recorded post-change version/state; report conflicts without overwriting newer
  work. Revert is a new audited mutation.

Supported filter nodes should be a small versioned vocabulary, for example `eq`, `ne`, `in`, `gt`, `gte`, `lt`, `lte`,
`exists`, `and`, `or`, and `not`. Supported aggregation stages should likewise be explicit, bounded, and versioned, for
example `match`, `project`, `group`, `sort`, `skip`, and `limit`. Project schemas decide which fields and stages are legal.

## Limitations

Structural tools cannot safely express every business operation. Use a module tool or Composer mutation when the action
has domain transitions, external side effects, multi-resource invariants, payment/notification effects, or a clearer
purpose-built authorization rule. Cross-store mutation and evidence persistence require an approved atomic or recoverable
consistency design.

## Correct example

```ts
const request = UpdateManyInput.parse({
  resource: "appointments",
  where: { op: "eq", field: "status", value: "pending" },
  changes: [{ op: "set", field: "status", value: "confirmed" }],
  expectedMaximumAffected: 25,
});

const plan = await ProjectDataService.planUpdate(context, request);
const receipt = await ProjectDataService.applyPlan(context, plan.id);
```

The resource, fields, operators, values, bounds, permissions, and current record versions are validated against the
project catalog and session before application.

## Avoid

```ts
runMongo({ database, collection, pipeline, update, credentials });
```

Never accept database/collection names, raw filters/operators/pipelines, JavaScript expressions, credentials, caller
identity, unbounded result sizes, or a force-revert switch. Do not use structural writes to bypass module services.

## Verification

Contract-test resource/field/operator allowlists, query bounds, injection-shaped inputs, project/actor isolation,
read-only roles, plan tampering/expiry, optimistic conflicts, idempotent apply, receipt evidence, conditional revert,
partial conflicts, audit redaction, and stable versioned AST parsing.
