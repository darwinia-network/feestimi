import { IEstimateFee } from "../interfaces/IEstimateFee";
import {
  Environment,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import chainInfo from "./chainInfo";

const buildEstimateFee = (environment: Environment): IEstimateFee => {
  const sdk = new AxelarQueryAPI({
    environment: environment,
  });

  const estimateFee: IEstimateFee = async (
    fromChain,
    toChain,
    gasLimit
  ): Promise<{ [key: string]: string }> => {
    const fromChainInfo = chainInfo[fromChain];
    const toChainInfo = chainInfo[toChain];
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

export default buildEstimateFee;
