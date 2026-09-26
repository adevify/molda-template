# Identity module specification

## Identity

- Package: `@molda-org/identity`; id: `identity`; stage: `initial`; category: `platform-core`.
- Purpose: Customer and staff authentication, sessions, roles, and permissions.
- Declared actions: `createAccount`, `assignRole`, `revokeSession`.
- Declared views: `accounts`, `activeSessions`, `roleAssignments`.
- Declared hooks: `useSession`, `usePermissions`.

## Responsibility

Own project-scoped principal/account records, role grants and session lifecycle contracts. Authentication credentials and provider linkage are handled only by an explicitly selected identity adapter.

## Non-responsibility

Does not replace an external identity provider, own customer profiles or memberships, nor implicitly authorize operations in other modules.

## Dependencies and ownership

Depends on `core` for project scope. `customers` owns customer/person business profiles; identity may keep a typed optional link, never a duplicate profile. Other modules ask the identity authorization contract rather than reading its repository.

## Data model

Target entities: `IdentityAccount`, `RoleAssignment`, `Session`. Account contains principal ID, provider reference/status and secret-safe metadata; assignment contains project, principal, role, grantor and revision; session contains opaque identifier, expiry and revocation state. Schema IDs: `identity.account.v1`, `identity.role-assignment.v1`, `identity.session.v1`.

## API

Ordinary API operations: `createAccount`, `assignRole`, `revokeSession`, `getSession`, `listAccounts`, `listRoleAssignments`. Provisioning accepts idempotency key; role changes use expected revision and receipts. Credentials are write-only through approved adapters and never returned by reads.

## Validation and invariants

Validate project, principal and role references, role scope, expiry and state transitions. Account provisioning and revocation are retry-safe; grants cannot cross project boundaries. Revocation is terminal for that session. Reject stale role revisions; events follow accepted changes only.

## Permissions

Scopes: `identity.accounts.read`, `identity.accounts.create`, `identity.roles.assign`, `identity.sessions.read`, `identity.sessions.revoke`. Actor types: `user`, `service`, `system`. Enforce project scope, grant authority and least privilege; protect session identifiers as secrets.

## Events

Target events: `identity.account.created.v1`, `identity.role-assignment.changed.v1`, `identity.session.revoked.v1`. Carry project, principal reference, operation ID and revision; never credentials or session tokens. Consumers deduplicate event IDs.

## Journal actions and views

Actions exactly `createAccount`, `assignRole`, `revokeSession`; views exactly `accounts`, `activeSessions`, `roleAssignments`. Require confirmation for role grants that confer elevated access and session revocation; journal actor and project scope.

## Composer and MCP

Composer can use owner actions/views, with explicit preview and confirmation for grants/revocations. No explicit module MCP tools are declared. Generic structural tools cannot create accounts, grant roles or revoke sessions through structural editing.

## Migrations

Target schema version `1`; upgrade supported; safe downgrade only; checkpoint before irreversible changes. Never migrate or log plaintext credentials/tokens; preserve provider references and project-scoped grants.

## Tests and fixtures

Fixture IDs: `identity.accounts`, `identity.role-assignments`, `identity.sessions`. Cover schema secrecy, project isolation, role authorization, replay-safe provisioning, revocation idempotency, receipts and duplicate events. Use synthetic principals only.

## React SDK

Hooks exactly `useSession`, `usePermissions`. Target types: `IdentityApiClient`, `IdentityValidators`, `AccountForm`, `RoleAssignmentForm`, `SessionStatusPanel`. No credentials or raw session token in hook results.

## Limitations

Declarations do not authenticate requests, configure providers, establish password policy, or supply runtime authorization middleware.

## Correct example

An authorized project administrator assigns a role to a project principal using an expected revision and idempotency key; the mutation returns a receipt and one role-change event without exposing credentials.

## Avoid

Do not treat identity accounts as customer profiles, copy role state into dependent modules, or claim provider authentication is implemented by this declaration.

## Readiness evidence

Verify declaration alignment, all ten surfaces, provider seams, secret-safe reads, scoped policies, replay-safe mutations, event handling and migration/SDK contracts.
