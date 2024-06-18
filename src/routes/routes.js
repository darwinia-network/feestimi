import httpContext from 'express-http-context';
import express from "express";
const router = express.Router();

import { getEstimateFee, ok, error, getProtocol, formatResult } from "./helpers.js";
import { parseParams } from "./schema.js";

router.get("/", (_req, res) => {
  res.send("Hello Darwinia!");
});

router.get("/ormp/fee", async (req, res) => {
  try {
    const fromChainId = req.query.from_chain_id
    const fromAddress = req.query.from_address
    const toChainId = req.query.to_chain_id
    const toAddress = req.query.to_address
    const message = req.query.payload
    const refundAddress = req.query.refund_address
    const gasLimit = req.query.gas_limit

    const { protocol, commonParams, protocolsParams } = await parseParams({
      body: {
        fromChainId,
        fromAddress,
        toChainId,
        toAddress,
        message,
        ormp: {
          refundAddress,
          gasLimit
        }
      }
    });

    // set log title
    httpContext.set('logTitle', `${protocol}:${commonParams.fromChainId}>${commonParams.toChainId}`)

    // get estimate fee function by protocol
    const estimateFee = await getEstimateFee(protocol);

    const result = await estimateFee.default(
      commonParams.fromChainId,
      commonParams.fromAddress,
      commonParams.toChainId,
      commonParams.toAddress,
      commonParams.message,
      protocolsParams
    );
    ok(res, formatResult(result));
  } catch (e) {
    console.error(e);
    error(res, e);
  }
});

router.post("/v2/fee_with_options", async (req, res) => {
  try {
    const { protocol, commonParams, protocolsParams } = await parseParams(req);

    // set log title
    httpContext.set('logTitle', `${protocol}:${commonParams.fromChainId}>${commonParams.toChainId}`)

    // get estimate fee function by protocol
    const estimateFee = await getEstimateFee(protocol);

    // call estimate fee function to get result
    const result = await estimateFee.default(
      commonParams.fromChainId,
      commonParams.fromAddress,
      commonParams.toChainId,
      commonParams.toAddress,
      commonParams.message,
      protocolsParams
    );
  
    // response result
    ok(res, formatResult(result));
  } catch (e) {
    console.error(e);
    error(res, e);
  }
});

export default router;

