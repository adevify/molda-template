/**
 * Project-only type extension seam.
 *
 * Reuse a type from an installed `@molda-org/*` declaration package as `ModuleType`.
 * Add only fields proven by accepted project Markdown and absent from that module type
 * as `ProjectFields`. Never reproduce a module-owned entity or contract here.
 */
export type ProjectTypeExtension<
  ModuleType extends object,
  ProjectFields extends object,
> = ModuleType & ProjectFields;

export interface ProjectTypeSource {
  readonly document: `project/${string}.md`;
  readonly headingOrQuestion: string;
}

export interface ProjectTypeMetadata {
  readonly source: ProjectTypeSource;
  readonly reasonMissingFromModule: string;
}
