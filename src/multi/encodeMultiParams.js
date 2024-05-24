import { ethers } from "ethers";
import portAddresses from "../portAddesses.js";

// struct RemoteCallArgs {
//     address[] ports;
//     uint256 nonce;
//     uint256 expiration;
//     bytes[] params;
//     uint256[] fees;
// }
function encodeMultiParams(protocols, results, fromChainId) {
  let remoteCallArgs = {
    ports: [],
    nonce: 0,
    expiration: 0,
    params: [],
    fees: []
  };
  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i];
    const result = results[i];
    remoteCallArgs.ports.push(portAddresses[protocol][fromChainId]);
    remoteCallArgs.nonce = Math.round(new Date().getTime()/1000);
    remoteCallArgs.expiration = remoteCallArgs.nonce + 15 * 24 * 3600;
    remoteCallArgs.params.push(result.params);
    remoteCallArgs.fees.push(result.fee);
  }

  // console.log(remoteCallArgs);
  const abi = [
    {
      "components": [
        {
          "name": "ports",
          "type": "address[]"
        },
        {
          "name": "nonce",
          "type": "uint256"
        },
        {
          "name": "expiration",
          "type": "uint256"
        },
        {
          "name": "params",
          "type": "bytes[]"
        },
        {
          "name": "fees",
          "type": "uint256[]"
        }
      ],
      "internalType": "struct RemoteCallArgs",
      "name": "args",
      "type": "tuple"
    }
  ];
  return ethers.utils.defaultAbiCoder.encode(abi, [remoteCallArgs]);
}

export default encodeMultiParams;
