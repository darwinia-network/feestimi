import { IEstimateFee } from "../interfaces/IEstimateFee";
import {
  Environment,
  AxelarQueryAPI,
  EvmChain,
  GasToken,
} from "@axelar-network/axelarjs-sdk";
import chainIdMapping from "./chainIdMapping";

const axelarNativeTokens: { [chainName: string]: string } = {};
axelarNativeTokens['ethereum-2'] = GasToken.ETH;
axelarNativeTokens['binance'] = GasToken.BINANCE;
axelarNativeTokens['Fantom'] = GasToken.FTM;
axelarNativeTokens['Moonbeam'] = GasToken.GLMR;

const buildEstimateFee = (environment: Environment): IEstimateFee => {
  const sdk = new AxelarQueryAPI({
    environment: environment,
  });

  const estimateFee: IEstimateFee = async (
    fromChain,
    toChain,
    gasLimit
  ): Promise<{ [key: string]: string }> => {
    const axFromChainId = chainIdMapping(fromChain) as string;
    const axToChainId = chainIdMapping(toChain) as string;
    console.log(`Axelar estimate fee fromChain: ${axFromChainId}, toChain: ${axToChainId}`);

    const axSrcGasToken = axelarNativeTokens[axFromChainId];
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
