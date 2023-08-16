
class ChainUtilError extends Error {
  readonly _tag = "ChainUtilError";

  constructor(message: string) {
    super(`ChainUtilError: ${message}`);
  }
}

class AxelarError extends Error {
  readonly _tag = "AxelarError";

  constructor(_message: string) {
    super(`AxelarError: ${_message}`);
  }
}

class LayerZeroError extends Error {
  readonly _tag = "LayerZeroError";

  constructor(_message: string) {
    super(`LayerZeroError: ${_message}`);
  }
}

class XcmpError extends Error {
  readonly _tag = "XcmpError";

  constructor(message: string) {
    super(`XcmpError: ${message}`);
  }
}

class OrmpError extends Error {
  readonly _tag = "OrmpError";

  constructor(message: string) {
    super(`OrmpError: ${message}`);
  }
}

class CelerError extends Error {
  readonly _tag = "CelerError";

  constructor(message: string) {
    super(`CelerError: ${message}`);
  }
}

type FeestimiError = ChainUtilError | AxelarError | LayerZeroError | XcmpError | OrmpError | CelerError;

export { FeestimiError, ChainUtilError, LayerZeroError, AxelarError, XcmpError, OrmpError, CelerError };
