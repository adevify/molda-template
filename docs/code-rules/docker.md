# Docker rules

## Responsibility

Docker packages the accepted project revision into one immutable image containing the API and every approved UI bundle.

## Non-responsibility

The image does not own MongoDB or other stateful managed services, and Docker configuration does not authorize architecture or application work before the appropriate gate.

## Required rules

- Create the final application image only after design approval, the completed business-flow survey, and an architecture specification.
- Build API and all approved UI bundles from the same accepted source revision into the single project image.
- Pin build inputs reproducibly, use lockfile-based installs, and keep build tools out of the runtime stage when multi-stage builds are appropriate.
- Run as a non-root user, expose only required ports, and pass configuration/secrets at runtime through the deployment environment.
- Keep data in external services and support graceful process shutdown.

## Limitations

Exact base image, ports, health checks, deployment platform, and image publication policy are architecture decisions. Preview phase forbids Docker changes.

## Correct example

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/dist ./dist
USER node
CMD ["node", "dist/apps/api/server.js"]
```

The real build must include the approved API and UI bundles and use the repository's chosen supported runtime version.

## Avoid

- Mutable `latest` as the project's release identity or unpinned package installation in release builds.
- Baking credentials into image layers or including database services as container-local application state.
- Building separate mutable project images when the accepted contract is one image per revision.

## Verification

Verify the image builds from the accepted commit and lockfile, contains each approved bundle, runs as non-root, starts with runtime-only configuration, and does not contain secrets. Confirm its tag/digest maps to the exact source revision.
