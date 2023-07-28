import {
  GasToken,
} from "@axelar-network/axelarjs-sdk";
const chainInfo: { [key: string]: [string, string] } = {
  "1": ["Ethereum", GasToken.ETH],
  "56": ["binance", GasToken.BINANCE],
  "137": ["Polygon", GasToken.MATIC],
  "43114": ["Avalanche", GasToken.AVAX],
  "42161": ["arbitrum", GasToken.ETH],
  "10": ["optimism", GasToken.ETH],
  "84536": ["base", GasToken.BASE],
  "59144": ["linea", GasToken.ETH],
  "250": ["Fantom", GasToken.FTM],
  "1284": ["Moonbeam", GasToken.GLMR],
  "42220": ["celo", GasToken.CELO],
  "314": ["filecoin", GasToken.FILECOIN],
  "2222": ["kava", GasToken.KAVA],
  "1313161554": ["aurora", GasToken.AURORA]
}

export default chainInfo;
