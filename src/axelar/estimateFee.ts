import { IEstimateFee, ChainNotSupportedError } from "../interfaces/IEstimateFee";
import {
  Environment,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import chainInfo from "./chainInfo";
import chainInfoTestnet from "./chainInfoTestnet";

const buildEstimateFee = (environment: Environment): IEstimateFee => {
  const sdk = new AxelarQueryAPI({
    environment: environment,
  });

  const estimateFee: IEstimateFee = async (
    fromChain,
    toChain,
    gasLimit
  ): Promise<{ [key: string]: string }> => {

    const fromChainInfo = getChainInfo(environment, fromChain);
    const toChainInfo = getChainInfo(environment, toChain);

    const axFromChainId = fromChainInfo[0];
    const axToChainId = toChainInfo[0];
    console.log(`Axelar estimate fee fromChain: ${axFromChainId}, toChain: ${axToChainId}`);

    const axSrcGasToken = fromChainInfo[1];
    console.log(`Axelar estimate fee SrcGasToken: ${axSrcGasToken}`)

    return {
      fee: (await sdk.estimateGasFee(
        axFromChainId,
        axToChainId,
        axSrcGasToken,
        gasLimit,
      )) as string
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
    throw new Error(`chain not found. chainId: ${chainId}`);
  }
  return chain;
}

export default buildEstimateFee;
