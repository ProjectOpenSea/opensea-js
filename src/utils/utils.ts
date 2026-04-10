export * from "./address"
export * from "./chain"
// Re-export all utilities from specialized modules
export * from "./converters"
export * from "./fees"
export * from "./protocol"
export * from "./units"

interface ErrorWithCode extends Error {
  code: string
}

export const hasErrorCode = (error: unknown): error is ErrorWithCode => {
  const untypedError = error as Partial<ErrorWithCode>
  return !!untypedError.code
}
