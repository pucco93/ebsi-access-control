import Web3 from 'web3';
import AccessControlList from '../../build/contracts/AccessControlList.json';

const getNetworkAddress = async () => {
    const networkId = await web3.eth.net.getId();
    const networkData = AccessControlList.networks[networkId];

    if (networkData) {
        return networkData.address;
    }
    return "";
};

const { ethereum } = window;
window.web3 = new Web3(ethereum);
window.web3 = new Web3(window.web3.currentProvider);
export const web3 = window.web3;

export const contract = new web3.eth.Contract(AccessControlList.abi, await getNetworkAddress());