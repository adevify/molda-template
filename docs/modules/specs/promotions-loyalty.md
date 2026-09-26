# Promotions Loyalty Module Specification

## Identity

- Package: `@molda-org/promotions-loyalty`
- ID: `promotions-loyalty`
- Stage: `phase-two`
- Category: `commerce`
- Purpose: `Coupons, discounts, points, referrals, campaigns, bundles, and repeat-customer rules.`
- Declared actions: `createPromotion`, `applyReward`, `adjustLoyaltyBalance`
- Declared views: `activePromotions`, `customerLoyalty`, `campaignResults`
- Declared React hooks: `usePromotions`, `useLoyaltyBalance`

These values must match the declaration exactly. The rest of this document specifies target contracts; it is not a claim that the package provides a runtime.

## Responsibility

Own promotion definitions and eligibility/redemption records, loyalty accounts and point transactions, referral/campaign outcomes, and the rules that protect limits and balance history. Supply explicit evaluation/redemption results for integrating commerce flows.

## Non-responsibility

Does not own the canonical catalog price, order lifecycle, payment processing, or membership entitlements. It cannot guarantee atomicity with an external order or payment system. It does not rewrite accepted order totals after a promotion changes.

## Dependencies and ownership

- Depends on `core` and customer references.
- May integrate with `catalog-pricing` and `orders-fulfillment` via published contracts only; they remain owners of catalog and order records.
- Owns `Promotion`, `RewardRedemption`, `LoyaltyAccount`, append-only `LoyaltyTransaction`, and campaign outcome records.
- Cross-module redemption plus order placement is a consistency boundary. Use a stable redemption/checkout operation ID, atomic limit reservation in this module, retry-safe order integration, and explicit release/compensation for failed checkout. Do not claim a single database transaction across owners.

## Data model

Target entities and schemas:

- `Promotion` / `promotions.promotion.v1`: `{ id, projectId, code?, status, rule, startsAt?, endsAt?, limits, revision }`.
- `RewardRedemption` / `promotions.redemption.v1`: `{ id, projectId, promotionId?, customerId, operationId, subjectReference?, benefitSnapshot, status, idempotencyKey, createdAt }`.
- `LoyaltyAccount` / `promotions.loyalty-account.v1`: `{ id, projectId, customerId, balancePoints, revision, status }`.
- `LoyaltyTransaction` / `promotions.loyalty-transaction.v1`: `{ id, projectId, accountId, deltaPoints, reason, operationId, idempotencyKey, createdAt, resultingRevision }`.
- `CampaignOutcome` / `promotions.campaign-outcome.v1`: `{ id, projectId, campaignId, subjectReference?, outcomeCode, occurredAt }`.
- Store point units as bounded integers and balance changes as append-only deltas. Store discount outputs as explicit integer money/currency snapshots or a typed percentage/rule result; never use floating-point currency amounts. The consuming order owns the applied line/total snapshot.

## API

Target versioned operations:

- `promotions.createPromotion(input) -> { promotion, receipt }`.
- `promotions.evaluatePromotion(input) -> EligibilityResult`, a read-only evaluation with reasons, bounded applicability, and expiry; evaluation alone does not reserve or redeem.
- `promotions.applyReward(input) -> { redemption, benefitSnapshot, receipt }`, with customer/subject reference and required idempotency key.
- `promotions.adjustLoyaltyBalance(input) -> { transaction, resultingBalance, receipt }`, restricted to authorized adjustment reason codes and idempotency identity.
- Read queries expose active promotions, permitted customer loyalty data, and bounded campaign results.

Only declared journal actions are fixed by the package; these API target operation names do not add declaration-owned action IDs or imply transport exposure.

## Validation and invariants

- Validate rule schema/version, date windows, promotion status, eligibility inputs, limits, currency/benefit compatibility, and customer/project ownership.
- Atomically enforce per-code, per-customer, and campaign limits within this module. Concurrent requests cannot exceed a configured limit.
- Every reward redemption, accrual, or adjustment has an idempotency key and stable operation ID. Equivalent retries return original transaction/result; conflicting reuse fails.
- Point balances derive from the transaction ledger and cannot be changed without a corresponding transaction. Reject over-redemption and integer overflow.
- Keep evaluation distinct from reservation/redemption. If a cross-module checkout fails, release or compensate only the matching uncommitted reservation; never erase a committed redemption or edit the order's accepted snapshot.
- Redemptions and accepted benefit snapshots are immutable evidence. Rule edits affect future evaluations only.

## Permissions

Derive project/actor from trusted context. Restrict promotion authoring and manual point adjustments to explicit staff permissions; customers can view only their own loyalty state and redeem only eligible rewards. Protect anti-abuse thresholds and private campaign rules from broad reads. Audit manual changes and elevated overrides.

## Events

Publish versioned events after accepted changes, for example `promotions.created.v1`, `promotions.reward-applied.v1`, and `promotions.loyalty-adjusted.v1`. Include event/operation IDs, project scope, promotion/redemption/account IDs, delta or benefit snapshot as permitted, and occurrence time. Avoid exposing sensitive eligibility logic. Consumers deduplicate; an event does not itself place or discount an order.

## Journal actions and views

- Actions, exactly as declared: `createPromotion`, `applyReward`, `adjustLoyaltyBalance`.
- Views, exactly as declared: `activePromotions`, `customerLoyalty`, `campaignResults`.
- Require confirmation for applying a reward and adjusting loyalty balance; promotion creation requires confirmation if it changes eligibility or monetary outcomes. Receipts include affected IDs, rule/benefit version, balance revision, and conditional-revert eligibility. Balance correction is a compensating ledger transaction, not deletion.

## Composer and MCP

Composer may explicitly register safe promotion/customer-loyalty queries and authorized declared mutations. Redemption mutations require a preview of the bounded benefit and explicit confirmation; adjustments require reason code, permission, idempotency key, and receipt. Catalog exposure is independent from API router registration.

No module MCP tools are declared here. Any module-specific MCP exposure needs its own explicit contract plus project enablement. Generic structural tools may read registered, policy-filtered promotion or loyalty projections but must not mutate reward/balance state, bypass atomic limits, or expose anti-abuse internals. API routes are not implicitly exposed in MCP.

## Migrations

Version rule schemas and preserve accepted promotion/redemption snapshots, idempotency identities, and append-only point transactions. Rebuild balances only from validated ledger history. Checkpoint before irreversible rule or transaction transformations; downgrade only when no eligibility or monetary meaning is lost.

## Tests and fixtures

Fixtures must be synthetic, e.g. `promotion-limit-race` and `loyalty-ledger-retry`, without fabricated customer histories or campaign results. Test rule validation/versioning, date boundaries, concurrency at configured limits, duplicate/conflicting idempotency, integer point arithmetic, ledger-derived balance, unauthorized adjustment, redemption rollback/compensation, immutable benefits, project isolation, event duplicates, and cross-module checkout failures.

## React SDK

Provide typed client, validator, form, and headless component contracts for `usePromotions` and `useLoyaltyBalance`. Present only authorized eligibility and balance projections. Hooks call injected bindings; reward application and balance adjustment must follow the declared action and confirmation rules.

## Limitations

Eligibility evaluation cannot promise future redemption capacity unless an explicit reservation exists. This module cannot make order, payment, catalog, or external campaign systems atomically consistent. Tax treatment and discount stacking need an explicit policy contract.

## Correct example

```ts
const result = await promotions.applyReward({
  customerId,
  operationId,
  promotionId,
  idempotencyKey,
});
```

The returned benefit snapshot is attached by the order owner under its own validated order operation; retries reuse the redemption identity.

## Avoid

```ts
loyaltyAccount.balancePoints -= points; // no ledger transaction or retry identity
```

Do not edit balances directly, assume an evaluation reserves a reward, or mutate an order/payment from a promotion handler without an explicit consistency design.

## Readiness evidence

Require declaration/runtime alignment, atomic limit enforcement, integer ledger behavior, idempotent redemptions and adjustments, project/customer access checks, safe benefit snapshots, duplicate event handling, versioned migrations, and deterministic contract tests across all ten surfaces and React SDK exports.
