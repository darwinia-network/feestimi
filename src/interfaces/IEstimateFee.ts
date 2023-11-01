type Fee = string
type AbiEncodedParams = string

export type IEstimateFee = (
  fromChainId: number,
  toChainId: number,
  payload: string, // the message payload sent to msgport by the source dapp
  fromUAAddress?: string,
  toUAAddress?: string,
  refundAddress?: string,
  gasLimit?: number,
  extraParams?: any
) => Promise<[Fee, AbiEncodedParams]>;
