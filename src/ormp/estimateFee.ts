import { ethers } from "ethers";
import { getContract } from "../chainsUtils";
import { FeestimiError } from "../errors";
import { IEstimateFee } from "../interfaces/IEstimateFee";

const ormpEndpointAddresses: { [key: number]: string } = {
  421614: "0x0034607daf9c1dc6628f6e09E81bB232B6603A89",
  44: "0x0034607daf9c1dc6628f6e09E81bB232B6603A89",
};
const OrmpEndpointAbi = [
  "function fee(uint256 toChainId, address toUA, bytes calldata encoded, bytes calldata params) external view returns (uint256)"
];

const buildEstimateFee = () => {
  const estimateFee: IEstimateFee = async (
    fromChainId,
    toChainId,
    gasLimit,
    payload,
    fromDappAddress,
    toDappAddress,
    refundAddress
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

    const paramsStr = params(gasLimit, refundAddress)
    const ormpFee = await endpoint.fee(
      toChainId,
      toDappAddress,
      fullPayload(fromDappAddress, toDappAddress, payload),
      paramsStr
    );
    return [ormpFee.toString(), paramsStr]
  };

  return estimateFee;
};

function fullPayload(fromDappAddress: string, toDappAddress: string, payload: string) {
  // https://github.com/darwinia-network/darwinia-msgport/blob/12278bdbe58c2c464ce550a2cf23c8dc9949f741/contracts/lines/ORMPLine.sol#L33
  // bytes memory encoded = abi.encodeWithSelector(ORMPLine.recv.selector, fromDapp, toDapp, message);
  return "0x394d1bca" + ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "bytes"],
    [fromDappAddress, toDappAddress, payload]
  ).slice(2);
}

function params(gasLimit: number, refundAddress: string) {
  return ethers.utils.solidityPack(["uint256", "address"], [gasLimit, refundAddress])
}

export default buildEstimateFee;
