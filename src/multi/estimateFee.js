import { getEstimateFee } from "../routes/helpers.js";
import encodeMultiParams from "./encodeMultiParams.js";
import { ethers } from 'ethers'
const BigNumber = ethers.BigNumber;

async function estimateFee(fromChainId, fromAddress, toChainId, toAddress, message, protocolsParams) {
  const protocols = Object.keys(protocolsParams);

  const results = await Promise.all(protocols.map(async (protocol) => {
    const estimateFee = await getEstimateFee(protocol);
    return estimateFee.default(fromChainId, fromAddress, toChainId, toAddress, message, protocolsParams);
  }));

  const encoded = encodeMultiParams(protocols, results, fromChainId);

  return {
    fee: results.reduce((acc, result) => acc.add(result.fee), BigNumber.from(0n)),
    params: encoded
  };
}

export default estimateFee
