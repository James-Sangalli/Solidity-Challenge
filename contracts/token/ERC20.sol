pragma solidity ^0.8.9;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor() ERC20("Sample USD", "SUSD") {}

    function mint(address to, uint amount) public {
        _mint(to, amount);
    }

    function _mint(address account, uint256 amount) internal override {
        ERC20._mint(account, amount);
    }
}