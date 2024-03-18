import { ethers } from "ethers";
import { getContract, estimateGas, callFunction } from "../utils/evmChainsUtils";
import { FeestimiError } from "../errors";

const srcOrmpLineAbi = [
  "function fee(uint256 toChainId, address toDapp, bytes calldata message, bytes calldata params) external view returns (uint256)"
];

async function doEstimateFee(params, config): Promise<[string, string]> {
  const fromChainId = params.fromChainId;
  const toChainId = params.toChainId;
  const payload = params.payload;
  const fromUAAddress = params.fromUAAddress;
  const toUAAddress = params.toUAAddress;
  const refundAddress = params.refundAddress;
  let gasLimit = params.gasLimit;

  const portAddresses = config.portAddresses;
  const ormpAddresses = config.ormpAddresses;

  // PARAMS PREPARATION
  const srcPortAddress = portAddresses[fromChainId]
  console.log(srcPortAddress)
  if (!srcPortAddress) {
    throw new FeestimiError(`srcPortAddress not found`, {
      context: { fromChainId },
    });
  }
  console.log(`srcPortAddress: ${srcPortAddress}`);

  const tgtPortAddress = portAddresses[toChainId]
  if (!tgtPortAddress) {
    throw new FeestimiError(`tgtPortAddress not found`, {
      context: { toChainId },
    });
  }
  console.log(`tgtPortAddress: ${tgtPortAddress}`);

  const tgtOrmpAddress = ormpAddresses[toChainId];
  if (!tgtOrmpAddress) {
    throw new FeestimiError(`tgtOrmpAddress not found`, {
      context: { toChainId },
    });
  }
  console.log(`tgtOrmpAddress: ${tgtOrmpAddress}`)

  // BUILD FULL PAYLOAD
  const fullPayload = buildFullPayload(fromUAAddress, toUAAddress, payload, fromChainId, srcPortAddress)
  console.log(`fullPayload: ${fullPayload}`);

  // GAS ESTIMATION IF NOT PROVIDED
  if (!gasLimit) {
    gasLimit = await estimateGas(toChainId, tgtOrmpAddress, tgtPortAddress, fullPayload);
    console.log(`fullPayload gasLimit estimated: ${gasLimit}`)

    const baseGas = isArb(toChainId) ? (await fetchBaseGas(toChainId)) : 0;
    console.log(`baseGas: ${baseGas}`)

    if (toChainId == 44) {
      gasLimit = Math.round((baseGas + gasLimit) * 1.5);
    } else {
      gasLimit = Math.round((baseGas + gasLimit) * 1.2);
    }
    console.log(`fullPayload gasLimit estimated with buffer: ${gasLimit}`)
  }

  // 1. BUILD PARAMS STR FOR UA TO CALL ORMP
  const paramsStr = buildParamsStr(gasLimit, refundAddress)

  // 2. FEE ESTIMATION
  const fee = await callFunction(
    fromChainId,
    srcPortAddress,
    srcOrmpLineAbi,
    "fee",
    [
      toChainId,
      toUAAddress,
      fullPayload,
      paramsStr
    ]
  );

  return [
    fee.toLocaleString('fullwide', { useGrouping: false }), 
    paramsStr
  ];
}

function buildFullPayload(fromDappAddress: string, toDappAddress: string, payload: string, fromChainId: number, srcPortAddress: string) {
  // https://github.com/darwinia-network/darwinia-msgport/blob/12278bdbe58c2c464ce550a2cf23c8dc9949f741/contracts/lines/ORMPLine.sol#L33
  // bytes memory encoded = abi.encodeWithSelector(ORMPLine.recv.selector, fromDapp, toDapp, message);
  const recv = "0x394d1bca" + ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "bytes"],
    [fromDappAddress, toDappAddress, payload]
  ).slice(2);
  // + byte32 0 + bytes32 fromChainId  + src ORMPLine address 20
  return recv + "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF" + toBytes32Hex(fromChainId) + srcPortAddress.slice(2);

}

function buildParamsStr(gasLimit: number, refundAddress: string) {
  return ethers.utils.defaultAbiCoder.encode(["uint256", "address", "bytes"], [gasLimit, refundAddress, "0x"])
}

function isArb(chainId) {
  return chainId == 42161 || chainId == 421614
}

async function fetchBaseGas(toChainId) {
  return await estimateGas(
    toChainId,
    '0x0f14341A7f464320319025540E8Fe48Ad0fe5aec',
    '0x3f58e8cf0de243f978834e11e0cc419670fce6d8',
    '0x823fb802000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000001523057a05d6293c1e5171ee33ee0a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002e0000000000000000000000000000000000d2de3e2444926c4577b0a59f1dd8bc000000000000000000000000000000000000000000000000000000000000a4b10000000000000000000000000000000000d2de3e2444926c4577b0a59f1dd8bc00000000000000000000000000000000000000000000000000000000001d4a74000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000a4394d1bca000000000000000000000000912d7601569cbc2df8a7f0aae50bfd18e8c64d05000000000000000000000000912d7601569cbc2df8a7f0aae50bfd18e8c64d050000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000904962384355916693600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000000000159dc600000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000ad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb58ca223b8e9b8a22acc58c05a1fd470302ff587d85f4f0fae8db27e2c5db2d21b21ddb9a356815c3fac1026b6dec5df3124afbadb485c9ba5a3e3398a04b7ba85e58769b32a1beaf1ea27375a44095a0d1fb664ce2dd358e7fcbfb78c26a193440eb01ebfc9ed27500cd4dfc979272d1f0913cc9f66540d7e8005811109e1cf2d887c22bd8750d34016ac3c66b5ff102dacdd73f6b014e710b51e8022af9a1968ffd70157e48063fc33c97a050f7f640233bf646cc98d9524c6b92bcf3ab56f839867cc5f7f196b93bae1e27e6320742445d290f2263827498b54fec539f756afcefad4e508c098b9a7e1d8feb19955fb02ba9675585078710969d3440f5054e0f9dc3e7fe016e050eff260334f18a5d4fe391d82092319f5964f2e2eb7c1c3a5f8b13a49e282f609c317a833fb8d976d11517c571d1221a265d25af778ecf8923490c6ceeb450aecdc82e28293031d10c7d73bf85e57bf041a97360aa2c5d99cc1df82d9c4b87413eae2ef048f94b4d3554cea73d92b0f7af96e0271c691e2bb5c67add7c6caf302256adedf7ab114da0acfe870d449a3a489f781d659e8beccda7bce9f4e8618b6bd2f4132ce798cdc7a60e7e1460a7299e3c6342a579626d22733e50f526ec2fa19a22b31e8ed50f23cd1fdf94c9154ed3a7609a2f1ff981fe1d3b5c807b281e4683cc6d6315cf95b9ade8641defcb32372f1c126e398ef7a5a2dce0a8a7f68bb74560f8f71837c2c2ebbcbf7fffb42ae1896f13f7c7479a0b46a28b6f55540f89444f63de0378e3d121be09e06cc9ded1c20e65876d36aa0c65e9645644786b620e2dd2ad648ddfcbf4a7e5b1a3a4ecfe7f64667a3f0b7e2f4418588ed35a2458cffeb39b93d26f18d2ab13bdce6aee58e7b99359ec2dfd95a9c16dc00d6ef18b7933a6f8dc65ccb55667138776f7dea101070dc8796e3774df84f40ae0c8229d0d6069e5c8f39a7c299677a09d367fc7b05e3bc380ee652cdc72595f74c7b1043d0e1ffbab734648c838dfb0527d971b602bc216c9619ef0abf5ac974a1ed57f4050aa510dd9c74f508277b39d7973bb2dfccc5eeb0618db8cd74046ff337f0a7bf2c8e03e10f642c1886798d71806ab1e888d9e5ee87d0838c5655cb21c6cb83313b5a631175dff4963772cce9108188b34ac87c81c41e662ee4dd2dd7b2bc707961b1e646c4047669dcb6584f0d8d770daf5d7e7deb2e388ab20e2573d171a88108e79d820e98f26c0b84aa8b2f4aa4968dbb818ea32293237c50ba75ee485f4c22adf2f741400bdf8d6a9cc7df7ecae576221665d7358448818bb4ae4562849e949e17ac16e0be16688e156b5cf15e098c627c0056a9'
  )
}

function toBytes32Hex(num) {
  // Convert the number to a hexadecimal string
  let hexString = num.toString(16);

  // Pad the string to a length of 64 characters
  let paddedHexString = hexString.padStart(64, '0');

  return paddedHexString;
}

export { doEstimateFee };
