# Forms module specification

## Identity

- Package: `@molda-org/forms`; id: `forms`; stage: `initial`; category: `platform-core`.
- Purpose: Configurable forms, custom fields, validation, intake, and attachments.
- Declared actions: `createForm`, `submitForm`, `reviewSubmission`.
- Declared views: `forms`, `formSubmissions`.
- Declared hooks: `useFormDefinition`, `useSubmitForm`.

## Responsibility

Own form definitions, custom-field schema/version, submissions, validation and review lifecycle. Attachments reference media-owned assets.

## Non-responsibility

Does not own arbitrary workflow automation, email delivery, analytics warehouse behavior, or implicit public endpoint/spam defense.

## Dependencies and ownership

Depends on `core`; optionally calls `media` for attachments and `notifications` for explicitly requested delivery. Forms owns definitions and submission answers/status; those collaborators own media and notification records respectively.

## Data model

Target entities: `FormDefinition`, `FormRevision`, `FormSubmission`, `SubmissionReview`. Definition has fields, validation schema, publication state and revision; submission pins definition revision and contains answers, attachment references, status and timestamps. Schema IDs: `forms.definition.v1`, `forms.submission.v1`, `forms.review.v1`.

## API

Ordinary API operations: `createForm`, `submitForm`, `reviewSubmission`, `getFormDefinition`, `listForms`, `listFormSubmissions`. Public submission access exists only when an explicit deployment route enables it. Submission requires idempotency key; review uses expected revision and returns receipt for reversible status changes.

## Validation and invariants

Validate submissions against the exact published schema revision; reject unknown or invalid fields. Pin schema revision on receipt. Dedupe retries, rate-limit at configured public boundary and minimize sensitive answers. Review transitions are authorized and revision-checked. Do not emit events for invalid or rejected submissions.

## Permissions

Scopes: `forms.read`, `forms.create`, `forms.publish`, `forms.submit`, `forms.submissions.read`, `forms.submissions.review`. Actor types: `user`, `service`, `system`, `guest` only at explicitly public entrypoints. Protect sensitive answers with field-level access and retention rules.

## Events

Target events: `forms.definition.created.v1`, `forms.submission.received.v1`, `forms.submission.reviewed.v1`. Include project, form/submission IDs, schema revision and operation ID; avoid answer values. Consumers deduplicate by event ID.

## Journal actions and views

Actions exactly `createForm`, `submitForm`, `reviewSubmission`; views exactly `forms`, `formSubmissions`. Require confirmation for publication, review decisions and access to sensitive submissions. Keep public submitter and staff reviewer actors distinguishable.

## Composer and MCP

Composer may create definitions, submit only through configured route, review submissions and query permitted views. Review/submit side effects require preview/confirmation as appropriate. No explicit module MCP tools are declared. Generic structural tools do not create forms or access answers.

## Migrations

Target schema version `1`; upgrade supported; downgrade only if safe; checkpoint before irreversible changes. Preserve historical schema revisions needed to interpret submissions; never rewrite old answers to fit a new definition.

## Tests and fixtures

Fixture IDs: `forms.definitions`, `forms.submission-states`. Cover schema pinning, invalid fields, project access, public-route boundary, idempotent retries, sensitive-field permissions, review receipts and duplicate events. Use synthetic field labels and empty/neutral answers only; no invented customer fixture facts.

## React SDK

Hooks exactly `useFormDefinition`, `useSubmitForm`. Target types: `FormsApiClient`, `FormsValidators`, `FormDefinitionForm`, `FormSubmissionForm`, `FormRenderer`. Renderer is schema-driven and does not imply route/publication availability.

## Limitations

No implicit public endpoint, spam protection, notification behavior, analytics export, or workflow automation is provided.

## Correct example

A configured intake route loads a published form revision, validates a retry-keyed submission against that revision, stores only accepted answers, then emits a payload-minimized receipt event.

## Avoid

Do not validate against the latest draft, include answers in generic events, assume attachment ownership belongs to forms, or silently send notifications.

## Readiness evidence

Verify exact declaration names, version-pinned validation, explicit public exposure, answer privacy, idempotency/review receipts, integrations, migrations and React types.
