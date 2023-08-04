import * as chains from "./chains_mini.json";
import 'dotenv/config'
import { getChainId } from "./jsonRpcUtils";
import { Effect, pipe } from "effect";
import { ethers } from "ethers";
import { FeestimiError } from "./errors";

const chainMapping: { [key: number]: object } = {}

Object.keys(chains).forEach((key) => {
  const chain = chains[parseInt(key)]
  if (chain) {
    chainMapping[chain.chainId] = chain
  }
})

const INFURA_API_KEY: string = process.env.INFURA_API_KEY || ''
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || ''
const ANKR_API_KEY = process.env.ANKR_API_KEY || ''

async function getRpcUrl(chainId: number) {
  const chain: { [key: string]: any } = chainMapping[chainId]
  if (!chain) {
    return null
  }

  const rpcList: string[] = chain.rpc

  let finalRpcUrl: string = ''
  for (let index = 0; index < rpcList.length; index++) {
    const rpc = rpcList[index];

    if (rpc.startsWith('http')) {
      if (rpc.includes('${INFURA_API_KEY}')) {
        finalRpcUrl = rpc.replace("${INFURA_API_KEY}", INFURA_API_KEY)
      } else if (rpc.includes('${ALCHEMY_API_KEY}')) {
        finalRpcUrl = rpc.replace('${ALCHEMY_API_KEY}', ALCHEMY_API_KEY)
      } else if (rpc.includes('${ANKR_API_KEY}')) {
        finalRpcUrl = rpc.replace('${ALCHEMY_API_KEY}', ANKR_API_KEY)
      } else {
        finalRpcUrl = rpc
      }
    }

    if (await isAliveAndCorrect(finalRpcUrl, chainId)) {
      break
    }
  }

  return finalRpcUrl
}

// check if rpc is alive by using etherjs
async function isAliveAndCorrect(rpcUrl: string, chainId: number) {
  try {
    const chainIdFromRpc = await getChainId(rpcUrl)
    if (chainIdFromRpc === chainId) {
      return true
    }
    return false
  } catch (error: any) {
    return false
  }
}

const getProvider = (chainId: number): Effect.Effect<never, FeestimiError, ethers.providers.Provider> => {
  return pipe(
    Effect.promise(
      () => getRpcUrl(chainId),
    ),
    Effect.flatMap((url) => {
      if (!url) {
        return Effect.fail(new FeestimiError(chainId, 'json rpc url not found'))
      } else {
        console.log(`json rpc url: ${url}`)
        return Effect.succeed(url)
      }
    }),
    Effect.map((url) => new ethers.providers.JsonRpcProvider(url as string))
  )
}


export { chainMapping, getRpcUrl, getProvider }


