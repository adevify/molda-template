# Package and file-layout rules

## Responsibility

Defines predictable ownership and source placement so Coder changes are reviewable and contracts remain discoverable.

## Non-responsibility

Layout does not authorize a package, module, application, or abstraction that the approved architecture does not need.

## Required rules

- Keep reusable presentation in `packages/components` and `packages/pages`; project application shells/adapters belong in
  `apps/*`; project-only type extensions belong in `packages/project-types`.
- Organize server code by owned domain/service. Keep a model's schema/types/repository contract together; put concrete
  persistence mapping, collection names, and indexes in the adapter for that model.
- Export behavior through a PascalCase service object. Keep its owned helpers private unless two real service domains need
  a technical shared abstraction.
- Use barrel files only for re-exports and intentional package registries. Do not centralize unrelated repositories,
  schemas, or service construction in a barrel.
- Name files by domain and role: `reservation.schema.ts`, `reservation.repository.ts`, `ReservationService.ts`,
  `reservation.router.ts`, `reservation.test.ts`. Follow an existing package convention when it is already stricter.
- Keep generated files identified and reproducible; never hand-edit `.preview/generated-pages.ts`, bundles, manifests, or
  generated clients.

## Limitations

Not every module needs every file. Create a file/package only for a current owned responsibility, not to populate a
generic folder template.

## Correct example

```text
src/reservations/
  reservation.schema.ts
  reservation.repository.ts
  ReservationService.ts
  reservation.router.ts
  reservation.test.ts
```

The service owns behavior, the repository contract stays with the model, and the router adapts transport.

## Avoid

- Catch-all `utils.ts`, `helpers.ts`, `manager.ts`, or `types.ts` containing unrelated domains.
- Generic factories/maps that only repackage exports.
- Copying shared schemas/types into API, database, MCP, and UI folders.
- Mixing transport, validation, business rules, persistence, and provider calls in one file/function.

## Verification

Review each new file/package for one owner and current use, check imports do not cross persistence internals, confirm
barrels only re-export/register intentionally, and run TypeScript/tests after moves.
