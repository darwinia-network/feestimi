import { IChainIdMapping } from "../interfaces/IChainIdMapping";
import chainIds from "./chainIds";

const chainIdMapping: IChainIdMapping = (chainId: number): number | string => {
  return chainIds[chainId]
}

export default chainIdMapping;
