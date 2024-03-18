import { eth_chainId, eth_estimateGas, eth_call } from "./evmJsonRpcClient";
import { ethers } from "ethers";
import { FeestimiError } from "../errors";

const jsonRpcHttpUrls: { [key: number]: string } = {
  1: "https://ethereum.publicnode.com",
  11155111: "https://ethereum-sepolia.publicnode.com",
  421614: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
  42161: "https://arbitrum-one.publicnode.com",
  43: "https://pangolin-rpc.darwinia.network",
  44: "https://crab-rpc.darwinia.network",
  46: "https://rpc.darwinia.network",
  2494104990: "https://api.shasta.trongrid.io/jsonrpc",
  728126428: "https://api.trongrid.io/jsonrpc",
  137: "https://polygon-bor-rpc.publicnode.com",
  81457: "https://rpc.blast.io"
};

async function estimateGas(chainId: number, from: string, to: string, data: string) {
  const url = jsonRpcHttpUrls[chainId];
  if (!url) {
    throw new FeestimiError("json rpc url not found");
  }

  return await eth_estimateGas(url, {
    from: from,
    to: to,
    data: data,
  })
}

async function call(chainId: number, contract: string, data: string) {
  console.log("chainId - " + chainId)
  const url = jsonRpcHttpUrls[chainId];
  if (!url) {
    throw new FeestimiError("json rpc url not found");
  }

  if ((chainId == 728126428 || chainId == 2494104990) && contract.startsWith("T")) { // tron address
    contract = "0x" + ethers.utils.hexlify(
      ethers.utils.base58.decode(contract)
    ).slice(4, 44)
  }

  return await eth_call(url, {
    to: contract,
    data: data
  })
}

async function callFunction(chainId: number, contract: string, abi: string[], functionName: string, params: any[]) {
  const intf = new ethers.utils.Interface(abi);
  const data = intf.encodeFunctionData(
    functionName,
    params
  );
  return await call(chainId, contract, data);
}

const getProvider = async (
  chainId: number
): Promise<ethers.providers.Provider> => {
  console.log("chainId - " + chainId)
  const url = jsonRpcHttpUrls[chainId];
  if (!url) {
    throw new FeestimiError("json rpc url not found");
  }

  return new ethers.providers.JsonRpcProvider(url as string);
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
  getProvider,
  getContract,
  estimateGas,
  callFunction,
};

async function main() {
  // way 1
  const address = "0x" + ethers.utils.hexlify(
      ethers.utils.base58.decode("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")
    ).slice(4, 44)
  console.log(address);
  const abi = ["function totalSupply() external view returns (uint256)"];
  const provider = new ethers.providers.JsonRpcProvider("https://api.trongrid.io/jsonrpc");
  const usdt = new ethers.Contract(address, abi, provider);
  const totalSupply = await usdt.totalSupply();

  // // way 2
  // const totalSupply = await call(728126428, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "0x18160ddd")

  // // way 3
  // const totalSupply = await callFunction(728126428, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", ["function totalSupply() external view returns (uint256)"], "totalSupply", [])

  console.log("usdt total supply on tron: " + totalSupply);
}
// main()
