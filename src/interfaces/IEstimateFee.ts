type IEstimateFee = (
  fromChainId: number,
  toChainId: number,
  gasLimit: number,
  pack: string,
  fromDappAddress: string,
  toDappAddress: string,
  extraParams: any[]
) => Promise<string>;

export { IEstimateFee };
