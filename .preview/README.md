# Preview workspace

The preview host discovers every `packages/pages/src/**/*.page.tsx` file and bundles it
with the shared components and real project fixture. Coder-authored work belongs only in
the fixture, bindings, pages, and components allowed by `CODER.md`.

Every non-empty fixture section must be traced in `fixtures/SOURCES.md` to accepted
project Markdown. Empty fixtures are valid; invented demonstration data is not.

`generated-pages.ts`, `bundle.js`, and `manifest.json` are generated artifacts and must
not be edited manually.
