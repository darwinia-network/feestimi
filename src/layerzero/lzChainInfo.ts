import { FeestimiError } from "../errors";

const {
  ChainId,
  ChainListId,
  LZ_ADDRESS,
  ChainKey,
} = require("@layerzerolabs/lz-sdk");

function getLzChainEnumKey(chainId: number) {
  const result: string[] = [];

  // https://stackoverflow.com/questions/50299329/how-to-get-enum-names-as-a-string-array-in-typescript
  const keys = Object.keys(ChainListId).filter((v) => isNaN(Number(v)));
  keys.forEach((key) => {
    const value = ChainListId[key];
    if (
      value == chainId &&
      !key.endsWith("_SANDBOX") &&
      !key.startsWith("APTOS") &&
      key != "GOERLI_MAINNET"
    ) {
      result.push(key);
    }
  });

  if (result.length == 0) {
    throw new FeestimiError("lz: chain id not found", { context: { chainId } });
  }
  if (result.length > 1) {
    throw new FeestimiError("lz: chain id multiple mappings matches", {
      context: { chainId },
    });
  }

  return result[0];
}

function getLzChainKey(lzChainEnumKey: string): string {
  const chainKey = ChainKey[lzChainEnumKey];
  if (!chainKey) {
    throw new FeestimiError("lz: chain key not found by chain enum key", {
      context: { lzChainEnumKey },
    });
  }
  return chainKey;
}

function getLzChainId(lzChainEnumKey: string): number {
  const chainId = ChainId[lzChainEnumKey];
  if (!chainId) {
    throw new FeestimiError("lz: chain id not found by chain enum key", {
      context: { lzChainEnumKey },
    });
  }
  return chainId;
}

function getLzAddress(lzChainKey: string) {
  const lzAddress = LZ_ADDRESS[lzChainKey];
  if (!lzAddress) {
    throw new FeestimiError("lz: endpoint address not found", {
      context: { lzChainKey },
    });
  }
  return lzAddress;
}

function getLzChainInfo(chainId: number) {
  const lzChainEnumKey = getLzChainEnumKey(chainId);
  const lzChainId = getLzChainId(lzChainEnumKey);
  const lzChainKey = getLzChainKey(lzChainEnumKey);
  const lzAddress = getLzAddress(lzChainKey);
  return { lzChainKey, lzChainId, lzEndpointAddress: lzAddress };
}

export { getLzChainInfo };
