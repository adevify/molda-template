# Dependency management rules

## Responsibility

Defines how workspace and runtime dependencies are selected, versioned, installed, and updated reproducibly.

## Non-responsibility

A dependency entry does not approve a framework change, module selection, runtime capability, or preview-phase package
installation.

## Required rules

- Use npm workspaces and the committed lockfile. Release and verification installs use `npm ci`.
- Use one exact direct version of a package across the workspace. Align transitive conflicts with a reviewed root override
  when necessary; never install multiple direct versions to silence TypeScript incompatibility.
- Classify runtime imports as `dependencies` of the package that ships them. Use `devDependencies` for build/test/type
  tooling and the declaration-only `@molda-org/*` catalog.
- Add a dependency only after the active workflow gate permits it and architecture records why existing platform/shared
  code cannot satisfy the requirement.
- Review package provenance, license, maintenance, install scripts, browser/server boundary, bundle/runtime cost, and
  known vulnerabilities before acceptance.
- Commit `package.json` and lockfile changes together; never hand-edit resolved lockfile integrity metadata.

## Limitations

A clean vulnerability scan does not prove a package is safe or appropriate. The `next` module declarations are
development metadata and do not provide runtime implementations.

## Correct example

```json
{
  "dependencies": { "zod": "4.6.5" },
  "devDependencies": { "typescript": "5.9.3" }
}
```

Every workspace requiring `zod` uses the same exact version selected by the root policy.

## Avoid

- Version ranges or different direct versions of the same package across workspaces.
- Moving declaration-only module packages into runtime dependencies.
- Installing a second router/schema/state library for convenience without an architecture decision.
- Package installation or version changes during preview.

## Verification

Run `npm ci`, workspace typecheck/tests, dependency-tree duplicate checks, license/security review, and the relevant bundle
or runtime build. Confirm the lockfile contains no unintended source, lifecycle script, or version change.
