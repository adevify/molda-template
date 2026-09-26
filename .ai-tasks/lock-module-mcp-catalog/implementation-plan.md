# Implementation Plan: Lock Module MCP Catalog

1. Refresh all direct module declaration packages to the aligned npm catalog.
2. Preserve `next` in `package.json` and exact versions/integrities in `package-lock.json`.
3. Add tests for one-version alignment and installed MCP declaration shape.
4. Run npm CI, TypeScript, specification tests, preview verification, and diff checks.
5. Commit, push, and synchronize the normal local checkout.
