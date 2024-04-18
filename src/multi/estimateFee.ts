// import { IEstimateFee } from "../interfaces/IEstimateFee";

// // https://github.com/darwinia-network/darwinia-Port/blob/main/src/ports/MultiPort.sol#L40
// const buildEstimateFee = () => {
//   const estimateFee: IEstimateFee = async (
//     fromChainId,
//     toChainId,
//     message,
//     fromUAAddress,
//     toUAAddress,
//     refundAddress,
//     gasLimit,
//   ) => {
//     throw new Error('Not implemented');
//   };

//   return estimateFee;
// };

// export default buildEstimateFee;
import * as R from 'ramda'

type OrmpParams = {
  gasLimit?: number;
  refundAddress: string;
};

type LzParams = {
  gasLimit: string;
};

type MultiParams = {};

type Port = 'ormp' | 'lz' | 'multi';
type PortParams<T extends Port> =
  T extends 'ormp' ? OrmpParams : T extends 'lz' ? LzParams : MultiParams;

const estimateFee = R.curry(
  <T extends Port>(
    port: T,
    params: PortParams<T>,
    fromChainId: number,
    toChainId: number,
    fromAddress: string,
    toAddress: string,
    message: string,
  ) => {
    console.log(port, params);
  }
);

const estimateFeeThroughOrmp = estimateFee('ormp', { refundAddress: '0x123456789' });

// const estimateFeeThroughMulti = estimateFeeThrough('multi', {});

estimateFeeThroughOrmp(1, 2, '0x123456789', '0x987654321', 'Hello world!',)
