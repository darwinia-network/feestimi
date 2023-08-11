import { Contract, ethers } from "ethers";
import { Effect, pipe } from "effect";
import { effectGetProvider } from "../chainsUtils";
import { FeestimiError, MessagingLayerError } from "../errors";
import { IEstimateFee } from "../interfaces/IEstimateFee";


const ormpEndpointAddresses: { [key: number]: string } = {
  421613: "0x2CcB8D3c4e13369d509068A8839dcE3fF1CB6E4a",
  43: "0xffF8530727061821d99858Bde3CB6aEd5aae381E"
}

const buildEstimateFee = () => {
  // TODO: cache
  const getOrmpEndpoint = (provider: ethers.providers.Provider, ormpEndpointAddress: string): ethers.Contract => {
    return new ethers.Contract(
      ormpEndpointAddress,
      [
        "function fee(uint256 toChainId, address toUA, bytes calldata encoded, bytes calldata params) external view returns (uint256)",
      ],
      provider
    );
  }

  const estimateFee: IEstimateFee = (
    fromChainId,
    toChainId,
    gasLimit,
    payload,
    _fromDappAddress,
    toDappAddress,
  ) => {
    const ormpFromEndpointAddress = ormpEndpointAddresses[fromChainId];
    if (!ormpFromEndpointAddress) {
      return Effect.fail(new FeestimiError(`ormpFromEndpointAddress for ${fromChainId} not found`))
    }
    if (!toDappAddress) {
      return Effect.fail(new FeestimiError(`toDappAddress for ${toChainId} not found`))
    }
    console.log(`Layerzero estimate fee fromChain: ${fromChainId}, toChain: ${toChainId}`);
    console.log(`Layerzero estimate fee fromEndpointAddress: ${ormpFromEndpointAddress}`)
    console.log(`toDappAddress: ${toDappAddress}`)

    const effectGetOrmpFee = (endpoint: Contract) => {
      return Effect.tryPromise({
        try: () => endpoint.fee(
          toChainId,
          toDappAddress,
          payload,
          params(gasLimit)
        ),
        catch: (error) => new MessagingLayerError('ormp', `${error}`)
      })
    }

    return pipe(
      effectGetProvider(fromChainId),
      Effect.map((provider) => getOrmpEndpoint(provider, ormpFromEndpointAddress)),
      Effect.flatMap((endpoint) => effectGetOrmpFee(endpoint)),
      Effect.map((result) => `${result}`)
    )
  }

  return estimateFee;
}


function params(gasLimit: number) {
  return ethers.utils.solidityPack(
    ["uint256"],
    [gasLimit]
  )
}

export default buildEstimateFee;
