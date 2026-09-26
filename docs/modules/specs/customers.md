# Customers module specification

## Identity

- Package: `@molda-org/customers`; id: `customers`; stage: `initial`; category: `platform-core`.
- Purpose: Customer contacts, addresses, notes, tags, and consent.
- Declared actions: `createCustomer`, `updateCustomer`, `recordConsent`.
- Declared views: `customerDirectory`, `customerProfile`, `consentHistory`.
- Declared hooks: `useCustomers`, `useCustomer`.

## Responsibility

Own project-scoped customer/person or organization records used by business workflows, including contact points, addresses, notes, tags and consent records.

## Non-responsibility

Does not own login credentials, memberships, orders, marketing-consent policy, or a CRM integration implementation.

## Dependencies and ownership

Depends on `core` for project scope. `identity` owns accounts, credentials and sessions; customers may hold a typed identity link. Orders, reservations and other workflows store customer references and their own state, not customer profile copies as authority.

## Data model

Target entities: `Customer`, `CustomerContact`, `CustomerAddress`, `CustomerNote`, `CustomerTag`, `CustomerConsent`. IDs are project-scoped; contacts/addresses and consent carry their own stable IDs. Schema IDs: `customers.customer.v1`, `customers.contact.v1`, `customers.address.v1`, `customers.consent.v1`.

## API

Ordinary API operations: `createCustomer`, `updateCustomer`, `recordConsent`, `getCustomer`, `listCustomers`, `getConsentHistory`. Mutations use project context, idempotency key for retries and expected revision for updates; return receipts suitable for conditional revert where reversible. Consent history is append-only.

## Validation and invariants

Validate contact/address structures and field-level updates; preserve stable IDs; deduplicate only by an explicitly configured external reference, never guessed personal-data matching. Every record belongs to one project. Consent records capture purpose, state, source and effective time; correction appends evidence rather than rewriting history.

## Permissions

Scopes: `customers.read`, `customers.create`, `customers.update`, `customers.consent.record`, `customers.export`. Actor types: `user`, `service`, `system`. Enforce field-level read/write permissions, project membership and minimum necessary access; audit exports and deletion requests.

## Events

Target events: `customers.customer.created.v1`, `customers.customer.updated.v1`, `customers.consent.recorded.v1`. Payloads contain customer reference, project, revision and operation ID; avoid full PII. Consumers resolve current permitted data from the owner and deduplicate event IDs.

## Journal actions and views

Actions exactly `createCustomer`, `updateCustomer`, `recordConsent`; views exactly `customerDirectory`, `customerProfile`, `consentHistory`. Require confirmation for bulk/export or destructive personal-data actions. Journal scope is project and access is rechecked per record.

## Composer and MCP

Composer may call owner actions and views after policy checks; show field changes before updates and require confirmation for export/destructive operations. No explicit module MCP tools are declared. Generic structural tools cannot read or mutate customer records by bypassing these operations.

## Migrations

Target schema version `1`; upgrade supported; downgrade only when safe; checkpoint before irreversible changes. Preserve consent chronology and stable external references. Migration diagnostics must not print personal data.

## Tests and fixtures

Fixture IDs: `customers.profile`, `customers.consent-history`. Cover project and field-level access, PII minimization, consent append-only behavior, idempotent create/update receipts, duplicate event delivery and export audit. Fixtures use neutral synthetic placeholders, never claimed customer facts.

## React SDK

Hooks exactly `useCustomers`, `useCustomer`. Target types: `CustomersApiClient`, `CustomerValidators`, `CustomerForm`, `CustomerProfileForm`, `CustomerProfilePanel`. Responses respect field-level permissions and expose revision state.

## Limitations

No identity directory, CRM synchronization, deduplication policy, or legal basis is supplied by the declaration.

## Correct example

An authorized staff actor updates a permitted contact field using the current revision; the customer owner validates project scope, returns a conditional-revert receipt and emits a minimized update event.

## Avoid

Do not store credentials here, infer consent from contact presence, use email as universally unique identity, or expose PII in event logs.

## Readiness evidence

Confirm exact declared surface names, field-level/project authorization, consent evidence, idempotency/receipts, privacy-safe events, migration behavior and SDK exports.
