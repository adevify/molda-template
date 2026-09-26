# TypeScript rules

## Responsibility

Defines static type ownership, strict contracts, and reuse of the installed declaration catalog.

## Non-responsibility

Types do not validate untrusted runtime values and do not replace accepted project facts, schemas, or module contracts.

## Required rules

- Use TypeScript for authored application and shared package code; keep contracts explicit at package and service boundaries.
- Reuse installed `@molda-org/*` declarations when they own a concept. Add only evidenced project-specific metadata through `packages/project-types/index.d.ts`.
- Derive types from runtime schemas where practical; do not create parallel, drifting input definitions.
- Use `unknown` for untrusted values until validated. Prefer discriminated unions for finite result states.
- Keep UI props transport-agnostic and typed; `createProps` adapts fixtures/bindings to the page contract.
- Export domain behavior through a PascalCase service object when one service owns it, for example
  `ReservationService.create(...)`. Keep owned technical helpers private instead of splitting the same domain between
  `utils` and `services`.
- Model expected domain failures with an explicit discriminated result; throw for unexpected infrastructure/programmer
  failures and map them safely at the boundary.
- Use one exact version of a dependency across the workspace. Do not resolve incompatible types by installing multiple
  direct versions.

## Limitations

Static types are erased at runtime. Declaration packages document contracts but do not provide runtime implementations. The current package catalog is intentionally available during preview; do not copy its types into project declarations.

## Correct example

```ts
import type { ProjectTypeExtension } from "../project-types/index.js";
import type { Customer } from "@molda-org/customers";

export type ProjectCustomer = ProjectTypeExtension<Customer, {
  readonly projectLabel: string;
}>;

export type SaveResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reason: "invalid_input" | "not_found" };
```

Only add `projectLabel` when accepted project information requires it and the module type lacks it.

## Avoid

- `any` at API, database, or module boundaries.
- Redeclaring an installed module-owned entity under a project-specific name.
- Assuming a TypeScript cast validates JSON received over the network.
- Detached exported service functions when they all belong to one service lifecycle.
- Generic maps/factories that merely repackage existing exports without stronger typing, lifecycle, or behavior.

## Verification

Run `npm run typecheck`. Inspect public exports and imports for catalog reuse and project-only extensions; verify runtime inputs are separately parsed by schemas.
