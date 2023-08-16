import { Contract, ethers } from "ethers";
import { Effect as E, pipe } from "effect";
import { effectGetContract } from "../chainsUtils";
import { OrmpError } from "../errors";
import { IEstimateFee } from "../interfaces/IEstimateFee";


const ormpEndpointAddresses: { [key: number]: string } = {
  421613: "0x2CcB8D3c4e13369d509068A8839dcE3fF1CB6E4a",
  43: "0xffF8530727061821d99858Bde3CB6aEd5aae381E"
}
const OrmpEndpointAbi = [
  "function fee(uint256 toChainId, address toUA, bytes calldata encoded, bytes calldata params) external view returns (uint256)",
]

const buildEstimateFee = () => {

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
      return E.fail(new OrmpError(`ormpFromEndpointAddress for ${fromChainId} not found`))
    }
    if (!toDappAddress) {
      return E.fail(new OrmpError(`toDappAddress for ${toChainId} not found`))
    }
    console.log(`Layerzero estimate fee fromChain: ${fromChainId}, toChain: ${toChainId}`);
    console.log(`Layerzero estimate fee fromEndpointAddress: ${ormpFromEndpointAddress}`)
    console.log(`toDappAddress: ${toDappAddress}`)

    const effectGetOrmpFee = (endpoint: Contract) => {
      return E.tryPromise({
        try: () => endpoint.fee(
          toChainId,
          toDappAddress,
          payload,
          params(gasLimit)
        ),
        catch: (error) => new OrmpError(`${error}`)
      })
    }

    return pipe(
      effectGetContract(fromChainId, OrmpEndpointAbi, ormpFromEndpointAddress),
      E.flatMap((endpoint) => effectGetOrmpFee(endpoint)),
      E.map((result) => `${result}`)
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
