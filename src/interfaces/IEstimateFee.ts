type IEstimateFee = (
  fromChain: number,
  toChain: number,
  gasLimit: number,
  /* payload is often used by messaging layers to calc relayer fee */
  payload?: string,
  fromDappAddress?: string,
  toDappAddress?: string
) => Promise<{ [key: string]: string }>;

// define an Error type

type ChainNotSupportedError = Error;

export { IEstimateFee, ChainNotSupportedError };
