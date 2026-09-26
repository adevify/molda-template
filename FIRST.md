# First Project Initialization

This file is the authoritative bootstrap contract for creating a customer project from
the Molda template. Complete these steps once, before any survey or Coder run.

## Inputs

The platform must supply:

- `projectKey`: lowercase kebab-case, 3–48 characters, matching
  `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`;
- `projectName`: the human-readable name;
- `projectBrief`: the initial unmodified customer brief;
- `templateRepository`: `https://github.com/adevify/molda-template`;
- `projectsRoot`: the absolute parent directory for customer clones.

The project key is the single canonical identifier. It is used as:

- the local folder name: `<projectsRoot>/<projectKey>`;
- the Git branch name: `<projectKey>`;
- the subdomain prefix: `<projectKey>.molda.localhost` locally.

## Preconditions

1. Validate `projectKey` before using it in a path, URL, or Git command.
2. Require `<projectsRoot>/<projectKey>` to be absent.
3. Require `refs/heads/<projectKey>` to be absent on the template remote.
4. Require Git authentication capable of pushing a new branch.
5. Never delete or overwrite an existing folder or remote branch to make creation pass.

## Clone and branch

Clone only the canonical template branch:

```sh
git clone --branch main --single-branch \
  https://github.com/adevify/molda-template.git \
  <projectsRoot>/<projectKey>
cd <projectsRoot>/<projectKey>
git switch -c <projectKey>
```

Do not create project work directly on `main`.

## Required substitutions

Apply these substitutions without changing dependency versions or adding application
code:

1. Root `package.json`
   - `name`: `molda-project-template` → `@molda-project/<projectKey>`
2. Workspace package scopes
   - replace every `@molda-template/` occurrence in tracked package metadata, the
     lockfile, TypeScript imports, and Markdown with `@<projectKey>/`;
   - confirm no `@molda-template/` import remains outside `FIRST.md` after bootstrap.
3. `project/project.md`
   - `{{PROJECT_KEY}}` → validated key
   - `{{PROJECT_NAME}}` → human-readable name
   - `{{PROJECT_SUBDOMAIN}}` → derived subdomain
   - `{{PROJECT_BRIEF}}` → original brief, preserved verbatim
   - `{{CREATED_AT}}` → ISO-8601 creation timestamp
4. `project/workflow.md`
   - replace the same project identity tokens;
   - keep phase `project-survey`, state `active`, and design revision `0`.

Search for unresolved `{{...}}` tokens before committing. Tokens documented as examples
inside `FIRST.md` are exempt; no other tracked file may retain them.

## Install the declaration catalog

The root `devDependencies` intentionally prelist `@molda-org/module-contracts` and all
20 `@molda-org/*` module declaration packages from the npm `next` channel. Run
`npm install` after the project substitutions. This resolves the current tested
declaration catalog, updates `package-lock.json`, and makes the module types available
to the Coder on the first project branch.

These packages are development-time type information. Do not copy their sources into
the project, implement them locally, move them to runtime dependencies, or remove
unselected modules during preview. Module selection happens after design approval;
the complete declaration catalog remains available for discovery and type reuse.

## Initial commit

Run the template checks, commit all bootstrap substitutions, and push only the project
branch:

```sh
npm install
npm run typecheck
npm test
git add --all
git commit -m "chore: initialize <projectKey>"
git push --set-upstream origin <projectKey>
```

Project creation is complete only after the push succeeds. If cloning, substitution,
verification, commit, or push fails, report the exact phase and preserve a recoverable
local clone. Do not create a successful project record prematurely.

## After initialization

- The control plane writes questions and accepted answers to `project/surveys/*.md`.
- The Coder reads `CODER.md` before every run.
- The Coder uses `docs/README.md` to load only the framework and runtime rules required
  by the active task.
- Preview work remains limited to components, pages, preview fixtures/bindings, the
  declaration-only `packages/project-types` extension, and the generated preview bundle
  until design approval.
- Architecture, API, database entities, modules, and Docker application assembly are
  forbidden until `project/design/approval.md` records approval.
