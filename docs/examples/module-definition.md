# Module definition

A reusable module owns a coherent capability and exposes a stable, typed contract.
Start with declarations and ownership boundaries; an application composes selected
modules after design approval. Customer projects reuse installed module types and do
not copy a module implementation into their own packages.

## Correct

```ts
export type ContentModuleRuntime = MoldaModuleDefinition<ContentModuleShape>;

export const contentModule: ContentModuleRuntime = defineModule({
  id: "content",
  stage: "initial",
  category: "platform-core",
  purpose: ContentModulePurpose,
  dependencies: [],
  surfaces: AllModuleSurfaces,
  dataModel,
  api,
  validation,
  permissions,
  events,
  journal,
  migrations,
  testing,
  reactSdk,
});
```

This shape is illustrative and must be adapted to the exact installed declarations. A
runtime definition supplies all ten declared surfaces: data model, API, validation,
permissions, events, journal actions/views, migrations, tests/fixtures, and React SDK.
Prefer shared schemas over parallel redefinitions and keep module dependencies explicit.

## Avoid

```ts
export const contentModule = { id: "content", router: contentRouter } as any;
```

Do not redeclare an entity already owned by an installed module, create generic maps
that only repackage exports, or implement module runtime behavior during the preview
phase. Select and compose only modules justified by accepted requirements.
