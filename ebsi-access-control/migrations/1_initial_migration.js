const AccessControlList = artifacts.require('AccessControlList');

module.exports = async (deployer) => {
  await deployer.deploy(AccessControlList);
};