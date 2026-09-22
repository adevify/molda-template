# Molda Coder Specification

This is the mandatory execution contract for every Coder run in a customer-project
branch. Read `FIRST.md`, `project/project.md`, `project/workflow.md`, all completed
survey Markdown files, the current design decision files, and the installed
`@molda-org/*` declarations before editing anything.

## Workflow gates

The repository moves through these gates:

1. project survey;
2. design survey;
3. preview generation and design iterations;
4. explicit design approval;
5. business-flow survey;
6. architecture;
7. implementation and build;
8. testing and release.

Never start work from a later gate. The current gate is recorded in
`project/workflow.md`.

## Preview phase: complete contract

The first design task and every subsequent design iteration have one purpose: produce
or refine the real reusable React presentation and a quick preview of it.

### Allowed authored paths

- `packages/components/src/**`
- `packages/pages/src/**`
- `packages/project-types/index.d.ts`
- `.preview/fixtures/**`
- `.preview/bindings.ts`

The deterministic preview tool may generate:

- `.preview/generated-pages.ts`
- `.preview/bundle.js`
- `.preview/manifest.json`

Do not edit generated files manually.

### Forbidden during preview

- any file under `apps/**`;
- any API route, server, RPC, database, repository, persistence, media backend, or
  authentication implementation;
- any module selection or module implementation;
- Docker or deployment implementation;
- package installation or dependency/version changes;
- direct network or storage calls in components/pages, including `fetch`, Axios,
  `XMLHttpRequest`, WebSocket, database clients, and browser storage;
- edits outside the allowed authored paths merely to make verification pass;
- fake examples, canned products, invented testimonials, or placeholder business data.
- redeclarations of an entity, action, view, hook, contract, or metadata already
  represented by an installed `@molda-org/*` package.

If required information is missing, represent an honest empty/loading/error state or
return a precise missing-context report. Never manufacture project facts.

### Component contract

- Components are reusable presentation units.
- Data, state transitions, and actions enter through typed props.
- Components never know endpoint URLs, transport clients, database entities, or app
  routing infrastructure.
- Prefer composition over project-wide singleton state.
- Keep accessibility, keyboard behavior, responsive layout, and reduced-motion behavior
  inside the presentation contract.

### Page contract

- Each previewable page lives in `packages/pages/src` and ends with `.page.tsx`.
- Each page default-exports one `ProjectPageModule` from `@molda-template/contracts`
  (the scope is replaced during initialization).
- The module declares a stable `id`, human-readable `title`, React `Component`, and
  `createProps({ fixture, bindings })` adapter.
- Pages compose components but do not perform API calls.
- `createProps` is the seam used by both fixture-backed preview and future application
  wrappers/higher-order components.

### Fixtures and bindings

- `.preview/fixtures/project.json` contains only facts derived from the initial brief and
  accepted survey answers.
- `.preview/fixtures/SOURCES.md` maps every populated fixture section to its exact
  project Markdown file and heading or question identifier.
- Fixture structures reuse installed `@molda-org/*` types whenever the catalog covers
  the concept.
- `packages/project-types/index.d.ts` may add only project-specific metadata absent from
  the module catalog. Project types must extend or compose module types; they must not
  copy, rename, or shadow a module-owned type.
- `.preview/bindings.ts` contains preview-local action implementations needed to
  demonstrate interaction. It must not call a remote API.
- Application integrations later provide another implementation of the same typed
  bindings without changing the component/page presentation.

### Preview bundle

`npm run preview:build` discovers every `*.page.tsx`, generates the registry, and bundles
the preview host plus all discovered pages into `.preview/bundle.js`. Do not build a
second preview-only component tree. The bundle must import the same pages and components
that future UIs will use.

### Required preview verification

Before finishing a preview run:

```sh
npm run typecheck
npm test
npm run preview:verify
npm run preview:build
```

Finish only when all checks pass and the required preview artifacts exist. Report the
changed authored files, the module types reused, the project-only type extensions, the
fixture source mappings, and the page IDs included in the bundle.

## Design approval gate

Preview iteration continues until `project/design/approval.md` contains:

```text
Status: approved
```

Without that exact accepted state, do not modify `apps/**`, introduce production data
models, select modules, or create the final project Docker image.

## Architecture phase

After approval and the completed business-flow survey, architecture may decide:

- required apps, with at least one API and one UI;
- whether multiple UIs are justified;
- API version and public contracts;
- external MongoDB entities and indexes;
- external media contracts;
- reusable module selection;
- application adapters/wrappers that connect bindings to the API;
- glue code, background work, security, tests, and migrations;
- one final Docker image containing all project applications.

Record these decisions in `project/architecture/specification.md` before implementation.

## Build phase

Only the build phase implements application code and production integration. Preserve
the approved components/pages; connect them through typed adapters instead of rewriting
them. MongoDB, media, and other stateful services remain external. The repository must
produce one self-contained project image, versioned from the exact accepted commit.
