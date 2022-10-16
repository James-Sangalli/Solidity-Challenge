import { ethers } from "hardhat";

async function main() {

  // const ERC20Token = await ethers.getContractFactory("ERC20Token");
  // const erc20Token = await ERC20Token.deploy();
  const erc20TokenAddress = "0xA6823eD28B212D40E310cCFCD5c77fd49C44BF73";
  const ERC20Pool = await ethers.getContractFactory("ERC20Pool");
  const erc20Pool = await ERC20Pool.deploy("0x42ea529282DDE0AA87B42d9E83316eb23FE62c3f", erc20TokenAddress);

  await erc20Pool.deployed();

  console.log(`ERC20Pool deployed to ${erc20Pool.address} & ERC20Token deployed to ${erc20TokenAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
