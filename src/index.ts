// https://khalilstemmler.com/blogs/typescript/node-starter-project/
import express, { Express, Request, Response } from 'express';
import chainIds from './chainIds';
import { chainMapping } from './chainsMini';
import { Effect, pipe } from "effect";
import { IEstimateFee } from './interfaces/IEstimateFee';

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

const app: Express = express();
const host = '0.0.0.0'
const port = 3389;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Darwinia');
});

app.get('/chains', (req: Request, res: Response) => {
  const result: { [key: number]: string } = {}

  const chainIds = Object.keys(chainMapping)
  for (let i = 0; i < chainIds.length; i++) {
    const chainId: number = parseInt(chainIds[i])
    const chain = chainMapping[chainId]
    const chainName = (chain as { name: string }).name
    result[chainId] = chainName
  }
  ok(res, result)
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

  ///////////////////////////////////
  // Request Params
  ///////////////////////////////////
  const fromChainId = req.query.from_chain_id as string
  const toChainId = req.query.to_chain_id as string
  const gasLimit = req.query.gas_limit as string
  console.log(`fromChain: ${fromChainId}, toChain: ${toChainId}, gasLimit: ${gasLimit})`)
  if (!fromChainId || !toChainId || !gasLimit) {
    errorWith(res, 1, `'from_chain_id', 'to_chain_id' and 'gas_limit' are required`)
    return;
  }

  const payload: string = req.query.payload as string;
  const fromAddress: string = req.query.from_address as string;
  const toAddress: string = req.query.to_address as string;
  const extra: string = req.query.extra as string; // extra=[[1, 10]]
  console.log(`payload: ${payload}, fromAddress: ${fromAddress}, toAddress: ${toAddress})`)
  if (platform == 'layerzero' || platform == 'celer') {
    if (!payload) {
      errorWith(res, 1, `'payload' is required for ${platform}`)
      return;
    }
  }
  if (platform == 'celer') {
    if (!fromAddress || !toAddress || !extra) {
      errorWith(res, 1, `'fromAddress', 'toAddress' and 'extra' is required for celer`)
      return;
    }
  }


  ///////////////////////////////////
  // Estimate Fee
  ///////////////////////////////////
  const fromChainIdInt = parseInt(fromChainId)
  const toChainIdInt = parseInt(toChainId)
  const gasLimitInt = parseInt(gasLimit)

  if (platform == 'layerzero') {
    run(res, lzEstimateFee, fromChainIdInt, toChainIdInt, gasLimitInt, payload, fromAddress)
  } else if (platform == 'axelar') {
    run(res, axEstimateFee, fromChainIdInt, toChainIdInt, gasLimitInt)
  } else if (platform == 'axelar-testnet') {
    run(res, axEstimateFeeTestnet, fromChainIdInt, toChainIdInt, gasLimitInt)
  } else if (platform == 'celer') {
    const extraParams: any[] = JSON.parse(extra)
    run(res, celerEstimateFee, fromChainIdInt, toChainIdInt, gasLimitInt, payload, fromAddress, toAddress, extraParams)
  } else {
    errorWith(res, 100, 'Unsupported platform')
  }
});

function run(
  res: Response,
  program: IEstimateFee,
  fromChainId: number,
  toChainId: number,
  gasLimit: number,
  payload?: string,
  fromDappAddress?: string,
  toDappAddress?: string,
  extraParams?: any[]
) {
  Effect.runPromise(
    pipe(
      program(fromChainId, toChainId, gasLimit, payload, fromDappAddress, toDappAddress, extraParams),
      Effect.match({
        onFailure: (error) => {
          errorWith(res, error.code, error.message as string)
        },
        onSuccess: (result) => ok(res, result)
      }),
    )
  )
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
