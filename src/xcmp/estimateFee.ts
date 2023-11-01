import { IEstimateFee } from "../interfaces/IEstimateFee";
import { getProvider, getSubstrateApi } from "../chainsUtils";
import { Contract, ethers } from "ethers";
import { ApiPromise } from "@polkadot/api";
import { FeestimiError } from "../errors";

const buildEstimateFee = () => {
  const estimateFee: IEstimateFee = async (
    fromChainId,
    toChainId,
    gasLimitOfDockRecv, // gasLimit1 + gasLimit2
    wrappedMessage,
    fromDockAddress,
    toDockAddress,
    _refundAddress,
    extraParams?: [number, number][]
  ) => {
    async function calldataOfDockRecv(provider: ethers.providers.Provider) {
      const tgtDockContract = new Contract(
        toDockAddress as string,
        [
          "function recv(uint64 _fromChainId, address _fromDappAddress, address _toDappAddress, bytes memory _message)",
        ],
        provider
      );

      return tgtDockContract.interface.encodeFunctionData("recv", [
        fromChainId,
        fromDockAddress,
        toDockAddress,
        wrappedMessage,
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

    async function createExtrinsic(
      provider: ethers.providers.Provider,
      api: ApiPromise
    ) {
      const tx = api.tx.ethereumXcm.transact(await xcmTransaction(provider));

      return {
        encodedExtrensic: tx.method.toHex(),
        paymentInfo: await tx.paymentInfo(fromDockAddress as string),
      };
    }

    const calcSourceUnits = (paymentInfo: any) => {
      if (!extraParams) {
        throw new FeestimiError("extraParams is undefined");
      }

      if (extraParams.length < 1) {
        throw new FeestimiError("extraParams.length < 1");
      }

      if (extraParams[0].length < 2) {
        throw new FeestimiError("extraParams[0].length < 2", {
          context: { firstExtraParam: extraParams[0] },
        });
      }

      const partialFee = paymentInfo.toJSON().partialFee;
      if (!partialFee) {
        throw new FeestimiError("partialFee is null", {
          context: { paymentInfo },
        });
      }

      const tgtUnits = BigInt(partialFee.toString());
      return (tgtUnits * BigInt(extraParams[0][0])) / BigInt(extraParams[0][1]);
    };

    const provider = await getProvider(toChainId);
    const api = await getSubstrateApi(toChainId);
    const extrinsic = await createExtrinsic(provider, api);
    const sourceUnits = calcSourceUnits(extrinsic.paymentInfo);
    return [sourceUnits.toString(), '0x'];
  };

  return estimateFee;
};

export default buildEstimateFee;
