const TronWeb = require('tronweb');

function tronAddressToHex(address) {
    return "0x" + TronWeb.address.toHex(address);
}

export { tronAddressToHex };
