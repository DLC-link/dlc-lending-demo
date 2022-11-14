export const truncateAddress = (address) => {
    if (!address) return "No Account";
    const match = address.match(
      /^(0x[a-zA-Z0-9]{2})[a-zA-Z0-9]+([a-zA-Z0-9]{2})$/
    );
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
  };

  export const easyTruncateAddress = (address) => {
    return address.substring(0, 4) + "..." + address.substring(address.length-4, address.length)
  }
  
  export const toHex = (num) => {
    const val = Number(num);
    return "0x" + val.toString(16);
  };

  export function customShiftValue(value, shift, unshift) {
    return unshift ? value / (10 ** shift) : value * (10 ** shift);
  }

  export function fixedTwoDecimalShift(value) {
    return customShiftValue(value, 2, true).toFixed(2);
  }