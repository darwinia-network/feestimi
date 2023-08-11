import { ethers } from "ethers";
import { MessagingLayerError } from "../errors";
import { Effect, pipe } from "effect";
import { effectGetProvider } from "../chainsUtils";
import { IEstimateFee } from "../interfaces/IEstimateFee";
import chainInfo from "./chainInfo";

const buildEstimateFee = () => {
  // TODO: cache
  const getCelerBus = (provider: ethers.providers.Provider, celerBusAddress: string): ethers.Contract => {
    return new ethers.Contract(
      celerBusAddress,
      [
        "function calcFee(bytes calldata _message) external view returns (uint256)"
      ],
      provider
    );
  }

  const estimateFee: IEstimateFee = (
    fromChain,
    toChain,
    gasLimit,
    payload,
    fromDappAddress,
    toDappAddress,
    extraParams?: number[][]
  ) => {

    const clFromChainBusAddress = chainInfo[fromChain]
    if (!clFromChainBusAddress) {
      return Effect.fail(new MessagingLayerError('celer', `chain id not found: ${fromChain}`))
    }
    if (chainInfo[toChain] == undefined) {
      return Effect.fail(new MessagingLayerError('celer', `chain id not found: ${toChain}`))
    }

    // https://github.com/darwinia-network/darwinia-msgport/blob/2612c1d485a2521530d4246ab31bcc2d13276ae0/contracts/lines/CelerLine.sol#L51-L55
    const message = ethers.utils.solidityPack(
      ["address", "address", "bytes"],
      [fromDappAddress, toDappAddress, payload]
    )

    const sgnFee = async (provider: ethers.providers.Provider) => {
      const celerBus = getCelerBus(provider, clFromChainBusAddress)
      return BigInt(await celerBus.calcFee(message))
    }

    const effectSgnFee = (provider: ethers.providers.Provider) => {
      return Effect.tryPromise({
        try: () => sgnFee(provider),
        catch: (error) => new MessagingLayerError('celer', `${error}`)
      })
    }

    const executionFee = async (provider: ethers.providers.Provider) => {
      if (!extraParams) {
        throw new Error("extraParams is undefined")
      }

      if (extraParams.length < 1) {
        throw new Error("extraParams.length < 1")
      }

      if (extraParams[0].length < 2) {
        throw new Error("extraParams[0].length < 2")
      }

      const gasPrice = (await provider.getGasPrice()).toBigInt()
      const tgtUnits = gasPrice * BigInt(gasLimit)
      return tgtUnits * BigInt(extraParams[0][0]) / BigInt(extraParams[0][1])
    }

    const effectExecutionFee = (provider: ethers.providers.Provider) => {
      return Effect.tryPromise({
        try: () => executionFee(provider),
        catch: (error) => new MessagingLayerError('celer', `${error}`)
      })
    }

    return pipe(
      Effect.Do,
      Effect.bind('provider', () => effectGetProvider(fromChain)),
      Effect.bind('sgnFee', ({ provider }) => effectSgnFee(provider)),
      Effect.bind('executionFee', ({ provider }) => effectExecutionFee(provider)),
      Effect.map(({ sgnFee, executionFee }) => (executionFee + sgnFee).toString())
    )
  }

  return estimateFee;
}

export default buildEstimateFee;
