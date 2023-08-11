import { IEstimateFee } from "../interfaces/IEstimateFee";
import { effectGetProvider, effectGetSubstrateApi } from "../chainsUtils";
import { Contract, ethers } from "ethers";
import { ApiPromise } from '@polkadot/api';
import { Effect, pipe } from "effect";
import { MessagingLayerError } from "../errors";

const buildEstimateFee = () => {
  const estimateFee: IEstimateFee = (
    fromChainId,
    toChainId,
    gasLimitOfDockRecv, // gasLimit1 + gasLimit2
    wrappedMessage,
    fromDockAddress,
    toDockAddress,
    extraParams?: number[][]
  ) => {
    async function calldataOfDockRecv(provider: ethers.providers.Provider) {
      const tgtDockContract = new Contract(
        toDockAddress as string,
        ["function recv(uint64 _fromChainId, address _fromDappAddress, address _toDappAddress, bytes memory _message)"],
        provider
      );

      return tgtDockContract.interface.encodeFunctionData('recv', [
        fromChainId,
        fromDockAddress,
        toDockAddress,
        wrappedMessage
      ]);
    }

    async function xcmTransaction(provider: ethers.providers.Provider) {
      return {
        V2: {
          gasLimit: gasLimitOfDockRecv,
          action: { Call: toDockAddress },
          value: 0,
          input: await calldataOfDockRecv(provider),
        },
      };
    }

    async function createExtrinsic(provider: ethers.providers.Provider, api: ApiPromise) {
      const tx =
        api.tx.ethereumXcm.transact(
          await xcmTransaction(provider)
        );

      return {
        encodedExtrensic: tx.method.toHex(),
        paymentInfo: await tx.paymentInfo(fromDockAddress as string),
      }
    }

    const effectCreateExtrinsic = (provider: ethers.providers.Provider, api: ApiPromise) => {
      return Effect.tryPromise({
        try: () => createExtrinsic(provider, api),
        catch: (error) => new MessagingLayerError('xcmp', `${error}`)
      })
    }

    const calcSourceUnits = (paymentInfo: any) => {
      if (!extraParams) {
        throw new Error("extraParams is undefined")
      }

      if (extraParams.length < 1) {
        throw new Error("extraParams.length < 1")
      }

      if (extraParams[0].length < 2) {
        throw new Error("extraParams[0].length < 2")
      }

      const partialFee = paymentInfo.toJSON().partialFee
      if (!partialFee) {
        throw new Error("partialFee is null")
      }

      const tgtUnits = BigInt(partialFee.toString());
      return tgtUnits * BigInt(extraParams[0][0]) / BigInt(extraParams[0][1])
    }

    return pipe(
      Effect.Do,
      Effect.bind('provider', () => effectGetProvider(toChainId)),
      Effect.bind('api', () => effectGetSubstrateApi(toChainId)),
      Effect.flatMap(({ provider, api }) => effectCreateExtrinsic(provider, api)),
      Effect.map(({ paymentInfo }) => {
        return calcSourceUnits(paymentInfo).toString()
      })
    )

  }
  return estimateFee;
}

export default buildEstimateFee;
