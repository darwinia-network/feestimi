type IEstimateFee = (
  fromChain: number,
  toChain: number,
  gasLimit: number,
  /* payload is often used by messaging layers to calc relayer fee */
  payload?: string,
  fromDappAddress?: string,
  toDappAddress?: string
) => Promise<{ [key: string]: string }>;

export { IEstimateFee };
