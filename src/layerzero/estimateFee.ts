import { Contract, ethers } from "ethers";
import getLzChainInfo from "./lzChainInfo";
import { ChainInfoMissingError, ChainNotFoundError, UnknownError, ChainNotFoundInMiniError, FeeBaseError, LayerzeroError } from "../errors";
import { Effect, pipe } from "effect";
import chainMapping from "../chainsMini";
import { IEstimateFee } from "../interfaces/IEstimateFee";

const buildEstimateFee = () => {
  const getProvider = (chainId: number): Effect.Effect<never, ChainNotFoundInMiniError, ethers.providers.Provider> => {
    const url = getProviderUrl(chainId);

    if (!url) {
      return Effect.fail(new ChainNotFoundInMiniError(chainId))
    }
    const provider = new ethers.providers.JsonRpcProvider(url);
    return Effect.succeed(provider);
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

  const estimateFee: IEstimateFee = (
    fromChain,
    toChain,
    gasLimit,

    // Q: Why Layerzero estimateFee needs fromDappAddress and payload?
    // A: They are used to calc the final relayer fee.
    //    getUAConfig(fromDappAddress).relayer.getRelayerFee(payload)
    payload,
    fromDappAddress
  ) => {

    try {
      const [, lzFromChainId, lzFromEndpointAddress] = getLzChainInfo(fromChain);
      if (!lzFromChainId) {
        return Effect.fail(new ChainNotFoundError(fromChain, "layerzero", "from"))
      }
      if (!lzFromEndpointAddress) {
        return Effect.fail(new ChainInfoMissingError(fromChain, 'lzFromEndpointAddress'))
      }

      const [, lzToChainId,] = getLzChainInfo(toChain);
      if (!lzToChainId) {
        return Effect.fail(new ChainNotFoundError(toChain, "layerzero", "to"))
      }

      console.log(`Layerzero estimate fee fromChain: ${lzFromChainId}, toChain: ${lzToChainId}`);
      console.log(`Layerzero estimate fee fromEndpointAddress: ${lzFromEndpointAddress}`)

      const fromAddress = fromDappAddress == undefined ? ethers.constants.AddressZero : fromDappAddress
      console.log(`lzToChainId: ${fromAddress}`)

      const lzEstimateFee = (lzEndpoint: Contract) => {
        return Effect.tryPromise({
          try: () => lzEndpoint.estimateFees(
            lzToChainId,
            fromAddress,
            payload,
            false,
            adapterParamsV1(gasLimit)
          ),
          catch: (error) => new LayerzeroError(`${error}`)
        })
      }

      return pipe(
        getProvider(fromChain),
        Effect.map((provider) => getLzEndpoint(provider, lzFromEndpointAddress)),
        Effect.flatMap((lzEndpoint) => lzEstimateFee(lzEndpoint)),
        Effect.map((result: any) => result.nativeFee.toString())
      )
    } catch (error: any) {
      if (error.code) {
        return Effect.fail(error)
      } else {
        return Effect.fail(new UnknownError(999, `${error}`))
      }
    }
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
  return rpcList.find((rpc) => !rpc.includes("$"))
}

export default buildEstimateFee;
