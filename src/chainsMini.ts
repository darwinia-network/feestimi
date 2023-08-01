import * as chains from "./chains_mini.json";

const chainMapping: { [key: number]: object } = {}

Object.keys(chains).forEach((key) => {
  const chain = chains[parseInt(key)]
  if (chain) {
    chainMapping[chain.chainId] = chain
  }
})

export default chainMapping
