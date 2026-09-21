import type { ComponentType } from "react";

export interface PageAdapterInput<Fixture, Bindings extends object> {
  readonly fixture: Fixture;
  readonly bindings: Bindings;
}

export interface ProjectPageModule<
  Props extends object = Record<string, unknown>,
  Fixture = unknown,
  Bindings extends object = Record<string, never>,
> {
  readonly id: string;
  readonly title: string;
  readonly Component: ComponentType<Props>;
  createProps(input: PageAdapterInput<Fixture, Bindings>): Props;
}

export type AsyncAction<Input, Output = void> = (input: Input) => Promise<Output>;
