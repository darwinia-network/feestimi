class BaseError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

class FeestimiError extends BaseError {
  readonly _tag = "FeestimiError"

  constructor(_message: string) {
    const message = `FeestimiError: ${_message}`
    super(1, message)
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
