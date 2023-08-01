import * as chains from "./chains_mini.json";
import axios from 'axios';
import 'dotenv/config'

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

class AxiosError extends Error {
  readonly _tag = "AxiosError"
  constructor(message: string) {
    super(message);
  }
}

class JSONRPCError extends Error {
  readonly _tag = "JSONRPCError"

  constructor(message: string) {
    super(message);
  }
}

// get chain id from ethereum rpc api 
async function getChainId(rpcUrl: string) {
  try {
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: + new Date(),
      method: 'eth_chainId',
      params: [],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    })

    if (response.data.error) {
      throw new JSONRPCError(response.data.error.message)
    }
    return Number(response.data.result)
  } catch (error: any) {
    if (error instanceof JSONRPCError) {
      throw error
    } else {
      throw new AxiosError(error.message)
    }
  }
}

async function main() {
  console.log(await getRpcUrl(1))
}
main()

export { chainMapping, getRpcUrl }
