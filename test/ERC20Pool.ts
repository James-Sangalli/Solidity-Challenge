import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20Pool, ERC20Pool__factory, ERC20Token, ERC20Token__factory } from "../typechain-types";

describe("ERC20Pool core functions", function () {

  let team: SignerWithAddress;
  let userA: SignerWithAddress;
  let userB: SignerWithAddress;
  let erc20Pool: ERC20Pool;
  let erc20Token: ERC20Token;
  const mintAmount = BigInt("100000000000000000000");
  const approveAmount = BigInt("10000000000000000000000");

  beforeEach(async() => {
    [team, userA, userB] = await ethers.getSigners();

    erc20Token = await new ERC20Token__factory(team).deploy();
    erc20Pool = await new ERC20Pool__factory(team).deploy(team.address, erc20Token.address);

    await erc20Token.mint(userA.address, mintAmount);
    await erc20Token.mint(userB.address, mintAmount);
    await erc20Token.mint(team.address, mintAmount);
    await erc20Token.connect(userA).approve(erc20Pool.address, approveAmount);
    await erc20Token.connect(userB).approve(erc20Pool.address, approveAmount);
    await erc20Token.connect(team).approve(erc20Pool.address, approveAmount);
  });

  it("allows the user to deposit tokens", async() => {
    const preBalance = await erc20Token.balanceOf(userA.address);
    expect(preBalance).to.equal(mintAmount);
    const preBalanceContract = await erc20Token.balanceOf(erc20Pool.address);
    expect(preBalanceContract).to.equal("0");
    await erc20Pool.connect(userA).deposit(mintAmount);
    const postBalanceContract = await erc20Token.balanceOf(erc20Pool.address);
    expect(postBalanceContract).to.equal(mintAmount);
    const postBalance = await erc20Token.balanceOf(userA.address);
    expect(postBalance).to.equal(BigInt("0"));
  });

  it("allows the user to withdraw tokens", async() => {
    await erc20Pool.deposit(mintAmount);
    await erc20Pool.withdraw(mintAmount);
    const postBalance = await erc20Token.balanceOf(userA.address);
    expect(postBalance).to.equal(mintAmount);
  });

  it("allows the team to add reward tokens", async() => {
    await erc20Pool.connect(team).depositRewards(mintAmount);
  });

  it("won't allow other users to add rewards", async() => {
    const tx = erc20Pool.connect(userA).depositRewards(mintAmount);
    expect(tx).to.be.revertedWith("ERC20Pool: only the team can deposit rewards");
  });

  it("should only reward user(s) with a deposit at the time of the reward drop", async() => {
    await erc20Pool.connect(userA).deposit(mintAmount);
    await erc20Pool.connect(team).depositRewards(mintAmount);
    const userABalanceWithoutClaimingRewards = await erc20Pool.balances(userA.address);
    expect(userABalanceWithoutClaimingRewards).to.equal(mintAmount, "User a should be eligible for rewards but they have not claimed them");
    await erc20Pool.claimReward(userA.address);
    const userABalanceWithRewards = await erc20Pool.balances(userA.address);
    expect(userABalanceWithRewards).to.equal(BigInt("200000000000000000000"), "Should have received all the rewards");
    await erc20Pool.connect(userB).deposit(mintAmount);
    const userBBalanceWithoutRewards = await erc20Pool.balances(userB.address);
    expect(userBBalanceWithoutRewards).to.equal(mintAmount, "Should not have received any rewards");
    const invalidClaimTx = erc20Pool.claimReward(userB.address);
    expect(invalidClaimTx).to.be.revertedWith("ERC20Pool: user did not have a balance at the time of the reward");
  });

  it("should allow an eligible user to claim their rewards on deposit", async() => {
    await erc20Pool.connect(userA).deposit(mintAmount);
    await erc20Token.mint(userA.address, mintAmount);
    await erc20Pool.connect(team).depositRewards(mintAmount);
    await erc20Pool.connect(userA).deposit(mintAmount);
    const balance = await erc20Pool.balances(userA.address);
    expect(balance).to.be.equal(BigInt("300000000000000000000"), "User should be able to claim rewards on deposit");
  });

  it("should refund unclaimed rewards back to the team", async() => {
    await erc20Pool.connect(userA).deposit(mintAmount);
    await erc20Pool.connect(team).depositRewards(mintAmount);
    await erc20Token.mint(team.address, mintAmount);
    await erc20Pool.connect(team).depositRewards(mintAmount);
    const balance = await erc20Token.balanceOf(team.address);
    expect(balance).to.be.equal(mintAmount, "the team should get back their funds from the first drop");
  });

  it("should allow an eligible user to claim their rewards on withdraw", async() => {
    await erc20Pool.connect(userA).deposit(mintAmount);
    await erc20Pool.connect(team).depositRewards(mintAmount);
    await erc20Pool.connect(userA).withdraw(mintAmount);
    const balance = await erc20Pool.balances(userA.address);
    expect(balance).to.be.equal(mintAmount, "User should be able to claim rewards on withdraw");
  });

  it("should not allow the user to claim the reward more than once", async() => {
    await erc20Pool.connect(userA).deposit(mintAmount);
    await erc20Pool.connect(team).depositRewards(mintAmount);
    await erc20Pool.claimReward(userA.address);
    const tx = erc20Pool.claimReward(userA.address);
    expect(tx).to.be.revertedWith("ERC20Pool: user has already claimed the reward");
  })

});
