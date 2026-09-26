# Module catalog

This catalog covers exactly the 20 domain declaration packages currently listed by the template. Declarations are not runtime implementations. Ownership notes are intended boundaries; inspect a package's installed `index.d.ts` and approved architecture before relying on a particular exported type or operation.

## Core and identity

### `@molda-org/core`

- **Responsibility:** foundational project-scoped domain primitives and shared core operations.
- **Declared surface:** `initial` / `platform-core`; actions `updateProjectConfiguration`, `setFeatureFlag`; views `projectConfiguration`, `featureFlags`; hooks `useProjectConfiguration`, `useFeatureFlags`.
- **Boundaries:** does not own customer-specific business workflows, UI, authentication provider integration, or transport policy.
- **Representative data:** project identifiers, shared metadata, common resource references.
- **Commands/queries/events:** project-scoped core setup/read operations; foundational lifecycle events where declared.
- **Dependencies/constraints:** shared contract foundation; other modules may depend on core types, but core should not depend on business modules.
- **Security/idempotency:** enforce project scope; make initialization mutations idempotent; never trust caller-supplied project identity.
- **Limitations:** not a generic persistence or arbitrary configuration store.

### `@molda-org/identity`

- **Responsibility:** identity records and authentication/authorization domain contracts.
- **Declared surface:** `initial` / `platform-core`; actions `createAccount`, `assignRole`, `revokeSession`; views `accounts`, `activeSessions`, `roleAssignments`; hooks `useSession`, `usePermissions`.
- **Boundaries:** does not replace an external identity provider, own customer/member profiles, or authorize unrelated modules implicitly.
- **Representative data:** principals, credentials/provider references, roles, grants, sessions as declared.
- **Commands/queries/events:** identity and access lifecycle operations; identity/access changes may publish events.
- **Dependencies/constraints:** core project scope; integrations depend on declared provider contracts.
- **Security/idempotency:** treat secrets as write-only/sensitive; hash or delegate credential handling to approved provider; scope grants and revoke safely; replay-safe provisioning.
- **Limitations:** package declarations alone do not authenticate a request or configure a provider.

### `@molda-org/customers`

- **Responsibility:** customer/person or organization records used by business workflows.
- **Declared surface:** `initial` / `platform-core`; actions `createCustomer`, `updateCustomer`, `recordConsent`; views `customerDirectory`, `customerProfile`, `consentHistory`; hooks `useCustomers`, `useCustomer`.
- **Boundaries:** does not own login credentials, memberships, orders, or marketing consent policy unless explicitly contracted.
- **Representative data:** customer profiles, contact points, addresses, status/preferences.
- **Commands/queries/events:** create/update/find/archive customer; customer lifecycle events where declared.
- **Dependencies/constraints:** core; may be referenced by orders, reservations, quotes, and service jobs without owning their state.
- **Security/idempotency:** minimize personal data, authorize field-level reads/writes, deduplicate external references, audit exports/deletion.
- **Limitations:** not an identity directory or a CRM integration implementation.

### `@molda-org/memberships`

- **Responsibility:** membership plans and customer/member enrollment state.
- **Declared surface:** `phase-two` / `commerce`; actions `createMembership`, `consumeEntitlement`, `pauseMembership`, `renewMembership`; views `activeMemberships`, `membershipUsage`, `renewals`; hooks `useMembership`, `useMembershipUsage`.
- **Boundaries:** does not own authentication identity, payment processing, or loyalty points.
- **Representative data:** plans, enrollment, renewal/status dates, entitlements.
- **Commands/queries/events:** enroll/change/cancel membership and inspect eligibility; membership lifecycle events.
- **Dependencies/constraints:** core and customer references; payment integration is explicit if needed.
- **Security/idempotency:** prevent duplicate enrollment per policy; protect member-only details; make renewal/cancellation callbacks idempotent.
- **Limitations:** entitlement enforcement remains with the consuming operation; no payment execution is implied.

## Content and customer input

### `@molda-org/content`

- **Responsibility:** structured project-managed content and publication state.
- **Declared surface:** `initial` / `platform-core`; actions `updateBusinessProfile`, `publishContent`; views `businessProfile`, `publishedPages`; hooks `useBusinessProfile`, `useContentPage`.
- **Boundaries:** does not own media binary storage, page rendering, or arbitrary application configuration.
- **Representative data:** content entries, localized fields, drafts/publication metadata.
- **Commands/queries/events:** author, revise, publish/unpublish, query content; publication events.
- **Dependencies/constraints:** core; may reference media assets through media contracts.
- **Security/idempotency:** authorize editorial roles, validate schema/version, use revision conditions for updates and publish.
- **Limitations:** rendering and UI composition belong to consuming applications.

### `@molda-org/forms`

- **Responsibility:** form definitions, submissions, and their lifecycle contracts.
- **Declared surface:** `initial` / `platform-core`; actions `createForm`, `submitForm`, `reviewSubmission`; views `forms`, `formSubmissions`; hooks `useFormDefinition`, `useSubmitForm`.
- **Boundaries:** does not own arbitrary workflow automation, email delivery, or analytics warehouse behavior.
- **Representative data:** form schemas, submission records, validation/status metadata.
- **Commands/queries/events:** create/update forms, submit/respond, inspect permitted submissions; submission events.
- **Dependencies/constraints:** core; notification and workflow modules are optional explicit collaborators.
- **Security/idempotency:** validate submissions against published schema, rate-limit public entry points, minimize sensitive answers, dedupe submission retries.
- **Limitations:** no implicit public endpoint, spam defense, or notification behavior.

## Commerce

### `@molda-org/catalog-pricing`

- **Responsibility:** sellable catalog items and pricing/availability definitions.
- **Declared surface:** `initial` / `commerce`; actions `createCatalogItem`, `updateCatalogItem`, `updatePrice`; views `catalog`, `priceList`, `availabilityRules`; hooks `useCatalog`, `useCatalogItem`, `usePrice`.
- **Boundaries:** does not own orders, payment capture, promotion rules, or inventory fulfillment execution.
- **Representative data:** products/services, variants, price lists, currency, catalog status.
- **Commands/queries/events:** manage/query catalog and prices; catalog/pricing changes where declared.
- **Dependencies/constraints:** core; referenced by quotes, carts/orders, reservations, and rentals through stable identifiers/snapshots.
- **Security/idempotency:** constrain price edits; preserve price snapshots for downstream commitments; use optimistic revisions.
- **Limitations:** price calculation must not silently incorporate promotions or tax unless declared by its contract.

### `@molda-org/promotions-loyalty`

- **Responsibility:** promotion eligibility/redemption and loyalty accrual/redemption contracts.
- **Declared surface:** `phase-two` / `commerce`; actions `createPromotion`, `applyReward`, `adjustLoyaltyBalance`; views `activePromotions`, `customerLoyalty`, `campaignResults`; hooks `usePromotions`, `useLoyaltyBalance`.
- **Boundaries:** does not own catalog price source, order lifecycle, payment, or membership entitlement.
- **Representative data:** promotion rules, codes, loyalty accounts, point transactions.
- **Commands/queries/events:** evaluate/redeem promotions, accrue/redeem points; redemption/accrual events.
- **Dependencies/constraints:** core and customer references; may integrate with catalog pricing and orders through explicit contracts.
- **Security/idempotency:** prevent duplicate redemption/accrual, validate limits atomically, protect anti-abuse rules and balances.
- **Limitations:** does not guarantee atomicity across external payment/order systems without an explicit transaction strategy.

### `@molda-org/quotes-custom-orders`

- **Responsibility:** quote preparation, approval, and custom-order specification.
- **Declared surface:** `phase-two` / `operations`; actions `requestQuote`, `reviseQuote`, `acceptQuote`, `approveDeliverable`; views `quoteRequests`, `activeCustomOrders`, `awaitingApproval`; hooks `useQuoteRequest`, `useCustomOrder`.
- **Boundaries:** does not own the canonical catalog, order fulfillment, payment execution, or job scheduling.
- **Representative data:** quote lines, custom specifications, price/validity snapshots, approval status.
- **Commands/queries/events:** create/revise/approve/expire quotes and convert accepted quotes where declared; quote lifecycle events.
- **Dependencies/constraints:** core, customer, catalog/pricing; conversion to orders is an explicit integration.
- **Security/idempotency:** preserve revisions and approval actor, guard stale approvals, dedupe conversion to avoid duplicate orders.
- **Limitations:** quote acceptance does not imply payment or fulfillment.

### `@molda-org/orders-fulfillment`

- **Responsibility:** order lifecycle and fulfillment status/contracts.
- **Declared surface:** `initial` / `commerce`; actions `placeOrder`, `updateOrderStatus`, `assignFulfillment`, `confirmHandoff`; views `orders`, `ordersByStatus`, `fulfillmentQueue`; hooks `useCart`, `useCheckout`, `useCustomerOrders`.
- **Boundaries:** does not own catalog definitions, payment processing, or inventory systems unless separately integrated.
- **Representative data:** order and line snapshots, fulfillment units/status, shipment or handoff references.
- **Commands/queries/events:** place/change/cancel orders and advance fulfillment; order/fulfillment events.
- **Dependencies/constraints:** core and customer; explicit connections to catalog, payments, promotions, and inventory systems.
- **Security/idempotency:** idempotent placement/callbacks, immutable accepted price/line snapshots, authorize cancellations and status changes.
- **Limitations:** external shipment or stock execution requires adapters and reconciliation.

### `@molda-org/payments`

- **Responsibility:** payment intent/transaction domain contracts and provider integration seams.
- **Declared surface:** `initial` / `commerce`; actions `createPayment`, `capturePayment`, `refundPayment`, `reconcilePayment`; views `payments`, `refunds`, `reconciliation`; hooks `useCreatePayment`, `usePaymentStatus`, `useRefundPayment`.
- **Boundaries:** does not own order policy, accounting ledger, or raw card data storage.
- **Representative data:** payment intents, provider references, amount/currency, status/refund references.
- **Commands/queries/events:** initiate/confirm/refund and inspect payment state; payment lifecycle events.
- **Dependencies/constraints:** core; orders/quotes integrate explicitly; provider-specific behavior is adapter-owned.
- **Security/idempotency:** never store raw card credentials; authenticate provider webhooks, dedupe callbacks, idempotency-key money-moving calls, audit refunds.
- **Limitations:** declarations do not provide PCI compliance or guarantee settlement.

## Scheduling and experiences

### `@molda-org/scheduling`

- **Responsibility:** working hours, breaks, resources, duration/buffer rules, blocked periods, and available-slot calculation.
- **Declared surface:** `initial` / `operations`; actions `updateWorkingHours`, `blockResource`, `releaseResource`; views `availableSlots`, `resourceSchedule`, `blockedPeriods`; hooks `useAvailableSlots`, `useResourceSchedule`.
- **Boundaries:** does not own reservations, service-job execution, or event ticket inventory.
- **Representative data:** working hours, resource schedules, breaks, buffers, and blocked periods.
- **Commands/queries/events:** update availability rules, block/release resources, and calculate slots; schedule-change events where declared.
- **Dependencies/constraints:** core and customer; resource/service constraints are explicit integrations.
- **Security/idempotency:** prevent concurrent overbooking with atomic holds/conditions; expire holds; dedupe booking requests.
- **Limitations:** external calendar synchronization and time-zone policy require explicit adapters/contracts.

### `@molda-org/reservations`

- **Responsibility:** reservable resource/experience booking lifecycle.
- **Declared surface:** `initial` / `operations`; actions `createReservation`, `confirmReservation`, `rescheduleReservation`, `cancelReservation`, `markNoShow`; views `todaysReservations`, `availableSlots`, `cancelledReservations`, `customerReservationHistory`; hooks `useReservations`, `useCreateReservation`, `useCancelReservation`.
- **Boundaries:** does not own general calendar availability, ticket issuance, rental agreements, or payment execution.
- **Representative data:** reservation, party/quantity, resource reference, dates, status.
- **Commands/queries/events:** check/create/modify/cancel reservation; reservation events.
- **Dependencies/constraints:** core and customer; coordinate with scheduling or catalog according to selected domain ownership.
- **Security/idempotency:** atomic capacity checks, unique retry keys, enforce cancellation windows and protect guest data.
- **Limitations:** do not model the same capacity as independently authoritative in reservations and scheduling.

### `@molda-org/rentals`

- **Responsibility:** rental item availability, rental agreement, and return lifecycle contracts.
- **Declared surface:** `phase-two` / `operations`; actions `createRental`, `confirmPickup`, `extendRental`, `confirmReturn`; views `availableRentals`, `activeRentals`, `overdueReturns`; hooks `useRentalAvailability`, `useRental`.
- **Boundaries:** does not own general sales orders, payment processing, or maintenance job execution.
- **Representative data:** rentable assets, rental periods, handoff/return condition, agreement status.
- **Commands/queries/events:** quote/check availability, reserve/checkout/return/extend; rental lifecycle events.
- **Dependencies/constraints:** core and customer; payments, scheduling, and service jobs are explicit collaborators.
- **Security/idempotency:** prevent overlapping active rentals, record custody transitions, dedupe check-in/out operations.
- **Limitations:** physical inventory truth requires an external or separately approved asset source.

### `@molda-org/events-tickets`

- **Responsibility:** event occurrence, ticket allocation/issuance, and admission status contracts.
- **Declared surface:** `phase-two` / `operations`; actions `createEvent`, `issueTicket`, `cancelTicket`, `checkInTicket`; views `upcomingEvents`, `ticketSales`, `attendance`; hooks `useEvents`, `useTickets`.
- **Boundaries:** does not own event discovery content, payment processing, or general appointment scheduling.
- **Representative data:** event instances, ticket classes, issued ticket references, scan/admission status.
- **Commands/queries/events:** allocate/issue/cancel/validate tickets and query event availability; issuance/admission events.
- **Dependencies/constraints:** core; customer and payment references as needed; event promotion/content are separate.
- **Security/idempotency:** unique ticket/admission identifiers, prevent duplicate scans, protect transfer/cancel authority, dedupe issuance retries.
- **Limitations:** declarations do not produce secure QR codes or operate scanners.

### `@molda-org/service-jobs`

- **Responsibility:** field/service job lifecycle and assignment contracts.
- **Declared surface:** `phase-two` / `operations`; actions `createServiceJob`, `recordDiagnosis`, `approveServiceJob`, `completeServiceJob`; views `serviceQueue`, `jobsByStatus`, `readyForDelivery`; hooks `useServiceJobs`, `useServiceJob`.
- **Boundaries:** does not own service catalog, employee identity, appointment system, or general workflow engine.
- **Representative data:** job requests, tasks/checklists, assignments, status and completion evidence.
- **Commands/queries/events:** create/assign/advance/complete jobs; job lifecycle events.
- **Dependencies/constraints:** core; customer, scheduling, forms, and notifications integrate explicitly.
- **Security/idempotency:** restrict assignment and completion transitions, protect location/customer details, dedupe external status updates.
- **Limitations:** dispatch optimization and workforce credentials are not implied.

## Infrastructure and operations

### `@molda-org/media`

- **Responsibility:** media asset metadata and upload/access contracts.
- **Declared surface:** `initial` / `platform-core`; actions `createUpload`, `updateMediaAccess`, `deleteMedia`; views `mediaLibrary`, `mediaUsage`; hooks `useMediaLibrary`, `useUploadMedia`.
- **Boundaries:** does not own content publication, arbitrary file storage infrastructure, or application rendering.
- **Representative data:** asset IDs, MIME/size metadata, storage references, processing state.
- **Commands/queries/events:** request upload, register/inspect/delete assets; processing lifecycle events.
- **Dependencies/constraints:** core; content/forms may reference assets; binary storage is an external adapter.
- **Security/idempotency:** authorize signed upload/download scopes, validate type/size, avoid public exposure by default, make registration/deletion retry-safe.
- **Limitations:** package declarations do not provision storage or scan files for malware.

### `@molda-org/notifications`

- **Responsibility:** notification intent, templates, delivery status and channel contracts.
- **Declared surface:** `initial` / `platform-core`; actions `sendNotification`, `retryNotification`, `updateNotificationPreferences`; views `notificationTemplates`, `notificationDeliveryLog`; hooks `useNotificationPreferences`, `useNotificationStatus`.
- **Boundaries:** does not own source business events, identity/contact authority, or guarantee external delivery.
- **Representative data:** message templates, notification requests, recipient reference, delivery attempts/status.
- **Commands/queries/events:** enqueue/send/cancel and inspect delivery; notification status events.
- **Dependencies/constraints:** core and explicit provider adapters; can consume events from other modules without owning their data.
- **Security/idempotency:** minimize message payload PII, validate recipient permission/consent, dedupe sends, protect templates from injection.
- **Limitations:** delivery is typically at least once or provider-dependent; do not promise exactly-once delivery.

### `@molda-org/views-exports`

- **Responsibility:** named read views, export jobs, and generated data artifacts.
- **Declared surface:** `initial` / `platform-core`; actions `saveView`, `deleteView`, `createExport`; views `savedViews`, `exportHistory`; hooks `useSavedView`, `useCreateExport`.
- **Boundaries:** does not own source records, authorize access on their behalf, or provide arbitrary unrestricted queries.
- **Representative data:** view definitions, export request/status, artifact references and expiration.
- **Commands/queries/events:** query registered views and request/download permitted exports; export lifecycle events.
- **Dependencies/constraints:** core plus source module contracts; access checks must flow through owners' policy boundaries.
- **Security/idempotency:** enforce row/field scope, rate/size limits, audit sensitive exports, expire artifacts, dedupe export requests.
- **Limitations:** not a general BI engine or a bypass around module repositories.

### `@molda-org/workflow-actions-audit`

- **Responsibility:** explicit workflow action definitions/execution metadata and audit records.
- **Declared surface:** `initial` / `platform-core`; actions `executeWorkflowAction`, `approveWorkflowAction`, `compensateWorkflowAction`; views `workflowHistory`, `actionAuditLog`, `pendingApprovals`; hooks `useExecuteAction`, `useActionAudit`.
- **Boundaries:** does not own domain state transitions, arbitrary code execution, or replace platform event queue guarantees.
- **Representative data:** action definitions, execution outcomes, actor/time/reason audit records.
- **Commands/queries/events:** validate/execute registered actions and query authorized audit history; execution/audit events.
- **Dependencies/constraints:** core; domain modules expose allowed actions and remain authoritative for state changes.
- **Security/idempotency:** allowlist actions, authorize each execution, make retries safe, append audit records without secret payloads.
- **Limitations:** no dynamic evaluation of user code; delayed/retried execution belongs to the platform queue contract.

## Package count

The 20 catalog entries correspond to: `catalog-pricing`, `content`, `core`, `customers`, `events-tickets`, `forms`, `identity`, `media`, `memberships`, `notifications`, `orders-fulfillment`, `payments`, `promotions-loyalty`, `quotes-custom-orders`, `rentals`, `reservations`, `scheduling`, `service-jobs`, `views-exports`, and `workflow-actions-audit`. The shared `@molda-org/module-contracts` package is foundational and is not a domain module.
