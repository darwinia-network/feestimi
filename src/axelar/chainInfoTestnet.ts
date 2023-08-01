import {
  GasToken,
} from "@axelar-network/axelarjs-sdk";
const chainInfo: { [key: string]: [string, string] } = {
  "5": ["ethereum-2", GasToken.ETH],
  "43113": ["Avalanche", GasToken.GLMR],
  "4002": ["Fantom", GasToken.FTM],
  "80001": ["Polygon", GasToken.MATIC],
  "1442": ["polygon-zkevm", GasToken.ETH],
  "1287": ["Moonbeam", GasToken.GLMR],
  "1313161555": ["aurora", GasToken.AURORA],
  "97": ["binance", GasToken.BINANCE],
  "421613": ["arbitrum", GasToken.ETH],
  "44787": ["celo", GasToken.CELO],
  "2221": ["kava", GasToken.KAVA],
  "84531": ["base", GasToken.BASE],
  "314159": ["filecoin-2", GasToken.FILECOIN],
  "420": ["optimism", GasToken.ETH],
  "59140": ["linea", GasToken.ETH],
}

export default chainInfo;
