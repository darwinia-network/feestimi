// https://khalilstemmler.com/blogs/typescript/node-starter-project/
import express, { Express, Request, Response } from 'express';
import { Effect, pipe } from "effect";
import { IEstimateFee } from './interfaces/IEstimateFee';

////////////////////////////////////////////
// Prepare estimateFee functions
////////////////////////////////////////////
// layerzero
import layerzeroBuildEstimateFee from "./layerzero/estimateFee";
const lzEstimateFee = layerzeroBuildEstimateFee()

// axelar
import axelarBuildEstimateFee from "./axelar/estimateFee";
import { Environment } from "@axelar-network/axelarjs-sdk";
const axEstimateFee = axelarBuildEstimateFee(Environment.MAINNET);
const axEstimateFeeTestnet = axelarBuildEstimateFee(Environment.TESTNET);

// axelar
import celerBuildEstimateFee from "./celer/estimateFee";
const celerEstimateFee = celerBuildEstimateFee();

// xcmp
import xcmpBuildEstimateFee from "./xcmp/estimateFee";
const xcmpEstimateFee = xcmpBuildEstimateFee();

// ormp
import ormpBuildEstimateFee from "./ormp/estimateFee";
const ormpEstimateFee = ormpBuildEstimateFee();

////////////////////////////////////////////
// Server
////////////////////////////////////////////
const app: Express = express();
const host = '0.0.0.0'
const port = 3389;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Darwinia');
});


/**
  * from_chain_id: string
  * to_chain_id: string
  * gas_limit: string
  * payload: string
  * from_address: string
  * to_address: string
  */
app.get('/:platform/estimate_fee', (req: Request, res: Response) => {
  const platform = req.params.platform;

  ////////////////////
  // Request Params
  ////////////////////
  const fromChainId = req.query.from_chain_id as string
  const toChainId = req.query.to_chain_id as string
  const gasLimit = req.query.gas_limit as string
  const payload: string = req.query.payload as string
  const fromAddress: string = req.query.from_address as string
  const toAddress: string = req.query.to_address as string
  const extra: string = req.query.extra as string; // extra=[[1, 10]]
  console.log(`platform: ${platform}, extra: ${extra}`)
  console.log(`fromChain: ${fromChainId}, toChain: ${toChainId}, gasLimit: ${gasLimit})`)
  console.log(`payload: ${payload}, fromAddress: ${fromAddress}, toAddress: ${toAddress})`)
  if (!fromChainId || !toChainId || !gasLimit || !payload || !fromAddress || !toAddress || !extra) {
    errorWith(res, 1, `'from_chain_id', 'to_chain_id', 'gas_limit', 'payload', 'from_address', 'to_address' and 'extra' is required`)
    return;
  }

  ////////////////////
  // Estimate Fee
  ////////////////////
  const estimateFee = pipe(
    effectCheckParams(fromChainId, toChainId, gasLimit, fromAddress, toAddress, extra),
    Effect.flatMap(params => {
      if (platform == 'layerzero') {
        return lzEstimateFee(params.fromChainIdInt, params.toChainIdInt, params.gasLimitInt, payload, fromAddress, toAddress, params.extraParams)
      } else if (platform == 'axelar') {
        return axEstimateFee(params.fromChainIdInt, params.toChainIdInt, params.gasLimitInt, payload, fromAddress, toAddress, params.extraParams)
      } else if (platform == 'axelar-testnet') {
        return axEstimateFeeTestnet(params.fromChainIdInt, params.toChainIdInt, params.gasLimitInt, payload, fromAddress, toAddress, params.extraParams)
      } else if (platform == 'celer') {
        return celerEstimateFee(params.fromChainIdInt, params.toChainIdInt, params.gasLimitInt, payload, fromAddress, toAddress, params.extraParams)
      } else if (platform == 'xcmp') {
        return xcmpEstimateFee(params.fromChainIdInt, params.toChainIdInt, params.gasLimitInt, payload, fromAddress, toAddress, params.extraParams)
      } else if (platform == 'ormp') {
        return ormpEstimateFee(params.fromChainIdInt, params.toChainIdInt, params.gasLimitInt, payload, fromAddress, toAddress, params.extraParams)
      } else {
        return Effect.fail(new Error(`Unsupported platform: ${platform}`))
      }
    }),
    Effect.map((result) => ok(res, result))
  )

  Effect.runPromise(estimateFee).catch((e) => errorWith(res, 1, e.message));
});

app.get('/estimate_fees', (req: Request, res: Response) => {
  ////////////////////
  // Request Params
  ////////////////////
  const fromChainId = req.query.from_chain_id as string
  const toChainId = req.query.to_chain_id as string
  const gasLimit = req.query.gas_limit as string
  const payload: string = req.query.payload as string
  const fromAddress: string = req.query.from_address as string
  const toAddress: string = req.query.to_address as string
  const extra: string = req.query.extra as string; // extra=[[1, 10]]
  console.log(`fromChain: ${fromChainId}, toChain: ${toChainId}, gasLimit: ${gasLimit})`)
  console.log(`payload: ${payload}, fromAddress: ${fromAddress}, toAddress: ${toAddress})`)
  if (!fromChainId || !toChainId || !gasLimit || !payload || !fromAddress || !toAddress || !extra) {
    errorWith(res, 1, `'from_chain_id', 'to_chain_id', 'gas_limit', 'payload', 'from_address', 'to_address' and 'extra' is required`)
    return;
  }

  const estimateFees = pipe(
    effectCheckParams(fromChainId, toChainId, gasLimit, fromAddress, toAddress, extra),
    Effect.flatMap(params =>

      Effect.all([
        lzEstimateFee(params.fromChainIdInt, params.toChainIdInt, params.gasLimitInt, payload, fromAddress, toAddress, params.extraParams),
        axEstimateFee(params.fromChainIdInt, params.toChainIdInt, params.gasLimitInt, payload, fromAddress, toAddress, params.extraParams),
        celerEstimateFee(params.fromChainIdInt, params.toChainIdInt, params.gasLimitInt, payload, fromAddress, toAddress, params.extraParams)
      ], { concurrency: 'inherit' })

    ),
    Effect.map((result) => ok(res, {
      layerzero: result[0],
      axelar: result[1],
      celer: result[2]
    }))
  )

  Effect.runPromise(estimateFees).catch((e) => errorWith(res, 1, e.message));

})


function effectCheckParams(fromChainId: string, toChainId: string, gasLimit: string, fromAddress: string, toAddress: string, extra: any) {
  return Effect.try({
    try: () => {
      const fromChainIdInt = parseInt(fromChainId)
      const toChainIdInt = parseInt(toChainId)
      const gasLimitInt = parseInt(gasLimit)
      const extraParams = parseExtraParams(extra)
      return {
        fromChainIdInt, toChainIdInt, gasLimitInt, fromAddress, toAddress, extraParams
      }
    },
    catch: (error) => new Error(`Invalid params: ${error}`)
  })
}

function parseExtraParams(extra: string) {
  try {
    const extraParams: any[] = JSON.parse(extra)
    return extraParams
  } catch (e: any) {
    console.error(e.message)
    return []
  }
}

function ok(res: Response, result: any) {
  res.send({
    code: 0,
    data: result
  })
}

function errorWith(res: Response, code: number, message: string) {
  res.status(400).send(
    {
      code: code,
      message: message
    }
  )
}

app.listen(port, host, () => {
  console.log(`[Server]: I am running at https://${host}:${port}`);
});
