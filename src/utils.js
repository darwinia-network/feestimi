function toBytes32Hex(num) {
  // Convert the number to a hexadecimal string
  let hexString = num.toString(16);

  // Pad the string to a length of 64 characters
  let paddedHexString = hexString.padStart(64, '0');

  return paddedHexString;
}

export { toBytes32Hex };
