# Architecture rules

## Responsibility

Defines application boundaries and ownership for a generated project: reusable presentation, project apps, API, external services, and the final image.

## Non-responsibility

This guide does not approve a particular project's domain model, select modules, or authorize implementation before the workflow gate.

## Required rules

- Record architecture only after design approval and the business-flow survey; capture decisions in `project/architecture/specification.md`.
- Keep reusable UI in `packages/components` and `packages/pages`; application-specific transport adapters belong in apps.
- Keep tRPC routing, MCP discovery, persistence, and presentation as distinct boundaries.
- Keep MongoDB external and shared by project applications, with data access scoped to the project.
- Build one immutable project image containing the required application bundles. A project may have multiple UI bundles when its approved architecture needs them.

## Limitations

The template reserves `apps/api` and `apps/web`; this does not require a single UI or prescribe unapproved domains. Preview work remains subject to `CODER.md`'s narrower path and behavior rules.

## Correct example

```text
packages/pages -> typed page props -> UI adapter -> tRPC client -> API router
                                              API router -> scoped repository -> external MongoDB
MCP discovery -> explicitly registered MCP tools -> validated application services
```

Build one image from the accepted commit, containing API and each approved UI bundle.

## Avoid

- Putting endpoint calls or database clients in shared components/pages.
- Treating MCP discovery as a mirror of every tRPC route.
- Embedding MongoDB as project-owned state inside each UI container.
- Building separately versioned mutable images for each UI when the project contract requires one immutable image.

## Verification

Review `project/architecture/specification.md` against approval and survey status; inspect package ownership, service boundaries, external-service configuration, and image build inputs. During preview, run the preview checks in `CODER.md` and do not cross its authored-path boundary.
