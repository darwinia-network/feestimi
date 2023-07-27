import { IEstimateFee, Payload } from "../interfaces/IEstimateFee";
import { ethers } from "ethers";
import getLzChainInfo from "./lzChainInfo";

const buildEstimateFee = (provider: ethers.providers.Provider): IEstimateFee => {
  // TODO: cache
  const getLzEndpoint = (lzEndpointAddress: string): ethers.Contract => {
    return new ethers.Contract(
      lzEndpointAddress,
      [
        "function estimateFees(uint16 _dstChainId, address _userApplication, bytes calldata _payload, bool _payInZRO, bytes calldata _adapterParams) external view returns (uint nativeFee, uint zroFee)",
      ],
      provider
    );
  }

  const estimateFee: IEstimateFee = async (
    fromChain,
    toChain,
    payload: Payload,
    fromDappAddress
  ): Promise<string> => {
    const [, lzFromChainId, lzFromEndpoint] = getLzChainInfo(fromChain);
    const [, lzToChainId,] = getLzChainInfo(toChain);

    console.log(`Layerzero estimate fee fromChain: ${lzFromChainId}, toChain: ${lzToChainId}`);

    const lzEndpoint = getLzEndpoint(lzFromEndpoint);

    let adpaterParams = ethers.utils.solidityPack(
      ["uint16", "uint256"],
      [1, payload.gasLimit]
    );

    const result = await lzEndpoint.estimateFees(
      lzToChainId,
      fromDappAddress,
      payload.content,
      false,
      adpaterParams
    );

    return result.nativeFee.toString();
  }

  return estimateFee;
}

export default buildEstimateFee;
