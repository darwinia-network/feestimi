import { Effect } from "effect";
import { BaseError } from "../errors";

type IEstimateFee = (
  fromChain: number,
  toChain: number,
  gasLimit: number,
  /* payload is often used by messaging layers to calc relayer fee */
  payload?: string,
  fromDappAddress?: string,
  toDappAddress?: string,
  extraParams?: any[]
) => Effect.Effect<never, BaseError, string>;

export { IEstimateFee };
