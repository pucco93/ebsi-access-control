import { web3 } from '../contracts_connections/ContractsConnections';
import { DateTime } from 'luxon';

export const fromBytes32ToString = (bytes32Arg: string) => {
  return web3.utils.hexToAscii(bytes32Arg).match(/[a-zA-Z0-9\s-_]*/gm)[0];
};

export const fromStringToBytes32 = (stringArg: string) => {
  return web3.utils.asciiToHex(stringArg).padEnd(66, "0");
};

export const _arrayBufferToBase64 = (arrayBuffer: any) => {
  const byteArray = new Uint8Array(arrayBuffer);
  let byteString = '';
  for (let i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i]);
  }
  const b64 = window.btoa(byteString);

  return b64;
};

export const addNewLines = (str: string) => {
  let finalString = '';
  while(str.length > 0) {
      finalString += str.substring(0, 64) + '\n';
      str = str.substring(64);
  }

  return finalString;
};

export const translateTimeFromSol = (date: string) => {
  if(Number(date) > 0) {
    const newDate = new Date(Number(`${date}000`));
    return newDate;
  }
  
  return new Date();
};

export const formatDate = (date: number) => {
  return DateTime.fromMillis(date).toLocaleString(DateTime.DATETIME_SHORT);
};