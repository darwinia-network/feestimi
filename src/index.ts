import express, { Express, Request, Response } from "express";
import { IEstimateFee } from "./interfaces/IEstimateFee";
import { ensureError } from "./errors";
require('dotenv').config({ silent: true })

////////////////////////////////////////////
// Server
////////////////////////////////////////////
const app: Express = express();
const host = "0.0.0.0";
const port = parseInt(process.env.PORT ?? '3389');

// enable CORS for all routes and for our specific API-Key header
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, API-Key')
  next()
})

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, Darwinia");
});

// // PROTECT ALL ROUTES THAT FOLLOW
// app.use((req, res, next) => {
//   const apiKey = req.get('API-Key')
//   if (!apiKey || apiKey !== process.env.API_KEY) {
//     res.status(401).json({ code: 1, error: 'unauthorised' })
//   } else {
//     next()
//   }
// })

/**
 * from_chain_id: string
 * to_chain_id: string
 * gas_limit: string
 * payload: string
 * from_address: string
 * to_address: string
 * refund_address: string
 */
app.get("/:protocol/fee", async (req: Request, res: Response) => {
  const protocol = req.params.protocol;

  ////////////////////
  // Request Params
  ////////////////////
  const fromChainId = req.query.from_chain_id as string;
  const toChainId = req.query.to_chain_id as string;
  const gasLimit = req.query.gas_limit as string;
  const payload: string = req.query.payload as string;
  const fromAddress: string = req.query.from_address as string;
  const toAddress: string = req.query.to_address as string;
  const refundAddress: string = req.query.refund_address as string;
  const extra: string = req.query.extra as string; // extra=[[1, 10]]
  console.log(`protocol: ${protocol}`);
  console.log(`fromChain: ${fromChainId}, toChain: ${toChainId}`);
  console.log(`fromAddress: ${fromAddress}, toAddress: ${toAddress}`)
  console.log(`payload: ${payload}`);
  console.log(`gasLimit: ${gasLimit}`)
  console.log(`refundAddress: ${refundAddress}`)
  console.log(`extra: ${extra}`);
  if (
    !fromChainId ||
    !toChainId ||
    !payload ||
    !fromAddress ||
    !toAddress ||
    !refundAddress
  ) {
    errorWith(
      res,
      1,
      `'from_chain_id', 'to_chain_id', 'payload', 'from_address', 'to_address', 'refund_address' are required`
    );
    return;
  }

  ////////////////////
  // Estimate Fee
  ////////////////////
  try {
    const params = checkParams(
      fromChainId,
      toChainId,
      gasLimit,
      fromAddress,
      toAddress,
      refundAddress,
      extra
    );
    const result = await estimateFee(
      protocol,
      params.fromChainIdInt,
      params.toChainIdInt,
      params.gasLimitInt,
      payload,
      params.fromAddress,
      params.toAddress,
      params.refundAddress,
      params.extraParams
    );
    ok(res, { fee: result[0], params: result[1] });
  } catch (e: any) {
    errorWith(res, 1, e);
  }
});

async function getEstimateFeeFunction(protocol: string) {
  try {
    const buildEstimateFee = await import(`./${protocol}/estimateFee`)
    return buildEstimateFee.default();
  } catch (e) {
    console.log(e);
    throw new Error(`${protocol} - ${e.message}`);
  }
}

async function estimateFee(
  protocol: string,
  fromChainId: number,
  toChainId: number,
  gasLimit: number,
  payload: string,
  fromAddress: string,
  toAddress: string,
  refundAddress: string,
  extraParams: any
) {
  try {
    const estimateFee = await getEstimateFeeFunction(protocol);
    return await estimateFee(
      fromChainId,
      toChainId,
      payload,
      fromAddress,
      toAddress,
      refundAddress,
      gasLimit,
      extraParams
    );
  } catch (e) {
    const err = ensureError(e);
    console.error(err);
    throw err;
  }
}

function checkParams(
  fromChainId: string,
  toChainId: string,
  gasLimit: string,
  fromAddress: string,
  toAddress: string,
  refundAddress: string,
  extra: any
) {
  try {
    const fromChainIdInt = parseInt(fromChainId);
    const toChainIdInt = parseInt(toChainId);
    const gasLimitInt = parseInt(gasLimit);
    const extraParams = parseExtraParams(extra);

    return {
      fromChainIdInt,
      toChainIdInt,
      gasLimitInt,
      fromAddress,
      toAddress,
      refundAddress,
      extraParams,
    };
  } catch (e) {
    throw new Error(`Invalid params: ${e}`);
  }
}

function parseExtraParams(extra: string) {
  try {
    if (extra) {
      const extraParams: any[] = JSON.parse(extra);
      return extraParams;
    } else {
      return []
    }
  } catch (e: any) {
    console.error(e.message);
    return [];
  }
}

function ok(res: Response, result: any) {
  res.send({
    code: 0,
    data: result,
  });
}

function errorWith(res: Response, code: number, error: Error | string) {
  if (error instanceof Error) {
    res.status(400).send({
      code: code,
      error: error.toString(),
    });
  } else {
    res.status(400).send({
      code: code,
      error: error,
    });
  }
}

app.listen(port, host, () => {
  console.log(`[Server]: I am running at https://${host}:${port}`);
});
