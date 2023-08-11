import { IEstimateFee } from "../interfaces/IEstimateFee";
import {
  Environment,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import chainInfo from "./chainInfo";
import chainInfoTestnet from "./chainInfoTestnet";
import { MessagingLayerError, FeestimiError } from "../errors";
import { Effect, pipe } from "effect";

const buildEstimateFee = (environment: Environment): IEstimateFee => {
  const sdk = new AxelarQueryAPI({
    environment: environment,
  });

  const estimateFee: IEstimateFee = (
    fromChain,
    toChain,
    gasLimit
  ) => {
    try {
      const fromChainInfo = getChainInfo(environment, fromChain);
      const toChainInfo = getChainInfo(environment, toChain);

      const axFromChainId = fromChainInfo[0];
      const axToChainId = toChainInfo[0];
      console.log(`Axelar estimate fee fromChain: ${axFromChainId}, toChain: ${axToChainId}`);

      const axSrcGasToken = fromChainInfo[1];
      console.log(`Axelar estimate fee SrcGasToken: ${axSrcGasToken}`)

      return pipe(
        Effect.tryPromise({
          try: () => sdk.estimateGasFee(
            axFromChainId,
            axToChainId,
            axSrcGasToken,
            gasLimit,
          ),
          catch: (error) => new MessagingLayerError('axelar', `${error}`)
        }),
        Effect.map((result) => result as string)
      )
    } catch (error: any) {
      if (error.code) {
        return Effect.fail(error)
      } else {
        return Effect.fail(new MessagingLayerError('axelar', `${error}`))
      }
    }
  }

  return estimateFee;
}

function getChainInfo(environment: Environment, chainId: number) {
  let chain;
  if (environment === Environment.MAINNET) {
    chain = chainInfo[chainId];
  } else {
    chain = chainInfoTestnet[chainId];
  }
  if (!chain) {
    throw new FeestimiError(`chain id ${chainId} not found`)
  }
  return chain;
}

export default buildEstimateFee;

