# Molda Project Template

This repository is the canonical source for Molda customer projects.

The `main` branch is a template only. A customer project is created by cloning only
`main`, applying the deterministic substitutions in [`FIRST.md`](./FIRST.md), creating
a branch named after the validated project key, and pushing the initialization commit.

## Repository shape

```text
apps/
  api/                 reserved for the approved API application
  web/                 reserved for the first approved UI application
packages/
  components/          reusable integration-free React components
  pages/               integration-free React pages
  contracts/           declarations shared by pages, adapters, and apps
  project-types/       project-only metadata extending installed module types
.preview/               preview host, real fixtures, and generated bundle
project/                versioned brief, surveys, approvals, and specifications
scripts/                deterministic preview tooling
tests/                  template and preview-boundary tests
```

During the entire preview phase, application code is intentionally absent. The Coder
may work only in the paths allowed by [`CODER.md`](./CODER.md). Architecture and full
implementation begin only after an explicit design approval is recorded in
`project/design/approval.md`.

## Commands

```sh
npm install
npm run typecheck
npm test
npm run preview:verify
npm run preview:build
```

`preview:build` intentionally fails until at least one real `*.page.tsx` page has been
created from accepted project requirements. The generated `.preview/bundle.js` always
uses the same page and component sources that application UIs will consume later.

The complete declaration-only module catalog is installed from the `@molda-org` npm
organization through its `next` dist-tag. It is development metadata for Coder and is
never a substitute for project-specific survey evidence.

## Engineering handbook

[`docs/README.md`](./docs/README.md) routes Coder runs to the exact framework, runtime,
module, and example documents required by the active workflow phase. `FIRST.md` remains
the bootstrap authority and `CODER.md` remains the phase-gate authority. Examples never
grant permission to modify a path that the active phase forbids.
