import { FeestimiError } from "../errors";

const { ChainId, ChainListId, LZ_ADDRESS, ChainKey } = require("@layerzerolabs/lz-sdk");

function getLzChainEnumKey(chainId: number) {
  const result: string[] = []

  // https://stackoverflow.com/questions/50299329/how-to-get-enum-names-as-a-string-array-in-typescript
  const keys = Object.keys(ChainListId).filter((v) => isNaN(Number(v)));
  keys.forEach((key) => {
    const value = ChainListId[key]
    if (value == chainId && !key.endsWith("_SANDBOX") && !key.startsWith("APTOS") && key != "GOERLI_MAINNET") {
      result.push(key)
    }
  })

  if (result.length == 0) {
    throw new FeestimiError(chainId, "chain id not found")
  }
  if (result.length > 1) {
    throw new FeestimiError(chainId, 'chain id multiple mappings matches')
  }

  return result[0]
}

function getLzChainKey(lzChainEnumKey: string): string {
  return ChainKey[lzChainEnumKey]
}

function getLzChainId(lzChainEnumKey: string): number {
  return ChainId[lzChainEnumKey]
}

function getLzAddress(lzChainKey: string) {
  return LZ_ADDRESS[lzChainKey]
}

function getLzChainInfo(chainId: number) {
  const lzChainEnumKey = getLzChainEnumKey(chainId)
  const lzChainId = getLzChainId(lzChainEnumKey)
  const lzChainKey = getLzChainKey(lzChainEnumKey)
  const lzAddress = getLzAddress(lzChainKey)
  return [lzChainKey, lzChainId, lzAddress]
}

export default getLzChainInfo
