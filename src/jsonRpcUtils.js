import { ethers } from "ethers";

import dotenv from 'dotenv'
dotenv.config()

const jsonRpcHttpUrls = {
  1: process.env.ETHEREUM_MAINNET_RPC,
  11155111: process.env.ETHEREUM_SEPOLIA_RPC,
  421614: process.env.ARBITRUM_SEPOLIA_RPC,
  42161: process.env.ARBITRUM_MAINNET_RPC,
  701: "https://koi-rpc.darwinia.network",
  44: "https://crab-rpc.darwinia.network",
  45: "https://fraa-flashbox-2871-rpc.a.stagenet.tanssi.network",
  46: "https://rpc.darwinia.network",
  2494104990: "https://api.shasta.trongrid.io/jsonrpc",
  728126428: "https://api.trongrid.io/jsonrpc",
  137: process.env.POLYGON_MAINNET_RPC,
  81457: process.env.BLAST_MAINNET_RPC,
  167009: "https://rpc.hekla.taiko.xyz",
  1284: "https://moonbeam-rpc.dwellir.com",
  2818: "https://rpc.morphl2.io"
};

const getProvider = async (chainId) => {
  const url = jsonRpcHttpUrls[chainId];
  if (!url) {
    throw new Error("Invalid chainId");
  }

  return new ethers.providers.JsonRpcProvider(url);
};

const getContract = async (chainId, abi, address) => {
  const provider = await getProvider(chainId);
  return new ethers.Contract(address, abi, provider);
};

const getBlockNumber = async (chainId) => {
  const provider = await getProvider(chainId);
  return await provider.getBlockNumber();
}

const estimateGas = async (chainId, from, to, data) => {
  const provider = await getProvider(chainId);
  return await provider.estimateGas({ from, to, data });
}

export { getProvider, getContract, getBlockNumber, estimateGas };
