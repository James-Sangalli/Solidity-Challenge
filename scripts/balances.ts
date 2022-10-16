import { ethers } from "hardhat";
const erc20PoolAddress = "0x4A60c0bf93b2b3a3D20720a773E5Da8C80C427ac";
const erc20TokenAddress = "0xA6823eD28B212D40E310cCFCD5c77fd49C44BF73";

async function main() {

  const ERC20Token = await ethers.getContractFactory("ERC20Token");
  const erc20Token = await ERC20Token.attach(erc20TokenAddress);
  const contractBalance = await erc20Token.balanceOf(erc20PoolAddress);
  const contractBalanceEth = await ethers.provider.getBalance(erc20PoolAddress);

  console.log(`ERC20Pool token balance: ${contractBalance}`);
  console.log(`ERC20Pool eth balance: ${contractBalanceEth}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
