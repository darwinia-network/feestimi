import { FeestimiError } from "../errors";
import { ApiPromise, WsProvider } from "@polkadot/api";

const jsonRpcWsUrls: { [key: number]: string } = {
  44: "wss://crab-rpc.darwinia.network",
  46: "wss://rpc.darwinia.network",
};

const getSubstrateProvider = async (chainId: number): Promise<WsProvider> => {
  const url = jsonRpcWsUrls[chainId];
  if (!url) {
    throw new FeestimiError("websocket json rpc url not found");
  }

  return new WsProvider(url as string);
};

const getSubstrateApi = async (chainId: number): Promise<ApiPromise> => {
  const substrateProvider = await getSubstrateProvider(chainId);
  return await ApiPromise.create({ provider: substrateProvider });
};

export {
  getSubstrateProvider,
  getSubstrateApi,
};
