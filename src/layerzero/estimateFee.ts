import { Contract, ethers } from "ethers";
import { effectGetLzChainInfo } from "./lzChainInfo";
import { LayerZeroError } from "../errors";
import { Effect as E } from "effect";
import { effectGetContract } from "../chainsUtils";
import { IEstimateFee } from "../interfaces/IEstimateFee";

const LzEndpointAbi = [
  "function estimateFees(uint16 _dstChainId, address _userApplication, bytes calldata _payload, bool _payInZRO, bytes calldata _adapterParams) external view returns (uint nativeFee, uint zroFee)",
]
const buildEstimateFee = () => {

  const estimateFee: IEstimateFee = (
    fromChain,
    toChain,
    gasLimit,
    payload,
    fromDappAddress
  ) => {
    const fromAddress = fromDappAddress == undefined ? ethers.constants.AddressZero : fromDappAddress
    console.log(`lzToChainId: ${fromAddress}`)

    const effectLzEstimateFee = (lzEndpoint: Contract, lzToChainId: number) => {
      return E.tryPromise({
        try: () => lzEndpoint.estimateFees(
          lzToChainId,
          fromAddress,
          payload,
          false,
          adapterParamsV1(gasLimit)
        ),
        catch: (error) => new LayerZeroError(`${error}`)
      })
    }

    return E.Do.pipe(
      E.bind("fromChainInfo", () => effectGetLzChainInfo(fromChain)),
      E.bind("toChainInfo", () => effectGetLzChainInfo(toChain)),
      E.bind("lzEndpoint", ({ fromChainInfo }) => effectGetContract(fromChain, LzEndpointAbi, fromChainInfo.lzEndpointAddress)),
      E.flatMap(({ lzEndpoint, toChainInfo }) => effectLzEstimateFee(lzEndpoint, toChainInfo.lzChainId)),
      E.map((result: any) => result.nativeFee.toString())
    )
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
