import { ethers } from "ethers";
import { FeestimiError, ensureError } from "../errors";
import { getProvider } from "../utils/evmChainsUtils";
import { IEstimateFee } from "../interfaces/IEstimateFee";
import chainInfo from "./chainInfo";

const buildEstimateFee = () => {
  // TODO: cache
  const getCelerBus = (
    provider: ethers.providers.Provider,
    celerBusAddress: string
  ): ethers.Contract => {
    return new ethers.Contract(
      celerBusAddress,
      [
        "function calcFee(bytes calldata _message) external view returns (uint256)",
      ],
      provider
    );
  };

  const estimateFee: IEstimateFee = async (
    fromChain,
    toChain,
    gasLimit,
    payload,
    fromDappAddress,
    toDappAddress,
    _refundAddress,
    extraParams?: number[][]
  ) => {
    const clFromChainBusAddress = chainInfo[fromChain];
    if (!clFromChainBusAddress) {
      throw new FeestimiError(`chain id not found`, { context: { fromChain } });
    }
    if (chainInfo[toChain] == undefined) {
      throw new FeestimiError(`chain id not found`, { context: { toChain } });
    }

    // https://github.com/darwinia-network/darwinia-msgport/blob/2612c1d485a2521530d4246ab31bcc2d13276ae0/contracts/lines/CelerLine.sol#L51-L55
    const message = ethers.utils.solidityPack(
      ["address", "address", "bytes"],
      [fromDappAddress, toDappAddress, payload]
    );

    const getSgnFee = async (provider: ethers.providers.Provider) => {
      try {
        const celerBus = getCelerBus(provider, clFromChainBusAddress);
        return BigInt(await celerBus.calcFee(message));
      } catch (e: any) {
        const err = ensureError(e);
        throw new FeestimiError(`Getting estimate gas fee from celer failed`, {
          cause: err,
        });
      }
    };

    const getExecutionFee = async (provider: ethers.providers.Provider) => {
      if (!extraParams) {
        throw new FeestimiError("extraParams is undefined");
      }

      if (extraParams.length < 1) {
        throw new FeestimiError("extraParams.length < 1");
      }

      if (extraParams[0].length < 2) {
        throw new FeestimiError("extraParams[0].length < 2", {
          context: { firstExtraParam: extraParams[0] },
        });
      }

      const gasPrice = (await provider.getGasPrice()).toBigInt(); // tgt gas price
      const tgtUnits = gasPrice * BigInt(gasLimit);
      return (tgtUnits * BigInt(extraParams[0][0])) / BigInt(extraParams[0][1]);
    };

    const srcProvider = await getProvider(fromChain);
    const tgtProvider = await getProvider(toChain);
    const sgnFee = await getSgnFee(srcProvider);
    const executionFee = await getExecutionFee(tgtProvider);
    return [(sgnFee + executionFee).toString(), '0x'];
  };

  return estimateFee;
};

export default buildEstimateFee;
