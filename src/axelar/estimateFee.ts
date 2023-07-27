import { IEstimateFee, Payload } from "../interfaces/IEstimateFee";
import {
  Environment,
  AxelarQueryAPI,
  EvmChain,
  GasToken,
} from "@axelar-network/axelarjs-sdk";
import chainIdMapping from "./chainIdMapping";

const axelarNativeTokens: { [chainName: string]: string } = {};
axelarNativeTokens[EvmChain.ETHEREUM] = GasToken.ETH;
axelarNativeTokens[EvmChain.BNBCHAIN] = GasToken.BINANCE;
axelarNativeTokens[EvmChain.FANTOM] = GasToken.FTM;

const buildEstimateFee = (environment: Environment): IEstimateFee => {
  const sdk = new AxelarQueryAPI({
    environment: environment,
  });

  const estimateFee: IEstimateFee = async (
    fromChain,
    toChain,
    payload: Payload
  ): Promise<string> => {
    const axFromChainId = chainIdMapping(fromChain) as string;
    const axToChainId = chainIdMapping(toChain) as string;
    console.log(`Axelar estimate fee fromChain: ${axFromChainId}, toChain: ${axToChainId}`);

    const axelarSrcGasToken = axelarNativeTokens[axFromChainId];

    return (await sdk.estimateGasFee(
      axFromChainId,
      axToChainId,
      axelarSrcGasToken,
      payload.gasLimit
    )) as string
  }

  return estimateFee;
}

export default buildEstimateFee;
