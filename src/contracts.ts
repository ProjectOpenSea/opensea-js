import type { AnnotatedFunctionABI, PartialReadonlyContractAbi } from "./types";

export const getMethod = (
  abi: PartialReadonlyContractAbi,
  name: string
): AnnotatedFunctionABI => {
  const methodAbi = abi.find((x) => x.type == "function" && x.name == name);
  if (!methodAbi) {
    throw new Error(`ABI ${name} not found`);
  }
  // Have to cast since there's a bug in
  // web3 types on the 'type' field
  return methodAbi as AnnotatedFunctionABI;
};

export { ERC1155 } from "./abi/ERC1155";
export { CanonicalWETH } from "./abi/CanonicalWETH";
