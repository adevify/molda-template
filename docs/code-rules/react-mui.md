# React and MUI rules

## Responsibility

Shared React components and pages render reusable, accessible presentation from typed props and expose interactions through typed callbacks.

## Non-responsibility

Shared presentation does not own endpoint URLs, transport clients, server state, persistence, application routing, or project-wide singleton state.

## Required rules

- Keep reusable components in `packages/components/src` and previewable pages in `packages/pages/src/*.page.tsx`.
- Components receive data and actions through typed props. Pages compose components and adapt fixture/bindings using `createProps`.
- Use MUI components and theme tokens consistently for layout, color, type, and interaction states; preserve keyboard access, semantic labels, responsive behavior, and reduced motion.
- Keep page output honest when required context is absent: represent empty/loading/error states instead of invented business data.
- Production UI wrappers supply application bindings without changing the shared component/page presentation.
- Prefer reusable MUI presentation in workspace packages. Application shells specialize shared components through
  theme configuration, copy, routing, and bindings instead of duplicating layouts or application-level CSS.
- Do not render placeholder controls or navigation for behavior that is not implemented and approved.

## Limitations

The preview host and shared packages do not imply a production application shell. Preview bindings are local demonstrations only. Do not add dependencies or change dependency versions during preview.

## Correct example

```tsx
import Button from "@mui/material/Button";

export interface SaveButtonProps {
  readonly disabled?: boolean;
  readonly onSave: () => void;
}

export function SaveButton({ disabled = false, onSave }: SaveButtonProps) {
  return <Button disabled={disabled} onClick={onSave}>Save</Button>;
}
```

## Avoid

- `fetch`, Axios, `XMLHttpRequest`, WebSocket, database clients, or browser storage in a page/component.
- Reading app routes or endpoint URLs inside a shared component.
- Creating a second preview-only component tree or hard-coding fictional product claims.

## Verification

Run `npm run typecheck`, `npm test`, `npm run preview:verify`, and `npm run preview:build` for preview changes. Review keyboard interaction, labels, responsive states, reduced motion, and that production adapters—not components—own transport wiring.
