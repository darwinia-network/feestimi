import { IEstimateFee } from "../interfaces/IEstimateFee";
import {
  Environment,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import chainInfo from "./chainInfo";
import chainInfoTestnet from "./chainInfoTestnet";
import { AxelarError } from "../errors";
import { Effect as E } from "effect";

const buildEstimateFee = (environment: Environment): IEstimateFee => {
  const sdk = new AxelarQueryAPI({
    environment: environment,
  });

  const effectEstimateGasFee = (fromChainStr: string, toChainStr: string, srcGasToken: string, gasLimit: number) => {
    return E.tryPromise({
      try: () => sdk.estimateGasFee(
        fromChainStr,
        toChainStr,
        srcGasToken,
        gasLimit,
      ),
      catch: (error) => new AxelarError(`${error}`)
    })
  }

  const estimateFee: IEstimateFee = (
    fromChain,
    toChain,
    gasLimit
  ) => {
    return E.Do.pipe(
      E.bind("fromChainInfo", () => effectGetChainInfo(environment, fromChain)),
      E.bind("toChainInfo", () => effectGetChainInfo(environment, toChain)),
      E.flatMap(({ fromChainInfo, toChainInfo }) => effectEstimateGasFee(fromChainInfo[0], toChainInfo[0], fromChainInfo[1], gasLimit)),
      E.map((result) => result as string)
    )
  }

  return estimateFee;
}

function effectGetChainInfo(environment: Environment, chainId: number) {
  return E.try({
    try: () => getChainInfo(environment, chainId),
    catch: (e) => new AxelarError(`${e}`)
  });
}

function getChainInfo(environment: Environment, chainId: number): [string, string] {
  let chain;
  if (environment === Environment.MAINNET) {
    chain = chainInfo[chainId];
  } else {
    chain = chainInfoTestnet[chainId];
  }
  if (!chain) {
    throw `chain id ${chainId} not found`
  }
  return chain;
}

export default buildEstimateFee;

