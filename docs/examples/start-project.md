# Start a project

This is a process example for turning accepted requirements into a project shape. It
does not authorize implementation during preview or supply facts for a customer
project.

## Correct

```text
Accepted brief and survey answers
  -> record source and unresolved decisions
  -> agree on page and interaction contracts
  -> implement reusable presentation and preview bindings
  -> record design approval
  -> survey business flows and specify API, data, modules, and deployment
  -> implement the approved architecture
```

Keep each claim traceable to the brief or accepted survey. If a required fact is missing,
show an honest empty/loading/error state or report the missing context. The preview
phase does not create app routes, API handlers, persistence, module implementations, or
deployment code.

After approval and architecture, one project composition has this shape:

```ts
startProject({
  name: projectName,
  modules: selectedModules,
  routes: projectRouters,
  composer: { queries: projectQueries, mutations: projectMutations },
  static: {
    root: "./ui/index.html",
    assets: { basePath: "/assets", directory: "./assets" },
    overides: {},
  },
});
```

The variables come from the approved architecture; they are not discovered from this
example. `routes` remain API-only, while the common MCP tool list combines Composer
operations, explicit selected-module MCP tools, and generic scoped data tools.

## Avoid

```text
Assume a sample business, populate it with invented records, create production routes,
and treat a successful mock preview as approval for the architecture.
```

The sequence above invents project facts and skips workflow gates. The bootstrap
procedure itself is authoritative in [`FIRST.md`](../../FIRST.md); phase rules are in
[`CODER.md`](../../CODER.md).
