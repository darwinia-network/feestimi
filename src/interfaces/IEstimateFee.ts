type IEstimateFee = (
  fromChain: number,
  toChain: number,
  payload: Payload,
  fromDappAddress?: string,
  toDappAddress?: string,
) => Promise<string>;

type Payload = {
  content?: string;
  gasLimit?: number;
}

export { IEstimateFee, Payload };
