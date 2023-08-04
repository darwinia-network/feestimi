import { Contract, ethers } from "ethers";
import { MessagingLayerError } from "../errors";
import { Effect, pipe } from "effect";
import { getProvider } from "../chainsMini";
import { IEstimateFee } from "../interfaces/IEstimateFee";
import chainInfo from "./chainInfo";
import { effectGasPrice } from "../estimateExecutionFee";

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
    toDappAddress
  ) => {

    const clFromChainBusAddress = chainInfo[fromChain]

    // https://github.com/darwinia-network/darwinia-msgport/blob/2612c1d485a2521530d4246ab31bcc2d13276ae0/contracts/lines/CelerLine.sol#L51-L55
    const message = ethers.utils.solidityPack(
      ["address", "address", "bytes"],
      [fromDappAddress, toDappAddress, payload]
    )

    const clCalcFee = (clBus: Contract) => {
      return Effect.tryPromise({
        try: () => clBus.calcFee(message),
        catch: (error) => new MessagingLayerError('celer', `${error}`)
      })
    }

    try {
      return pipe(
        Effect.Do,
        Effect.bind('provider', () => getProvider(fromChain)),
        Effect.bind('sgnFee', ({ provider }) =>
          pipe(
            Effect.succeed(provider),
            Effect.map((provider) => getCelerBus(provider, clFromChainBusAddress)),
            Effect.flatMap((clBus) => clCalcFee(clBus)),
            Effect.map((fee) => `${fee}`)
          )
        ),
        Effect.bind('executionFee', ({ provider }) =>
          pipe(
            Effect.succeed(provider),
            Effect.flatMap((provider) => effectGasPrice(toChain, provider)),
            Effect.map((gasPrice) => gasPrice.mul(gasLimit))
          )
        ),
        Effect.map(({ sgnFee, executionFee }) => executionFee.add(sgnFee).toString())
      )
    } catch (error: any) {
      return Effect.fail(new MessagingLayerError('celer', `${error}`))
    }
  }

  return estimateFee;
}

export default buildEstimateFee;
