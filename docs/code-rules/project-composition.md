# Project composition

## Responsibility

Defines how one approved Molda project is assembled and validated at the runtime boundary.

## Non-responsibility

Composition does not decide project requirements, implement a module, or authorize work before `project/workflow.md`
reaches the architecture/build gates.

## Required rules

The platform entry point is:

```ts
startProject({
  name,
  modules,
  routes,
  composer,
  static,
});
```

- `name` identifies the project and scopes its data, jobs, and operations.
- `modules` selects configured module instances and their dependencies.
- `routes` declares ordinary API routes. Route registration alone never exposes an MCP tool.
- `composer` declares only the reusable owner-facing queries and mutations that Studio renders and invokes.
- `static` declares `root`, `assets`, and `overides`. The accepted field spelling is `overides`; keep that spelling in the public contract unless a separately versioned migration is approved.

`static.root` is the default HTML entry for `/` and unknown non-reserved application routes. `static.assets` maps one
public asset prefix to its built directory. `static.overides` maps a stable first path segment to another built HTML
entry: for example, `"cleaning-personal": "./ui/cleaning/index.html"` serves that UI below `/cleaning-personal` and
falls back to its entry for its client-side routes. Reserved server prefixes such as the API, Composer, MCP, health, and
asset paths take precedence over UI fallback. Resolve only configured paths; never translate arbitrary request input
into filesystem access.

Keep project composition declarative. Each module owns its domain behavior and contributes only through its declared contracts. The API application wires composition and transport; UI applications consume its supported interfaces.

The validated composition derives separate manifests:

1. **Project API:** selected-module routers plus explicitly registered project `routes`; this is the typed surface used by
   project UI application adapters.
2. **Studio Composer catalog:** only explicit `composer.queries` and `composer.mutations`, including supported input and
   output presentation metadata.
3. **Common MCP tool manifest:** authorized Composer operations plus explicit selected-module MCP tools plus generic
   scoped structural data tools.
4. **Event catalog:** selected-module and project event definitions/handlers registered through `EventsModule`.
5. **Static manifest:** root entry, shared asset prefix/directory, named `overides` entries, and reserved-prefix order.

Validate and expose these as different contracts. Do not manufacture one reflective registry and use it for every
consumer.

## Boundaries

- API routes are HTTP/API surface only. An MCP tool requires an explicit MCP exposure declaration and authorization policy.
- The Studio Composer catalog contains only `composer.queries` and `composer.mutations`. The common MCP `tools/list`
  result separately combines those Composer operations, explicitly exposed tools from selected modules, and generic
  project-scoped structural data tools. These are distinct sources with distinct contracts.
- A project must not obtain access to unselected module capabilities by naming or guessing a route or tool.
- A module dependency is explicit and validated at startup. Cross-module calls go through published contracts, not another module's repository internals.
- Static UI serving supports multiple independent UI roots in one project. A project may serve the customer-facing site and an administration UI (or other configured UIs) from separate roots.

## Lifecycle and failure behavior

Validate project identity, selected module dependencies, route uniqueness, Composer registrations, MCP exposure, and static paths before accepting traffic. Fail startup with a clear configuration error if a required dependency or collision is invalid. Never silently widen module selection or tool exposure to recover.

## Limitations

This composition contract does not prescribe a web framework, database implementation, deployment topology, or implicit route-to-tool adapter. Those choices belong to the approved project architecture and module contracts.

## Correct example

```ts
startProject({
  name: "barber",
  modules: [CatalogModule, FileStorageModule],
  routes: [contentRouter, projectRouter],
  composer: { queries: [], mutations: [] },
  static: {
    root: "./ui/index.html",
    assets: { basePath: "/assets", directory: "./assets" },
    overides: {
      customer: "./ui/customer/index.html",
      "cleaning-personal": "./ui/cleaning/index.html",
    },
  },
});
```

The example shows contract shape only. Use only selected modules, routes, Composer entries, and UI paths justified by the
approved project architecture.

## Avoid

- Inferring MCP tools from `routes`.
- Letting request paths escape configured static directories.
- Adding a UI, module, or operation only because the template example contains it.
- Renaming `overides` without a versioned contract migration.

## Verification

At startup, validate project identity, module dependencies, API route collisions, Composer schemas and identifiers, MCP
tool collisions, reserved path collisions, static entries, and containment of all resolved filesystem paths. Contract
tests must prove invalid composition fails before traffic is accepted.
