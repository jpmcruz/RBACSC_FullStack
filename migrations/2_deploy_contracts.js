var RBACSC = artifacts.require("./RBACSC.sol");

module.exports = function(deployer) {
  deployer.deploy(RBACSC, 'OU');
};
