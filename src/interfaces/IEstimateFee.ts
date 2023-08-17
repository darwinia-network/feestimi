import { Effect } from "effect";
import { FeestimiError } from "../errors";

type IEstimateFee = (
  fromChainId: number,
  toChainId: number,
  gasLimit: number,
  pack: string,
  fromDappAddress: string,
  toDappAddress: string,
  extraParams: any[]
) => Effect.Effect<never, FeestimiError, string>;

export { IEstimateFee };
