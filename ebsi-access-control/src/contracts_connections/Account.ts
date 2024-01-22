import { METAMASK_ACCOUNT } from "../constants/Constants";
import useAlert from "../hooks/useAlert";
import useCustomErrorsAlert from "../hooks/useCustomErrorsAlert";
import { connect } from "../store/accessControlListStore";
import { store } from "../store/store";
import { contract } from "./ContractsConnections";

export const connectWallet = async () => {
  try {
    const { ethereum } = window;
    if (!ethereum || !window.ethereum.isMetaMask) return alert('Please install Metamask');

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    sessionStorage.setItem(METAMASK_ACCOUNT, accounts[0]);
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
        debugger
        useCustomErrorsAlert(JSON.stringify(event.returnValues.message), 'red');
      });
  }
};