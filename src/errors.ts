class FeeBaseError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

class ChainNotFoundError extends FeeBaseError {
  readonly _tag = "ChainNotFoundError"
  chainId: number
  lowLevel: string // "layerzero" | "axelar"
  side?: string // "from" | "to"

  constructor(_chainId: number, _lowLevel: string, _side?: string) {
    let side = _side ? ", ${side: from}" : ""
    super(102, `Chain ${_chainId}'s ${_lowLevel} id not found in ${_lowLevel} chain list${side}`)
    this.chainId = _chainId
    this.lowLevel = _lowLevel
    this.side = _side
  }
}

class MultiChainIdFound extends FeeBaseError {
  readonly _tag = "MultiChainIdFound"
  chainId: number
  lowLevel: string // "layerzero" | "axelar"
  side?: string // "from" | "to"

  constructor(_chainId: number, _lowLevel: string, _side?: string) {
    let side = _side ? ", ${side: from}" : ""
    super(106, `Multiple ${_lowLevel} ids found for chain ${_chainId} in ${_lowLevel} chain list${side}`)
    this.chainId = _chainId
    this.lowLevel = _lowLevel
    this.side = _side
  }
}


class RouteNotFoundError extends FeeBaseError {
  readonly _tag = "RouteNotFoundError"
  fromChainId: number
  toChainId: number

  constructor(_fromChainId: number, _toChainId: number) {
    super(103, `Route from ${_fromChainId} to ${_toChainId} not found`)
    this.fromChainId = _fromChainId
    this.toChainId = _toChainId
  }
}

class ChainInfoMissingError extends FeeBaseError {
  readonly _tag = "ChainInfoMissingError"
  chainId: number
  what: string

  constructor(_chainId: number, _what: string) {
    super(104, `Chain ${_chainId} missing ${_what}`)
    this.chainId = _chainId
    this.what = _what
  }
}

class ChainNotFoundInMiniError extends FeeBaseError {
  readonly _tag = "ChainNotFoundInMiniError"
  chainId: number

  constructor(_chainId: number) {
    super(105, `Chain ${_chainId} not found in chain_mini.json`)
    this.chainId = _chainId
  }
}

class LayerzeroError extends FeeBaseError {
  readonly _tag = "LayerzeroError"

  constructor(_message: string) {
    super(1000, _message)
  }
}

class AxelarError extends FeeBaseError {
  readonly _tag = "AxelarError"

  constructor(_message: string) {
    super(2000, _message)
  }
}


class UnknownError extends FeeBaseError {
  readonly _tag = "UnknownError"

  constructor(_code: number, _message: string) {
    super(_code, _message)
  }
}
export {
  FeeBaseError,
  ChainNotFoundError, RouteNotFoundError, ChainInfoMissingError, ChainNotFoundInMiniError, MultiChainIdFound,
  UnknownError,
  LayerzeroError, AxelarError
}
