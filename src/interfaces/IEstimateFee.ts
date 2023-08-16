import { Effect } from "effect";
import { FeestimiError } from "../errors";

type IEstimateFee = (
  fromChainId: number,
  toChainId: number,
  gasLimit: number, // gasLimit of recv(fromChainId,fromAddress,message)
  /* pack is often used by messaging layers to calc relayer fee */
  pack?: string,
  fromDappAddress?: string,
  toDappAddress?: string,
  extraParams?: any[]
) => Effect.Effect<never, FeestimiError, string>;

export { IEstimateFee };
