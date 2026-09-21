import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import type { ProjectPageModule } from "@molda-template/contracts";

import fixture from "./fixtures/project.json";
import { previewBindings } from "./bindings.js";
import { pages } from "./generated-pages.js";

function PreviewHost() {
  const [selectedId, setSelectedId] = useState(pages[0]?.id ?? "");
  const selected = useMemo(
    () => pages.find((page) => page.id === selectedId) ?? pages[0],
    [selectedId],
  ) as ProjectPageModule | undefined;

  if (!selected) throw new Error("The preview bundle contains no pages");

  const Page = selected.Component;
  const props = selected.createProps({ fixture, bindings: previewBindings });

  return (
    <>
      {pages.length > 1 ? (
        <nav aria-label="Preview pages">
          <select
            aria-label="Preview page"
            value={selected.id}
            onChange={(event) => setSelectedId(event.currentTarget.value)}
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>{page.title}</option>
            ))}
          </select>
        </nav>
      ) : null}
      <Page {...props} />
    </>
  );
}

const root = document.getElementById("molda-preview-root");
if (!root) throw new Error("Missing #molda-preview-root");
createRoot(root).render(<StrictMode><PreviewHost /></StrictMode>);
