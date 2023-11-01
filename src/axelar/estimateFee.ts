import { IEstimateFee } from "../interfaces/IEstimateFee";
import { Environment, AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";
import chainInfo from "./chainInfo";
import chainInfoTestnet from "./chainInfoTestnet";
import { FeestimiError, ensureError } from "../errors";

// [Environment, chainId, gasToken]
type ChainInfo = [Environment, string, string];

const buildEstimateFee = (): IEstimateFee => {
  const axelarEstimateGasFee = async (
    fromChainInfo: ChainInfo,
    toChainInfo: ChainInfo,
    gasLimit: number
  ) => {
    const sdk = new AxelarQueryAPI({
      environment: fromChainInfo[0],
    });
    try {
      return await sdk.estimateGasFee(
        fromChainInfo[1],
        toChainInfo[1],
        fromChainInfo[2],
        gasLimit
      );
    } catch (e: any) {
      const err = ensureError(e);
      throw new FeestimiError(`Getting estimate gas fee from axelar failed`, {
        cause: err,
      });
    }
  };

  const estimateFee: IEstimateFee = async (
    fromChain,
    toChain,
    gasLimit,
    _payload,
    _fromDappAddress,
    _toDappAddress,
    _fundAddress

  ) => {
    const fromChainInfo = getChainInfo(fromChain);
    const toChainInfo = getChainInfo(toChain);
    checkSameEnvironment(fromChainInfo, toChainInfo);
    const result = await axelarEstimateGasFee(
      fromChainInfo,
      toChainInfo,
      gasLimit
    );

    return [result as string, '0x'];
  };

  return estimateFee;
};

function checkSameEnvironment(
  fromChainInfo: [Environment, string, string],
  toChainInfo: [Environment, string, string]
) {
  if (fromChainInfo[0] != toChainInfo[0]) {
    throw new FeestimiError(
      `fromChain and toChain are not in the same environment`,
      { context: { fromChainId: fromChainInfo[1], toChainId: toChainInfo[1] } }
    );
  }

  return { fromChainInfo, toChainInfo };
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

  throw new FeestimiError(`axelar: chain id not found`, {
    context: { chainId },
  });
}

export default buildEstimateFee;
