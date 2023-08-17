import { IEstimateFee } from "../interfaces/IEstimateFee";
import {
  Environment,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import chainInfo from "./chainInfo";
import chainInfoTestnet from "./chainInfoTestnet";
import { AxelarError } from "../errors";
import { Effect as E } from "effect";

type ChainInfo = [Environment, string, string];

const buildEstimateFee = (): IEstimateFee => {

  const effectEstimateGasFee = (fromChainInfo: ChainInfo, toChainInfo: ChainInfo, gasLimit: number) => {
    const sdk = getAxelarSdk(fromChainInfo[0])
    return E.tryPromise({
      try: () => sdk.estimateGasFee(
        fromChainInfo[1],
        toChainInfo[1],
        fromChainInfo[2],
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
      E.bind("fromChainInfo", () => effectGetChainInfo(fromChain)),
      E.bind("toChainInfo", () => effectGetChainInfo(toChain)),
      E.flatMap(({ fromChainInfo, toChainInfo }) => checkSameEnvironment(fromChainInfo, toChainInfo)),
      E.flatMap(({ fromChainInfo, toChainInfo }) => effectEstimateGasFee(fromChainInfo, toChainInfo, gasLimit)),
      E.map((result) => result as string)
    )
  }

  return estimateFee;
}

function checkSameEnvironment(fromChainInfo: [Environment, string, string], toChainInfo: [Environment, string, string]) {
  if (fromChainInfo[0] != toChainInfo[0]) {
    return E.fail(new AxelarError(`fromChain ${fromChainInfo[0]} and toChain ${toChainInfo[0]} are not in the same environment`))
  }

  return E.succeed({ fromChainInfo, toChainInfo })
}

function getAxelarSdk(environment: Environment) {
  return new AxelarQueryAPI({
    environment: environment,
  });
}

function effectGetChainInfo(chainId: number) {
  return E.try({
    try: () => getChainInfo(chainId),
    catch: (e) => new AxelarError(`${e}`)
  });
}

function getChainInfo(chainId: number): [Environment, string, string] {
  let chain = chainInfo[chainId];
  if (chain) {
    return [Environment.MAINNET, chain[0], chain[1]];
  }

  chain = chainInfoTestnet[chainId];
  if (chain) {
    return [Environment.TESTNET, chain[0], chain[1]];
  }

  throw `chain id ${chainId} not found`
}

export default buildEstimateFee;

