# Rentals module specification

## Identity

- Package and ID: `@molda-org/rentals` / `rentals`.
- Stage: `phase-two`.
- Category: `operations`.
- Purpose (declaration exact): “Rentable inventory, availability, booking periods, deposits, pickup, and return.”
- Declared actions: `createRental`, `confirmPickup`, `extendRental`, `confirmReturn`.
- Declared views: `availableRentals`, `activeRentals`, `overdueReturns`.
- Declared React hooks: `useRentalAvailability`, `useRental`.

## Responsibility

Owns rental commitments and their period, custody handoff, extensions, and return state. The approved project architecture identifies the source of rentable asset identity and physical inventory truth.

## Non-responsibility

Does not own general sales orders, payment processing, general scheduling rules, or maintenance job execution. It does not establish physical inventory truth without an approved asset source.

## Dependencies and ownership

Depends on core and optional customer references. Catalog/pricing, scheduling, payments, and service-jobs are explicit integrations only. Rental owns agreement/lifecycle state; the designated asset source owns identity and physical status. Do not access another module repository or make a deposit reference equivalent to payment settlement.

## Data model

Target entities: `Rental`, `RentalAssetRef`, `RentalPeriod`, `RentalCustodyEvent`, and optional `RentalDepositRef`. A rental records project-scoped ID, asset reference, optional customer reference, planned start/end instants, status, revision, agreement reference, and idempotency identity. Pickup/return transitions include actor, timestamp, condition code, and evidence reference subject to policy. Extension records preserve prior and new end time. Asset details remain with their owning source.

## API

Versioned operations: `rentals.checkAvailability({ projectId, assetRefs, startAt, endAt }) -> { availability, sourceRevision }`; `rentals.create({ projectId, assetRef, customerId?, startAt, endAt, idempotencyKey }) -> { rental, receipt }`; `rentals.confirmPickup({ projectId, rentalId, expectedRevision, conditionCode?, idempotencyKey })`; `rentals.extend({ projectId, rentalId, expectedRevision, newEndAt, idempotencyKey })`; `rentals.confirmReturn({ projectId, rentalId, expectedRevision, conditionCode?, idempotencyKey })`. Mutations return updated rental plus receipt or typed failure.

## Validation and invariants

Require ordered periods, valid asset reference, allowed duration, and unique retry key. Prevent overlapping active commitments through atomic checks at the authoritative asset/capacity owner. Pickup is valid only for an eligible confirmed rental; extension cannot violate policy or create an uncoordinated overlap; return closes custody exactly once. Reject stale revisions and invalid transitions. Preserve condition evidence references without trusting client claims.

## Permissions

Separate availability read, create, pickup, extension, and return scopes. Bind customer self-service to trusted identity; staff custody transitions require appropriate role and project scope. Limit access to customer contact, deposits, and condition evidence. Authorize source asset reads independently.

## Events

Publish versioned project-scoped facts after accepted changes, such as `rentals.created.v1`, `rentals.pickup-confirmed.v1`, `rentals.extended.v1`, and `rentals.return-confirmed.v1`, containing rental ID, revision and relevant asset reference. Consumers tolerate retries; do not include payment credentials or unnecessary personal data.

## Journal actions and views

Actions are exactly `createRental`, `confirmPickup`, `extendRental`, and `confirmReturn`. Consequential custody/period changes require confirmation and idempotency; receipts support conditional revert only when custody and current revision allow it. Views are exactly `availableRentals`, `activeRentals`, and `overdueReturns`, filtered through both rental and asset-owner permissions.

## Composer and MCP

Composer exposes typed rental availability queries and authorized mutations, with explicit confirmation for commitments and custody transitions. APIs are not implicitly MCP. Explicit module MCP exposure is separately declared, approved, and project-enabled. Generic structural data tools may read only registered fields under rental and source-asset authorization; they cannot issue custody transitions or bypass the source module.

## Migrations

Version agreement, period, custody, and status records. Upgrade without losing historical handoffs or idempotency identity. Require checkpoint before irreversible custody/status transformations; reject lossy downgrade.

## Tests and fixtures

Use synthetic assets/rentals. Test exact declaration unions, overlapping-period concurrency, source authorization failures, retry dedupe, pickup/extension/return transitions, stale revision, overdue derivation, condition evidence redaction, and migration preservation. Keep integrations behind deterministic test doubles.

## React SDK

Export `useRentalAvailability` and `useRental` with typed query/mutation results and project/source revision cache keys. Forms represent instants and policy limits explicitly; pickup and return actions require server-issued capability and report receipts/errors. Client state never establishes asset authority.

## Limitations

Physical inventory reconciliation, deposits, external calendar synchronization, maintenance routing, and payments need explicit adapters and policies. The declaration does not imply fleet management or reliable asset telemetry.

## Correct example

```ts
const result = await rentals.create({
  projectId: context.project.id,
  assetRef: input.assetRef,
  startAt: input.startAt,
  endAt: input.endAt,
  idempotencyKey: context.operationId,
});
```

## Avoid

Do not treat a catalog item as proof of physical availability, extend by mutating dates without a capacity check, or mark return from an untrusted client signal.

## Readiness evidence

Declaration/runtime metadata agrees; all ten surfaces are present; tests prove explicit asset ownership, nonoverlap, custody transitions, authorization, replay safety, migration safety, and SDK contract behavior.
