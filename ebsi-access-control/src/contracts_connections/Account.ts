import { METAMASK_ACCOUNT } from "../constants/Constants";
import useAlert from "../hooks/useAlert";
import useCustomErrorsAlert from "../hooks/useCustomErrorsAlert";
import usePermissionDeniedErrorsAlert from "../hooks/usePermissionDeniedError";
import { connect } from "../store/accessControlListStore";
import { store } from "../store/store";
import { contract } from "./ContractsConnections";

export const connectWallet = async () => {
  try {
    const { ethereum } = window;
    if (!ethereum || !window.ethereum.isMetaMask) return alert('Please install Metamask');

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    localStorage.setItem(METAMASK_ACCOUNT, accounts[0]);
    store.dispatch(connect(accounts[0]));

  } catch (error) {
    console.error(error);
    useAlert(JSON.stringify(error), 'red');
  }
};

export const listenForCustomErrors = () => {
  if (contract) {
    contract.events.CustomError()
      .on('data', (event: any) => {
        useCustomErrorsAlert(JSON.stringify(event.returnValues.message), 'red');
      });
  }
};

export const listenForPermissionError = () => {
  try {
    if (contract) {
      contract.events.PermissionDenied()
        .on('data', (event: any) => {
          usePermissionDeniedErrorsAlert(JSON.stringify(event.returnValues.message), 'red');
        })
    }
  } catch (error) {
    console.error(`Due to error: ${error}, permission denied listener has not been initialized.`);
  }
}