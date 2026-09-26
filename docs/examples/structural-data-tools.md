# Structural project-data tools

Use the common MCP's structural tools when a project-specific resource is known to the registered data catalog but no
purpose-built module/Composer operation exists. The example names describe shape only and are not fixture data.

## Correct

```ts
await tools.call("projectData.count", {
  resource: "records",
  where: {
    op: "and",
    values: [
      { op: "gte", field: "createdAt", value: startOfPeriod },
      { op: "lt", field: "createdAt", value: endOfPeriod },
    ],
  },
});
```

The session chooses the project database. The registered resource schema validates the resource, fields, operators, and
values; the actor policy limits access. For writes, create/apply a bounded plan and return a mutation receipt suitable
for inspection and conditional revert.

## Avoid

```ts
await tools.call("database.run", {
  database: userInput,
  collection: userInput,
  pipeline: JSON.parse(userInput),
});
```

Raw database addressing and pipelines make project isolation, injection defense, affected-record evidence, and safe
revert unverifiable. Use the versioned structural AST or a purpose-built module/Composer operation.
