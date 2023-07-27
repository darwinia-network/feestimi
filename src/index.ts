// https://khalilstemmler.com/blogs/typescript/node-starter-project/

import { ethers } from "ethers";
import layerzeroBuildEstimateFee from "./layerzero/estimateFee";
import axelarBuildEstimateFee from "./axelar/estimateFee";
import {
  Environment,
} from "@axelar-network/axelarjs-sdk";
import chainIds from "./chainIds";

async function main() {
  let estimateFee;
  let result;

  // axelar testnet
  estimateFee = axelarBuildEstimateFee(Environment.TESTNET);
  result = await estimateFee(
    chainIds['bnbt'],
    chainIds['mbase'],
    { gasLimit: 200000 }
  )
  console.log("   axelar result: ", result)


  // layerzero
  const provider = new ethers.providers.JsonRpcProvider(
    "https://bsc-testnet.publicnode.com"
  );
  estimateFee = layerzeroBuildEstimateFee(provider)
  result = await estimateFee(
    chainIds['bnbt'],
    chainIds['mbase'],
    { gasLimit: 200000, content: "0x12345678" },
    "0x7ad6f07cce408befa11655e222b1ab0a2052c6a5"
  )
  console.log("layerzero result: ", result)

  console.log("-----------------")
}
main()
