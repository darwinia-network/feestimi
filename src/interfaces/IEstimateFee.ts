export type IEstimateFee = (
  fromChainId: number,
  toChainId: number,
  gasLimit: number,
  pack: string,
  fromDappAddress: string,
  toDappAddress: string,
  refundAddress: string,
  extraParams?: any[]
) => Promise<[string, string]>;

