const AccessControlList = artifacts.require('AccessControlList');

module.exports = async (deployer) => {
  // const accounts = await web3.eth.getAccounts();
  await deployer.deploy(AccessControlList);
};