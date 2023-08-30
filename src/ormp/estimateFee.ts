import { ethers } from "ethers";
import { getContract } from "../chainsUtils";
import { FeestimiError } from "../errors";
import { IEstimateFee } from "../interfaces/IEstimateFee";

const ormpEndpointAddresses: { [key: number]: string } = {
  421613: "0x2CcB8D3c4e13369d509068A8839dcE3fF1CB6E4a",
  43: "0xffF8530727061821d99858Bde3CB6aEd5aae381E",
};
const OrmpEndpointAbi = [
  "function fee(uint256 toChainId, address toUA, bytes calldata encoded, bytes calldata params) external view returns (uint256)",
];

const buildEstimateFee = () => {
  const estimateFee: IEstimateFee = async (
    fromChainId,
    toChainId,
    gasLimit,
    payload,
    _fromDappAddress,
    toDappAddress
  ) => {
    const ormpFromEndpointAddress = ormpEndpointAddresses[fromChainId];
    if (!ormpFromEndpointAddress) {
      throw new FeestimiError(`ormpFromEndpointAddress not found`, {
        context: { fromChainId },
      });
    }
    if (!toDappAddress) {
      throw new FeestimiError(`toDappAddress not found`, {
        context: { toChainId },
      });
    }
    console.log(
      `Layerzero estimate fee fromChain: ${fromChainId}, toChain: ${toChainId}`
    );
    console.log(
      `Layerzero estimate fee fromEndpointAddress: ${ormpFromEndpointAddress}`
    );
    console.log(`toDappAddress: ${toDappAddress}`);

    const endpoint = await getContract(
      fromChainId,
      OrmpEndpointAbi,
      ormpFromEndpointAddress
    );
    const ormpFee = await endpoint.fee(
      toChainId,
      toDappAddress,
      payload,
      params(gasLimit)
    );
    return ormpFee.toString();
  };

  return estimateFee;
};

function params(gasLimit: number) {
  return ethers.utils.solidityPack(["uint256"], [gasLimit]);
}

export default buildEstimateFee;
