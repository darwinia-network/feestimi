import { ethers } from 'ethers'
const BigNumber = ethers.BigNumber;
import { getBlockNumber } from "../jsonRpcUtils.js";

async function estimateFee(fromChainId, fromAddress, toChainId, toAddress, message, protocolsParams) {
  console.log(`== 'lz' - Estimating fee at height of ${fromChainId}: ${await getBlockNumber(fromChainId)} ...`)
  return {
    fee: BigNumber.from(79828025n),
    params: "0x0000000000000000000000000000000000000000000000000000000000035117000000000000000000000000570fca2c6f902949dbb90664be5680fec94a84f600000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
    gas: {
      protocol: BigNumber.from(0n),
      msgport: BigNumber.from(181139n),
      total: BigNumber.from(217367n)
    }
  }
}

export default estimateFee
