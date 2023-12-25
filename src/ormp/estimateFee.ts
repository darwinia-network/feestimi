import { IEstimateFee } from "../interfaces/IEstimateFee";
import { doEstimateFee } from "./doEstimateFee";
import { ormpLineAddresses, ormpAddresses } from "./addresses";

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
        ormpLineAddresses,
        ormpAddresses
      }
    );
  };

  return estimateFee;
};


export default buildEstimateFee;
