import axios from "axios";

class AxiosError extends Error {
  readonly _tag = "AxiosError";
  constructor(message: string) {
    super(message);
  }
}

class JSONRPCError extends Error {
  readonly _tag = "JSONRPCError";

  constructor(message: string) {
    super(message);
  }
}

async function _request(rpcUrl, method, params) {
  try {
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: "2.0",
        id: +new Date(),
        method: method,
        params: params,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    if (response.data.error) {
      throw new JSONRPCError(response.data.error.message);
    }
    return response.data.result;
  } catch (error: any) {
    if (error instanceof JSONRPCError) {
      throw error;
    } else {
      throw new AxiosError(error.message);
    }
  }
}

// get chain id from ethereum rpc api
async function eth_chainId(rpcUrl: string) {
  return Number(await _request(rpcUrl, "eth_chainId", []));
}

async function eth_estimateGas(rpcUrl: string, tx: any) {
  return Number(await _request(rpcUrl, "eth_estimateGas", [tx]));
}

async function eth_blockNumber(rpcUrl: string) {
  return Number(await _request(rpcUrl, "eth_blockNumber", []));
}

async function eth_call(rpcUrl: string, params: any) {
  return await _request(rpcUrl, "eth_call", [params, "latest"]);
}

export { eth_chainId, eth_estimateGas, eth_blockNumber, eth_call, AxiosError, JSONRPCError };
