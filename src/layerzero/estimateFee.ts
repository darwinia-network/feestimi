import { Contract, ethers } from "ethers";
import { getLzChainInfo } from "./lzChainInfo";
import { getContract } from "../chainsUtils";
import { IEstimateFee } from "../interfaces/IEstimateFee";
import { FeestimiError, ensureError } from "../errors";

const LzEndpointAbi = [
  "function estimateFees(uint16 _dstChainId, address _userApplication, bytes calldata _payload, bool _payInZRO, bytes calldata _adapterParams) external view returns (uint nativeFee, uint zroFee)",
];
const buildEstimateFee = () => {
  const estimateFee: IEstimateFee = async (
    fromChain,
    toChain,
    gasLimit,
    payload,
    fromDappAddress
  ) => {
    const fromAddress =
      fromDappAddress == undefined
        ? ethers.constants.AddressZero
        : fromDappAddress;
    console.log(`fromAddress: ${fromAddress}`);

    const fromChainInfo = getLzChainInfo(fromChain);
    const toChainInfo = getLzChainInfo(toChain);
    const lzEndpoint: ethers.Contract = await getContract(
      fromChain,
      LzEndpointAbi,
      fromChainInfo.lzEndpointAddress
    );

    try {
      const result = await lzEndpoint.estimateFees(
        toChainInfo.lzChainId,
        fromAddress,
        payload,
        false,
        adapterParamsV1(gasLimit)
      );
      return result.nativeFee.toString();
    } catch (e: any) {
      const err = ensureError(e);
      throw new FeestimiError(
        `Getting estimate gas fee from layerzero failed`,
        {
          cause: err,
        }
      );
    }
  };

  return estimateFee;
};

function adapterParamsV1(gasLimit: number) {
  return ethers.utils.solidityPack(["uint16", "uint256"], [1, gasLimit]);
}

export default buildEstimateFee;
