import {
  AbiType,
  AnnotatedFunctionABI,
  FunctionInputKind,
  FunctionOutputKind,
  StateMutability,
} from "../../types";

export enum EventInputKind {
  Source = "source",
  Destination = "destination",
  Asset = "asset",
  Other = "other",
}

export { AbiType, FunctionInputKind, FunctionOutputKind, StateMutability };

export type { AnnotatedFunctionABI };
