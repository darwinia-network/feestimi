import { BigNumber, ethers } from "ethers";
import { effectGetProvider } from "./chainsMini";
import { pipe, Effect } from "effect";
import { BaseError, FeestimiError } from "./errors";

type ContractInfo = {
  contractAddress: string,
  contractAbi: string[]
}

const getContract = (provider: ethers.providers.Provider, contractAddress: string, contractAbi: string[]) => {
  return new ethers.Contract(
    contractAddress,
    contractAbi,
    provider
  );
}

const estimateGas = async (contract: ethers.Contract, functionName: string, params: any[]) => {
  return await contract.estimateGas[functionName](...params);
}

const getGasPrice = async (provider: ethers.providers.Provider) => {
  return await provider.getGasPrice();
}

const effectEstimateGas = (chainId: number, contract: ethers.Contract, functionName: string, ...params: any[]): Effect.Effect<never, BaseError, any> => {
  return Effect.tryPromise({
    try: () => estimateGas(contract, functionName, params),
    catch: (error) => new FeestimiError(chainId, `${error}`)
  })
}

const effectGasPrice = (chainId: number, provider: ethers.providers.Provider): Effect.Effect<never, BaseError, BigNumber> => {
  return Effect.tryPromise({
    try: () => getGasPrice(provider),
    catch: (error) => new FeestimiError(chainId, `${error}`)
  })
}

function estimateExecutionFee(chainId: number, info: ContractInfo, functionName: string, ...params: any[]): Effect.Effect<never, Error, BigNumber> {
  return pipe(
    Effect.Do,
    Effect.bind('provider', () => effectGetProvider(chainId)),
    Effect.let('contract', ({ provider }) => getContract(provider, info.contractAddress, info.contractAbi)),
    Effect.bind('gasLimit', ({ contract }) => effectEstimateGas(chainId, contract, functionName, ...params)),
    Effect.bind('gasPrice', ({ provider }) => effectGasPrice(chainId, provider)),
    Effect.map(({ gasLimit, gasPrice }) => gasLimit.mul(gasPrice)),
  )
}

// function main() {
//   const chainId = 1
//   const contractInfo: ContractInfo = {
//     contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
//     contractAbi: [
//       "function balanceOf(address owner) returns (uint256)",
//       "function totalSupply() returns (uint256)"
//     ]
//   }
//   const functionName = 'balanceOf'
//   const params: any[] = ['0xF977814e90dA44bFA03b6295A0616a897441aceC'] // binance 8
//
//   Effect.runPromise(estimateExecutionFee(chainId, contractInfo, functionName, ...params)).then(console.log)
//
//   Effect.runPromise(estimateExecutionFee(chainId, contractInfo, 'totalSupply')).then(console.log)
// }
//
// main()

export { estimateExecutionFee, ContractInfo, getGasPrice, effectGasPrice }
