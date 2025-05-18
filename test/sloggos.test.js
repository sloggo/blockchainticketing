const { assert } = require("chai");
const Web3 = require("web3");
const hre = require("hardhat");

const web3 = new Web3(hre.network.provider);

describe("Sloggos", function () {
  let accounts;
  let sloggosContract;
  let sloggosInstance;
  
  const name = "Sloggos";
  const symbol = "SLOG";
  const decimals = 18;
  const initialSupply = 1000000;
  
  before(async function() {
    accounts = await web3.eth.getAccounts();
    
    const SloggosArtifact = await hre.artifacts.readArtifact("sloggos");
    sloggosContract = new web3.eth.Contract(SloggosArtifact.abi);
    
    const deployTx = sloggosContract.deploy({
      data: SloggosArtifact.bytecode,
      arguments: [name, symbol, decimals, initialSupply]
    });
    
    const gas = await deployTx.estimateGas();
    sloggosInstance = await deployTx.send({ 
      from: accounts[0],
      gas
    });
  });
  
  describe("Token basics", function() {
    it("should have correct name, symbol and decimals", async function() {
      const tokenName = await sloggosInstance.methods.name().call();
      const tokenSymbol = await sloggosInstance.methods.symbol().call();
      const tokenDecimals = await sloggosInstance.methods.decimals().call();
      
      assert.equal(tokenName, name);
      assert.equal(tokenSymbol, symbol);
      assert.equal(Number(tokenDecimals), decimals);
    });
    
    it("should assign initial supply to deployer", async function() {
      const deployerBalance = await sloggosInstance.methods.balanceOf(accounts[0]).call();
      const expectedSupply = web3.utils.toBN(initialSupply).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));
      
      assert.equal(deployerBalance.toString(), expectedSupply.toString());
    });
  });
  
  describe("ERC20 functionality", function() {
    it("should transfer tokens correctly", async function() {
      const amount = web3.utils.toBN(1000).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));
      
      await sloggosInstance.methods.transfer(accounts[1], amount).send({ from: accounts[0] });
      const recipientBalance = await sloggosInstance.methods.balanceOf(accounts[1]).call();
      
      assert.equal(recipientBalance.toString(), amount.toString());
    });
    
    it("should fail to transfer when sender has insufficient balance", async function() {
      const amount = web3.utils.toBN(10000000).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));
      
      try {
        await sloggosInstance.methods.transfer(accounts[0], amount).send({ from: accounts[1] });
        assert.fail("The transfer should have thrown an error");
      } catch (error) {
        assert.include(error.message, "transfer amount exceeds balance");
      }
    });
    
    it("should approve and allow transferFrom", async function() {
      const approveAmount = web3.utils.toBN(5000).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));
      const transferAmount = web3.utils.toBN(1000).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));
      
      await sloggosInstance.methods.approve(accounts[1], approveAmount).send({ from: accounts[0] });
      
      const allowance = await sloggosInstance.methods.allowance(accounts[0], accounts[1]).call();
      assert.equal(allowance.toString(), approveAmount.toString());
      
      await sloggosInstance.methods.transferFrom(accounts[0], accounts[2], transferAmount).send({ from: accounts[1] });
      
      const recipientBalance = await sloggosInstance.methods.balanceOf(accounts[2]).call();
      assert.equal(recipientBalance.toString(), transferAmount.toString());
      
      const newAllowance = await sloggosInstance.methods.allowance(accounts[0], accounts[1]).call();
      const expectedNewAllowance = web3.utils.toBN(approveAmount).sub(web3.utils.toBN(transferAmount));
      assert.equal(newAllowance.toString(), expectedNewAllowance.toString());
    });
  });
  
  describe("Buy functionality", function() {
    it("should allow users to buy tokens with ETH", async function() {
      const ethAmount = web3.utils.toWei('0.1', 'ether');
      const tokenPrice = web3.utils.toWei('0.00001', 'ether');
      const expectedTokens = web3.utils.toBN(ethAmount).div(web3.utils.toBN(tokenPrice))
        .mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));
      
      await sloggosInstance.methods.transfer(
        sloggosInstance.options.address, 
        expectedTokens.mul(web3.utils.toBN(2))
      ).send({ from: accounts[0] });
      
      const initialBalance = await sloggosInstance.methods.balanceOf(accounts[1]).call();
      
      await sloggosInstance.methods.buyToken().send({ from: accounts[1], value: ethAmount });
      
      const finalBalance = await sloggosInstance.methods.balanceOf(accounts[1]).call();
      const receivedTokens = web3.utils.toBN(finalBalance).sub(web3.utils.toBN(initialBalance));
      
      assert.equal(receivedTokens.toString(), expectedTokens.toString());
    });
    
    it("should revert when not enough ETH is sent", async function() {
      const tooLittleETH = web3.utils.toWei('0.000005', 'ether');
      
      try {
        await sloggosInstance.methods.buyToken().send({ from: accounts[1], value: tooLittleETH });
        assert.fail("The transaction should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Not enough ETH sent");
      }
    });
  });
});