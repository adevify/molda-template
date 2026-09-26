# Notifications module specification

## Identity

- Package: `@molda-org/notifications`; id: `notifications`; stage: `initial`; category: `platform-core`.
- Purpose: Email, SMS, push, templates, preferences, retries, and delivery evidence.
- Declared actions: `sendNotification`, `retryNotification`, `updateNotificationPreferences`.
- Declared views: `notificationTemplates`, `notificationDeliveryLog`.
- Declared hooks: `useNotificationPreferences`, `useNotificationStatus`.

## Responsibility

Own notification intent, templates, recipient references/preferences, provider dispatch requests, attempts and delivery evidence through explicit channel adapters.

## Non-responsibility

Does not own source business events, identity/contact authority, consent policy, or guarantee external delivery.

## Dependencies and ownership

Depends on `core` and explicitly configured delivery providers. May consume events or be invoked by other modules, but source modules retain their own business state. Recipient contact and consent authority remains with its owning domain (for example, `customers`); notifications checks an explicit authorized snapshot/contract and does not copy it as authority.

## Data model

Target entities: `NotificationTemplate`, `NotificationRequest`, `NotificationAttempt`, `NotificationPreference`. Requests carry project, channel, recipient reference, template/version, idempotency key and status; attempts carry provider reference, timestamps and outcome. Schema IDs: `notifications.template.v1`, `notifications.request.v1`, `notifications.attempt.v1`, `notifications.preference.v1`.

## API

Ordinary API operations: `sendNotification`, `retryNotification`, `updateNotificationPreferences`, `getNotificationStatus`, `listNotificationTemplates`, `listDeliveryLog`. Sending deduplicates by project and idempotency key and returns a receipt; retry targets a failed eligible attempt and is itself retry-safe. Provider callbacks are authenticated and deduplicated.

## Validation and invariants

Validate channel/template compatibility, recipient permission and consent, template variables and provider configuration. Minimize PII in persisted request/event payloads. Delivery is at least once/provider-dependent; statuses distinguish queued, attempted, accepted, delivered, failed and unknown as adapter evidence supports. No exactly-once claim.

## Permissions

Scopes: `notifications.send`, `notifications.retry`, `notifications.preferences.update`, `notifications.templates.read`, `notifications.delivery.read`. Actor types: `user`, `service`, `system`. Recheck project and recipient/channel permissions at execution time; template editing scope is separate if enabled.

## Events

Target events: `notifications.requested.v1`, `notifications.delivery-status.changed.v1`. Include project, request ID, channel, status, attempt number and operation ID; omit message body, contact details and secrets. Consumers and webhooks deduplicate event/provider IDs.

## Journal actions and views

Actions exactly `sendNotification`, `retryNotification`, `updateNotificationPreferences`; views exactly `notificationTemplates`, `notificationDeliveryLog`. Require confirmation for sends to external recipients and retries that may produce another delivery. Journal actor, request/attempt IDs and outcome, not content or secrets.

## Composer and MCP

Composer may send/retry through owner mutations and update preferences, with a rendered content/recipient/channel preview and explicit confirmation before dispatch. No explicit module MCP tools are declared. Generic structural tools cannot cause a send or bypass recipient policy.

## Migrations

Target schema version `1`; upgrade supported; downgrade only when safe; checkpoint before irreversible changes. Preserve delivery evidence and idempotency keys for the agreed retention period; avoid migrating provider secrets into records.

## Tests and fixtures

Fixture IDs: `notifications.request-states`, `notifications.templates`, `notifications.provider-callbacks`. Cover variable validation/injection resistance, consent gate, project isolation, retry idempotency, duplicate callbacks, receipt/event behavior and provider uncertainty. Use synthetic template text without personal data.

## React SDK

Hooks exactly `useNotificationPreferences`, `useNotificationStatus`. Target types: `NotificationsApiClient`, `NotificationValidators`, `NotificationPreferencesForm`, `NotificationRequestForm`, `NotificationStatusPanel`. Status must represent unknown/provider-pending states without promising delivery.

## Limitations

Provider delivery, exactly-once semantics, consent law/policy, identity contacts and business-event ownership are not supplied by declarations.

## Correct example

An authorized operator previews a templated message using an approved recipient reference, confirms `sendNotification` with an idempotency key, and receives a request receipt; provider callbacks update evidence without duplicate attempts.

## Avoid

Do not treat accepted-by-provider as delivered, retry blindly without dedupe, embed secrets/PII in events, or send automatically from unrelated module events without explicit subscription policy.

## Readiness evidence

Confirm explicit provider/recipient contracts, consent and authorization gates, payload minimization, idempotent send/retry receipts, duplicate-safe callbacks/events, migration retention and SDK status semantics.
