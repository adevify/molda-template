# Module MCP tool plan

## Status

Target for the versioned [`Module MCP declaration contract`](./mcp-contract.md) migration. These tools are explicit
reviewed candidates; they are not inferred from tRPC routers. A runtime module must materialize each enabled candidate as
a schema-backed `ModuleMcpToolContract`, and a project may enable only the subset justified by its architecture.

## Naming and schema convention

- Tool ID: `module.<module-id>.<operation-id>`.
- `operationId`: the exact declared action or view name shown below.
- Input schema ID: `<module-id>.<operation-id>.input.v1`.
- Output schema ID: `<module-id>.<operation-id>.output.v1`.
- Declared views are read tools with `effect: "read"`, no mutation receipt, and bounded pagination/projection.
- Declared actions are write tools with `effect: "write"`, explicit confirmation/idempotency/receipt policy from the
  individual module specification, and operation evidence.
- Project, actor, role, session, repositories, providers, and audit services are injected context, never input fields.

## Explicit candidates

| Module | Read tool operation IDs | Write tool operation IDs |
| --- | --- | --- |
| `core` | `projectConfiguration`, `featureFlags` | `updateProjectConfiguration`, `setFeatureFlag` |
| `identity` | `accounts`, `activeSessions`, `roleAssignments` | `createAccount`, `assignRole`, `revokeSession` |
| `customers` | `customerDirectory`, `customerProfile`, `consentHistory` | `createCustomer`, `updateCustomer`, `recordConsent` |
| `content` | `businessProfile`, `publishedPages` | `updateBusinessProfile`, `publishContent` |
| `media` | `mediaLibrary`, `mediaUsage` | `createUpload`, `updateMediaAccess`, `deleteMedia` |
| `forms` | `forms`, `formSubmissions` | `createForm`, `submitForm`, `reviewSubmission` |
| `notifications` | `notificationTemplates`, `notificationDeliveryLog` | `sendNotification`, `retryNotification`, `updateNotificationPreferences` |
| `views-exports` | `savedViews`, `exportHistory` | `saveView`, `deleteView`, `createExport` |
| `workflow-actions-audit` | `workflowHistory`, `actionAuditLog`, `pendingApprovals` | `executeWorkflowAction`, `approveWorkflowAction`, `compensateWorkflowAction` |
| `catalog-pricing` | `catalog`, `priceList`, `availabilityRules` | `createCatalogItem`, `updateCatalogItem`, `updatePrice` |
| `orders-fulfillment` | `orders`, `ordersByStatus`, `fulfillmentQueue` | `placeOrder`, `updateOrderStatus`, `assignFulfillment`, `confirmHandoff` |
| `payments` | `payments`, `refunds`, `reconciliation` | `createPayment`, `capturePayment`, `refundPayment`, `reconcilePayment` |
| `promotions-loyalty` | `activePromotions`, `customerLoyalty`, `campaignResults` | `createPromotion`, `applyReward`, `adjustLoyaltyBalance` |
| `memberships` | `activeMemberships`, `membershipUsage`, `renewals` | `createMembership`, `consumeEntitlement`, `pauseMembership`, `renewMembership` |
| `scheduling` | `availableSlots`, `resourceSchedule`, `blockedPeriods` | `updateWorkingHours`, `blockResource`, `releaseResource` |
| `reservations` | `todaysReservations`, `availableSlots`, `cancelledReservations`, `customerReservationHistory` | `createReservation`, `confirmReservation`, `rescheduleReservation`, `cancelReservation`, `markNoShow` |
| `quotes-custom-orders` | `quoteRequests`, `activeCustomOrders`, `awaitingApproval` | `requestQuote`, `reviseQuote`, `acceptQuote`, `approveDeliverable` |
| `rentals` | `availableRentals`, `activeRentals`, `overdueReturns` | `createRental`, `confirmPickup`, `extendRental`, `confirmReturn` |
| `events-tickets` | `upcomingEvents`, `ticketSales`, `attendance` | `createEvent`, `issueTicket`, `cancelTicket`, `checkInTicket` |
| `service-jobs` | `serviceQueue`, `jobsByStatus`, `readyForDelivery` | `createServiceJob`, `recordDiagnosis`, `approveServiceJob`, `completeServiceJob` |

## Discovery cost and duplicate capability handling

Common MCP lists candidates only from selected modules and filters them by project configuration and actor permission
before returning schemas. A Composer query/mutation that wraps the same module `operationId` is marked as the preferred
project-specific capability; Studio should present/use it first and avoid sending both full schemas to the LLM unless the
module tool provides a distinct supported capability. This reduces tokens without hiding authorization-relevant tools.

## Prohibited exposure

- Do not reflect module/API routers or export every service method.
- Do not expose repositories, MongoDB collections/filters/pipelines, provider clients, or internal migration operations.
- Do not list a write tool without confirmation, idempotency, receipt, and reversibility/compensation metadata.
- Do not expose an unselected module or use tool discovery as authorization.
