import { IEstimateFee } from "../interfaces/IEstimateFee";
import { ethers } from "ethers";
import getLzChainInfo from "./lzChainInfo";
import * as chains from "../chains_mini.json";

const chainMapping: { [key: number]: object } = {}
Object.keys(chains).forEach((key) => {
  const chain = chains[parseInt(key)]
  if (chain) {
    chainMapping[chain.chainId] = chain
  }
})

const buildEstimateFee = (): IEstimateFee => {
  const getProvider = (chainId: number): null | ethers.providers.Provider => {
    const url = getProviderUrl(chainId);
    console.log(`provider url: ${url}`)
    if (!url) {
      return null;
    }
    const provider = new ethers.providers.JsonRpcProvider(url);
    return provider;
  }

  // TODO: cache
  const getLzEndpoint = (provider: ethers.providers.Provider, lzEndpointAddress: string): ethers.Contract => {
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

    if (!lzFromChainId) {
      throw new Error(`chain not found. chainId: ${fromChain}`);
    }
    if (!lzFromEndpointAddress) {
      throw new Error(`chain not found. chainId: ${fromChain}, endpointAddress: ${lzFromEndpointAddress}`)
    }
    if (!lzToChainId) {
      throw new Error(`chain not found.chainId: ${toChain}`);
    }

    console.log(`Layerzero estimate fee fromChain: ${lzFromChainId}, toChain: ${lzToChainId}`);
    console.log(`Layerzero estimate fee fromEndpointAddress: ${lzFromEndpointAddress}`)


    const provider = getProvider(fromChain);
    if (!provider) {
      throw new Error(`chain not found. chainId: ${fromChain}`)
    }
    const lzEndpoint = getLzEndpoint(provider, lzFromEndpointAddress);

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

function getProviderUrl(chainId: number) {
  const chain: { [key: string]: any } = chainMapping[chainId]
  if (!chain) {
    return null
  }

  const rpcList: string[] = chain.rpc
  console.log(rpcList)
  return rpcList.find((rpc) => !rpc.includes("$"))
}

export default buildEstimateFee;
