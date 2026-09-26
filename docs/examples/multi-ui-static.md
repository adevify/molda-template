# Multiple static UIs

Add a second UI only when the approved user flows require a separate application
boundary, audience, or release surface. Related UIs can share the same API contracts,
services, and UI package while using different themes and copy. Static assets still
call the approved API through an application-owned adapter.

## Correct

```text
static: {
  root: "./ui/customer/index.html",
  assets: { basePath: "/assets", directory: "./assets" },
  overides: {
    operator: "./ui/operator/index.html",
    "cleaning-personal": "./ui/cleaning/index.html",
  },
}
```

This is a post-approval composition example, not a requirement to create these UIs.
`root` serves `/`; a configured `overides` key serves its HTML entry below that first
path segment, including its client-side route fallback. Reserved API, Composer, MCP,
health, and asset paths take precedence. All bundles and the API remain inside one
immutable image. During preview, pages/components remain in the allowed shared packages.

## Avoid

```text
Treat the request path as a filesystem path, create a UI for every role/color theme,
or deploy each UI as an independently mutable project release.
```

Multiple UIs add deployment and maintenance boundaries. Do not create them speculatively
or duplicate shared presentation to produce different accents.
