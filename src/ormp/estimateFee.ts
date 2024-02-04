import { IEstimateFee } from "../interfaces/IEstimateFee";
import { doEstimateFee } from "./doEstimateFee";
import { portAddresses, ormpAddresses } from "./addresses";

const buildEstimateFee = () => {
  const estimateFee: IEstimateFee = async (
    fromChainId,
    toChainId,
    payload,
    fromUAAddress,
    toUAAddress,
    refundAddress,
    gasLimit,
  ) => {
    return await doEstimateFee(
      {
        fromChainId,
        toChainId,
        payload,
        fromUAAddress,
        toUAAddress,
        refundAddress,
        gasLimit,
      }, {
        portAddresses,
        ormpAddresses
      }
    );
  };

  return estimateFee;
};


export default buildEstimateFee;
