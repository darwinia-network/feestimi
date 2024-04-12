export type Gas = {
  gasForMessagingLayer: number,
  gasForMsgport: number,
  multiplier: number,
  total: number
}

export type Fee = {
  fee: string,
  params: string,
  gas: Gas
}

export type IEstimateFee = (
  fromChainId: number,
  toChainId: number,
  payload: string, // the message payload sent to msgport by the source dapp
  fromUAAddress?: string,
  toUAAddress?: string,
  refundAddress?: string,
  gasLimit?: number,
  extraParams?: any
) => Promise<Fee>;
