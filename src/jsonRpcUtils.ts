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

// get chain id from ethereum rpc api
async function eth_chainId(rpcUrl: string) {
  try {
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: "2.0",
        id: +new Date(),
        method: "eth_chainId",
        params: [],
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
    return Number(response.data.result);
  } catch (error: any) {
    if (error instanceof JSONRPCError) {
      throw error;
    } else {
      throw new AxiosError(error.message);
    }
  }
}

async function eth_estimateGas(rpcUrl: string, tx: any) {
  try {
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: "2.0",
        id: +new Date(),
        method: "eth_estimateGas",
        params: [tx],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    if (response.data.error) {
      throw new JSONRPCError(JSON.stringify(response.data));
    }
    return Number(response.data.result);
  } catch (error: any) {
    if (error instanceof JSONRPCError) {
      throw error;
    } else {
      throw new AxiosError(error.message);
    }
  }
}

export { eth_chainId, eth_estimateGas, AxiosError, JSONRPCError };
