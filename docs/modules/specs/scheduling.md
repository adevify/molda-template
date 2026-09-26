# Scheduling module specification

## Identity

- Package and ID: `@molda-org/scheduling` / `scheduling`.
- Stage: `initial`.
- Category: `operations`.
- Purpose (declaration exact): “Working hours, breaks, resources, duration, buffers, and available-slot calculation.”
- Declared actions: `updateWorkingHours`, `blockResource`, `releaseResource`.
- Declared views: `availableSlots`, `resourceSchedule`, `blockedPeriods`.
- Declared React hooks: `useAvailableSlots`, `useResourceSchedule`.

## Responsibility

Owns resource availability rules and deterministic slot calculation from working intervals, breaks, duration, buffers, and blocked periods. A slot result is an availability observation for a specific query window and rule revision.

## Non-responsibility

Does not own reservations or booking confirmation, service-job execution, event/ticket capacity, rental agreements, or external calendar truth. Calculating a slot does not reserve or hold it.

## Dependencies and ownership

Depends on core project scope. Customer or catalog references may be consumed through explicit contracts where a project needs them; do not import another module's repository. Scheduling is the owner of its availability rules and blocks. Reservations owns bookings and must coordinate through a declared service contract; scheduling alone does not prevent two clients from booking the same slot.

## Data model

Target entities: `Resource`, `WorkingHoursRule`, `BreakRule`, `AvailabilityBlock`. Use stable project-scoped IDs and revisioned rule records. A resource has a status and optional typed references; a working-hours rule identifies resource, weekday/date scope, local interval and time-zone identifier; breaks and duration/buffer rules are explicit; a block identifies resource, absolute start/end instants, reason code, and lifecycle state. `AvailableSlot` is a derived result with start/end instants, resource ID, rule revision, and calculation timestamp; it is not persisted as a booking.

## API

Versioned service operations: `scheduling.updateWorkingHours({ projectId, resourceId, expectedRevision, rules }) -> { resourceId, revision }`; `scheduling.blockResource({ projectId, resourceId, startAt, endAt, reasonCode, idempotencyKey }) -> { blockId, revision }`; `scheduling.releaseResource({ projectId, blockId, expectedRevision, idempotencyKey }) -> { blockId, revision }`; `scheduling.calculateAvailableSlots({ projectId, resourceIds, window, duration, buffer, timeZone }) -> { slots, ruleRevision }`. The three declared actions map to their corresponding mutations; calculation is a query, not a declared journal action.

## Validation and invariants

Validate time zones, interval syntax, positive duration, nonnegative buffers, and start-before-end. Reject invalid or stale expected revisions. Keep intervals unambiguous at daylight-saving transitions by storing absolute instants for blocks and explicit zone context for recurring local rules. Blocks cannot be released twice as a successful new change. Slot calculation must honor applicable work rules, breaks, buffers, blocks, and resource status; results may become stale immediately and carry the revision used.

## Permissions

Require authenticated actor and trusted project scope for every call. Separate availability read from schedule-rule edit and resource block/release privileges. Restrict sensitive block reasons and resource details by policy. Never trust caller-supplied project identity or infer authorization from slot visibility.

## Events

Publish versioned, project-scoped facts only after accepted rule or block changes, such as `scheduling.working-hours-updated.v1`, `scheduling.resource-blocked.v1`, and `scheduling.resource-released.v1`. Include entity ID and resulting revision; omit private reason text. Consumers tolerate duplicate delivery. Availability queries do not emit domain-change events.

## Journal actions and views

Journal actions are exactly `updateWorkingHours`, `blockResource`, and `releaseResource`; require confirmation according to consequential-change policy, and return receipts with affected IDs and before/after revisions for conditional revert where safe. Journal views are exactly `availableSlots`, `resourceSchedule`, and `blockedPeriods`; apply project and actor scopes before filtering or pagination.

## Composer and MCP

Composer may expose typed availability queries and authorized scheduling mutations through its query/mutation catalog. API routes remain separate. Explicit module MCP tools require a separately approved tool contract and enabled project capability; declarations do not imply tool exposure. Generic structural tools may access only registered scheduling resources and bounded schemas, never raw selectors or repositories. Preserve each tool's source metadata.

## Migrations

Declare schema version and deterministic upgrade steps for resource/rule/block records. Preserve local-zone rule semantics and revisions; checkpoint before irreversible transformations. Downgrade only when no rule meaning or block state is lost, otherwise report unsupported.

## Tests and fixtures

Use synthetic, clearly labeled records with no customer facts. Contract tests cover exact action/view/hook unions, project isolation, authorization failures, interval/time-zone validation, revision conflicts, duplicate block/release requests, daylight-saving edges, block precedence, and stale slot result labeling. Verify calculation never creates a reservation.

## React SDK

Export `useAvailableSlots` and `useResourceSchedule` with typed inputs/results, loading/error states, query invalidation keyed by project and rule revision, and no hidden booking side effect. Exported validator/form/client types must match service schemas; headless component types must not encode a presentation framework unless separately declared.

## Limitations

No external calendar synchronization, booking atomicity, provider integration, or time-zone policy beyond explicit project configuration is implied. A calculated opening is not a guaranteed slot.

## Correct example

```ts
const result = await scheduling.calculateAvailableSlots({
  projectId: context.project.id,
  resourceIds: input.resourceIds,
  window: input.window,
  duration: input.duration,
  buffer: input.buffer,
  timeZone: input.timeZone,
});
return { slots: result.slots, ruleRevision: result.ruleRevision };
```

## Avoid

Do not write reservation records from slot calculation, read reservation storage directly, treat a returned slot as a lock, or expose raw database conditions as an availability API.

## Readiness evidence

Ready only when runtime metadata matches this declaration; all ten shared contract surfaces exist; schemas, project authorization, revision/idempotency behavior, event contracts, migrations, fixtures, and React exports are tested; and booking ownership is demonstrably separate.
