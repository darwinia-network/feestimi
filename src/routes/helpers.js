import { ethers } from "ethers";
import portAddresses from "../portAddesses.js";
import { errors } from '@vinejs/vine'
import path from 'path';
import vine from '@vinejs/vine'

async function getEstimateFee(protocol) {
  try {
    return await import(`../${protocol}/estimateFee.js`);
  } catch (e) {
    console.error(e);
    throw new Error(`Not support '${protocol}' protocol`);
  }
}

function ok(res, result) {
  res.send({
    code: 0,
    data: result,
  });
}

function error(res, err) {
  let messages = '';
  if (err instanceof errors.E_VALIDATION_ERROR) {
    messages = err.messages.map(({ message, field }) => `${field} validate failed`);
  } else if (err instanceof Error) {
    messages = [err.message]
  } else {
    messages = [err]
  }
  res.send({
    code: 1,
    error: messages
  });
}

function getProtocol(protocolsParams) {
  const protocols = Object.keys(protocolsParams);
  if (protocols.length === 0) {
    throw new Error("No protocol params");
  }

  if (protocols.length > 1) {
    throw new Error("Your input contains more than one protocol");
  }
  return protocols[0];
}

function formatResult(result) {
  let formatted = {
    fee: `${result.fee}`,
    params: result.params,
  };

  if (result.gas) {
    formatted.gas = Object.keys(result.gas).map(key => ({ [key]: `${result.gas[key]}` })).reduce((acc, cur) => ({ ...acc, ...cur }), {})
  } 

  return formatted
}

export { getEstimateFee, ok, error, getProtocol, formatResult };
