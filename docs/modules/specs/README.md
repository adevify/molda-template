# Individual module specifications

These documents are normative targets for future runtime packages. Identity metadata and action/view/hook names are
declaration-backed; detailed entities, schemas, permissions, API operations, events, migrations, tests, and React SDK
surfaces are target contracts and do not claim an implementation exists.

The machine-readable [`../manifest.json`](../manifest.json) binds every installed declaration package to exactly one
specification and is verified against installed `.d.ts` files by the repository tests.

## Platform core

- [`core`](./core.md)
- [`identity`](./identity.md)
- [`customers`](./customers.md)
- [`content`](./content.md)
- [`media`](./media.md)
- [`forms`](./forms.md)
- [`notifications`](./notifications.md)
- [`views-exports`](./views-exports.md)
- [`workflow-actions-audit`](./workflow-actions-audit.md)

## Commerce

- [`catalog-pricing`](./catalog-pricing.md)
- [`orders-fulfillment`](./orders-fulfillment.md)
- [`payments`](./payments.md)
- [`promotions-loyalty`](./promotions-loyalty.md)
- [`memberships`](./memberships.md)

## Operations

- [`scheduling`](./scheduling.md)
- [`reservations`](./reservations.md)
- [`quotes-custom-orders`](./quotes-custom-orders.md)
- [`rentals`](./rentals.md)
- [`events-tickets`](./events-tickets.md)
- [`service-jobs`](./service-jobs.md)

Select only modules justified by accepted project requirements. Read each selected spec together with
[`../../code-rules/module-authoring.md`](../../code-rules/module-authoring.md), its installed declaration, and the approved
project architecture.

Module-specific LLM exposure also requires the versioned [`../mcp-contract.md`](../mcp-contract.md) and the explicit
[`../mcp-tool-plan.md`](../mcp-tool-plan.md); the current declarations do not yet implement that surface.
