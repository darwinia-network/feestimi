import { CHAINS, GasToken } from "@axelar-network/axelarjs-sdk";

const chainInfo: { [key: string]: [string, string] } = {
  "1": [CHAINS.MAINNET.ETHEREUM, GasToken.ETH],
  "56": [CHAINS.MAINNET.BINANCE, GasToken.BINANCE],
  "137": [CHAINS.MAINNET.POLYGON, GasToken.MATIC],
  "43114": [CHAINS.MAINNET.AVALANCHE, GasToken.AVAX],
  "42161": [CHAINS.MAINNET.ARBITRUM, GasToken.ETH],
  "10": [CHAINS.MAINNET.OPTIMISM, GasToken.ETH],
  "250": [CHAINS.MAINNET.FANTOM, GasToken.FTM],
  "1284": [CHAINS.MAINNET.MOONBEAM, GasToken.GLMR],
  "42220": [CHAINS.MAINNET.CELO, GasToken.CELO],
  "314": [CHAINS.MAINNET.FILECOIN, GasToken.FILECOIN],
  "2222": [CHAINS.MAINNET.KAVA, GasToken.KAVA],
}

export default chainInfo;
