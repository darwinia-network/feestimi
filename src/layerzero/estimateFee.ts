import { Contract, ethers } from "ethers";
import { effectGetLzChainInfo } from "./lzChainInfo";
import { FeestimiError, MessagingLayerError } from "../errors";
import { Effect as E, pipe } from "effect";
import { effectGetProvider } from "../chainsUtils";
import { IEstimateFee } from "../interfaces/IEstimateFee";

const buildEstimateFee = () => {
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

  const effectGetLzEndpoint = (provider: ethers.providers.Provider, lzEndpointAddress: string) => {
    return E.try({
      try: () => getLzEndpoint(provider, lzEndpointAddress),
      catch: (error) => new FeestimiError(`${error}`)
    })
  }

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
        catch: (error) => new MessagingLayerError('layerzero', `${error}`)
      })
    }

    return pipe(
      E.Do,
      E.bind("provider", () => effectGetProvider(fromChain)),
      E.bind("fromChainInfo", () => effectGetLzChainInfo(fromChain)),
      E.bind("toChainInfo", () => effectGetLzChainInfo(toChain)),
      E.bind("lzEndpoint", ({ provider, fromChainInfo }) => effectGetLzEndpoint(provider, fromChainInfo.lzEndpointAddress)),
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
