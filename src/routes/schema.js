import vine from '@vinejs/vine'
import { getProtocol } from './helpers.js'

const ormpSchema = vine.object({
  refundAddress: vine.string().regex(/^0x[a-fA-F0-9]{40}$/),
  gasLimit: vine.number().positive().withoutDecimals().optional(),
})

const lzSchema = vine.object({
  gasLimit: vine.number().positive().withoutDecimals().optional(),
})

const protocolsSchema = vine.object({
  ormp: ormpSchema.optional(),
  lz: lzSchema.optional()
})

const schema = vine.object({
  fromChainId: vine.number().positive().withoutDecimals(),
  fromAddress: vine.string().regex(/^0x[a-fA-F0-9]{40}$/),
  toChainId: vine.number().positive().withoutDecimals(),
  toAddress: vine.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: vine.string().regex(/^0x[a-fA-F0-9]*$/),
  multi: vine.array(vine.string().regex(/^(ormp|lz)$/)).distinct().notEmpty().optional(),
})

async function parseParams(req) {
  let protocol = undefined;
  let protocolsParams = {};

  const commonParams = await vine.validate({ schema: schema, data: req.body });
  if (commonParams.multi) {
    protocol = 'multi';
    if (commonParams.multi.includes('ormp')) {
      const ormpParams = await vine.validate({ schema: ormpSchema, data: req.body.ormp });
      protocolsParams['ormp'] = ormpParams;
    }
    if (commonParams.multi.includes('lz')) {
      const lzParams = await vine.validate({ schema: lzSchema, data: req.body.lz });
      protocolsParams['lz'] = lzParams;
    }
  } else {
    protocolsParams = await vine.validate({ schema: protocolsSchema, data: req.body });
    protocol = getProtocol(protocolsParams);
  }
  return { protocol, commonParams, protocolsParams };
}

export { parseParams }
