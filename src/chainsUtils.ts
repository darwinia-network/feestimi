/**
 * @desc This file provide some helper functions to get evm rpc url and chain info.
 * @notice This file is based on `chains_mini.json`, keep it updated.
 * @see https://chainid.network/chains_mini.json
 */

import "dotenv/config";
import { eth_chainId, eth_estimateGas } from "./jsonRpcUtils";
import { ethers } from "ethers";
import { FeestimiError } from "./errors";
import chains from "./chains_mini.json";
import { jsonRpcUrls } from "./jsonRpcUrls";

const chainMapping: { [key: number]: object } = {};

Object.keys(chains).forEach((key) => {
  const chain = chains[parseInt(key)];
  if (chain) {
    chainMapping[chain.chainId] = chain;
  }
});

const INFURA_API_KEY: string = process.env.INFURA_API_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const ANKR_API_KEY = process.env.ANKR_API_KEY || "";

async function getRpcUrl(chainId: number): Promise<string | null> {
  console.log("chainId - " + chainId)
  var url = jsonRpcUrls[chainId];
  if (url) {
    console.log("url from config - " + url)
    return url;
  }

  const chain: { [key: string]: any } = chainMapping[chainId];
  if (!chain) {
    return null;
  }

  const rpcList: string[] = chain.rpc;

  let finalRpcUrl: string | null = null;
  for (let index = 0; index < rpcList.length; index++) {
    const rpc = rpcList[index];

    if (rpc.startsWith("http")) {
      if (rpc.includes("${INFURA_API_KEY}")) {
        finalRpcUrl = rpc.replace("${INFURA_API_KEY}", INFURA_API_KEY);
      } else if (rpc.includes("${ALCHEMY_API_KEY}")) {
        finalRpcUrl = rpc.replace("${ALCHEMY_API_KEY}", ALCHEMY_API_KEY);
      } else if (rpc.includes("${ANKR_API_KEY}")) {
        finalRpcUrl = rpc.replace("${ALCHEMY_API_KEY}", ANKR_API_KEY);
      } else {
        finalRpcUrl = rpc;
      }
    }

    if (await isAliveAndCorrect(finalRpcUrl as string, chainId)) {
      break;
    }
  }

  console.log("url from chains_mini - " + finalRpcUrl)
  return finalRpcUrl;
}

async function estimateGas(chainId: number, from: string, to: string, data: string) {
  const url = await getRpcUrl(chainId);
  return await eth_estimateGas(url, {
    from: from,
    to: to,
    data: data,
  })
}

async function getWsRpcUrl(chainId: number): Promise<string | null> {
  const chain: { [key: string]: any } = chainMapping[chainId];
  if (!chain) {
    return null;
  }

  const rpcList: string[] = chain.rpc;

  let finalRpcUrl: string | null = null;
  for (let index = 0; index < rpcList.length; index++) {
    const rpc = rpcList[index];

    if (rpc.startsWith("ws")) {
      if (rpc.includes("${INFURA_API_KEY}")) {
        finalRpcUrl = rpc.replace("${INFURA_API_KEY}", INFURA_API_KEY);
      } else if (rpc.includes("${ALCHEMY_API_KEY}")) {
        finalRpcUrl = rpc.replace("${ALCHEMY_API_KEY}", ALCHEMY_API_KEY);
      } else if (rpc.includes("${ANKR_API_KEY}")) {
        finalRpcUrl = rpc.replace("${ALCHEMY_API_KEY}", ANKR_API_KEY);
      } else {
        finalRpcUrl = rpc;
      }
    }

    // TODO: check if ws is alive
    // if (await isAliveAndCorrect(finalRpcUrl as string, chainId)) {
    //   break
    // }
  }

  return finalRpcUrl;
}

// check if rpc is alive by using etherjs
async function isAliveAndCorrect(rpcUrl: string, chainId: number) {
  try {
    const chainIdFromRpc = await eth_chainId(rpcUrl);
    if (chainIdFromRpc === chainId) {
      return true;
    }
    return false;
  } catch (error: any) {
    return false;
  }
}

const getProvider = async (
  chainId: number
): Promise<ethers.providers.Provider> => {
  const url = await getRpcUrl(chainId);

  if (!url) {
    throw new FeestimiError("json rpc url not found");
  }

  return new ethers.providers.JsonRpcProvider(url as string);
};

import { ApiPromise, WsProvider } from "@polkadot/api";

const getSubstrateProvider = async (chainId: number): Promise<WsProvider> => {
  const url = await getWsRpcUrl(chainId);

  if (!url) {
    throw new FeestimiError("websocket json rpc url not found");
  }

  return new WsProvider(url as string);
};

const getSubstrateApi = async (chainId: number): Promise<ApiPromise> => {
  const substrateProvider = await getSubstrateProvider(chainId);
  return await ApiPromise.create({ provider: substrateProvider });
};

const getContract = async (
  chainId: number,
  abi: string[],
  address: string
): Promise<ethers.Contract> => {
  const provider = await getProvider(chainId);
  return new ethers.Contract(address, abi, provider);
};

export {
  // chainId > chainInfo
  chainMapping,
  getProvider,
  getContract,
  getSubstrateApi,
  estimateGas,
};
