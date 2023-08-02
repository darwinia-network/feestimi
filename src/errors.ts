class BaseError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

class FeestimiError extends BaseError {
  readonly _tag = "FeestimiError"
  chainId: number

  constructor(_chainId: number, _message: string) {
    const message = `FeestimiError: chain id ${_chainId}, ${_message}`
    super(1, message)
    this.chainId = _chainId
  }
}

class MessagingLayerError extends BaseError {
  readonly _tag = "LowLevelError"
  lowLevel: string // "layerzero" | "axelar"

  constructor(_lowLevel: string, _message: string) {
    const message = `MessagingLayerError: ${_lowLevel}: ${_message}`
    super(2, message)
    this.lowLevel = _lowLevel
  }
}

export {
  BaseError,
  FeestimiError,
  MessagingLayerError
}
