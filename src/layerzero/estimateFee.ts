import { IEstimateFee } from "../interfaces/IEstimateFee";
import { ethers } from "ethers";
import getLzChainInfo from "./lzChainInfo";

const buildEstimateFee = (): IEstimateFee => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://bsc-testnet.publicnode.com"
  );

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
    fromChain: number,
    toChain: number,
    gasLimit,

    // Q: Why Layerzero estimateFee needs fromDappAddress and payload?
    // A: They are used to calc the final relayer fee.
    //    getUAConfig(fromDappAddress).relayer.getRelayerFee(payload)
    payload,
    fromDappAddress
  ): Promise<{ [key: string]: string }> => {
    const [, lzFromChainId, lzFromEndpointAddress] = getLzChainInfo(fromChain);
    const [, lzToChainId,] = getLzChainInfo(toChain);
    console.log(`Layerzero estimate fee fromChain: ${lzFromChainId}, toChain: ${lzToChainId}`);
    console.log(`Layerzero estimate fee fromEndpointAddress: ${lzFromEndpointAddress}`)

    const lzEndpoint = getLzEndpoint(lzFromEndpointAddress);

    console.log("-----------------------")
    const fromAddress = fromDappAddress == undefined ? ethers.constants.AddressZero : fromDappAddress
    console.log(`lzToChainId: ${fromAddress}`)

    const result = await lzEndpoint.estimateFees(
      lzToChainId,
      fromAddress,
      payload,
      false,
      adapterParamsV1(gasLimit)
    );
    return { fee: result.nativeFee.toString() };
  }

  return estimateFee;
}

function adapterParamsV1(gasLimit: number) {
  return ethers.utils.solidityPack(
    ["uint16", "uint256"],
    [1, gasLimit]
  )
}

export default buildEstimateFee;
