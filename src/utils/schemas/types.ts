import {
  AbiType,
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
