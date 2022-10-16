// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import { IERC20Pool } from "./interfaces/IERC20Pool.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20Pool is IERC20Pool {

    address public team;
    IERC20 public token;
    // Note: this prevents users from claiming old rewards if a new reward drop is done
    uint public lastRewardTime;
    uint public lastRewardAmount;
    uint public lastTotalBalanceSnapshot;
    uint public claimed;

    mapping(address => uint) public balances;
    mapping(address => uint) public lastDeposit;
    mapping(address => mapping(uint => bool)) claims;

    constructor(address _team, address _token) {
        team = _team;
        token = IERC20(_token);
    }

    /*
    * @dev see IERC20Pool.sol
    */
    function deposit(uint amount) public returns(bool) {
        _claimRewardsIfEligible();
        require(token.transferFrom(msg.sender, address(this), amount), "ERC20Pool: transfer failed");
        balances[msg.sender] += amount;
        lastDeposit[msg.sender] = block.timestamp;
        emit Deposit(msg.sender, amount);

        return true;
    }

    /*
    * @dev see IERC20Pool.sol
    */
    function withdraw(uint amount) public returns(bool) {
        _claimRewardsIfEligible();
        require(token.transfer(msg.sender, amount), "ERC20Pool: transfer failed");
        balances[msg.sender] -= amount;
        emit Withdraw(msg.sender, amount);

        return true;
    }

    /*
    * @dev checks if the user is eligible for rewards on deposit/withdraw and does the claim if so
    */
    function _claimRewardsIfEligible() internal {
        if(
            lastRewardTime >= lastDeposit[msg.sender]
            && balances[msg.sender] > 0
            && !claims[msg.sender][lastRewardTime]
        ) {
            // allow the user to claim their rewards (as the timestamp will be updated)
            claimReward(msg.sender);
        }
    }

    /*
    * @dev see IERC20Pool.sol
    */
    function depositRewards(uint amount) public returns(bool) {
        require(msg.sender == team, "ERC20Pool: only the team can deposit rewards");
        if(lastRewardAmount > claimed) {
            // send back all the unclaimed tokens from the last reward drop
            token.transfer(team, lastRewardAmount - claimed);
        }
        lastTotalBalanceSnapshot = token.balanceOf(address(this));
        require(token.transferFrom(team, address(this), amount), "ERC20Pool: transfer failed");
        lastRewardAmount = amount;
        lastRewardTime = block.timestamp;
        claimed = 0;
        emit RewardDeposit(lastRewardTime, lastRewardAmount);

        return true;
    }

    /*
    * @dev see IERC20Pool.sol
    */
    function claimReward(address user) public returns(bool) {
        require(balances[user] != 0, "ERC20Pool: user does not have a balance");
        require(lastRewardTime >= lastDeposit[user] , "ERC20Pool: user did not have a balance at the time of the reward");
        require(!claims[user][lastRewardTime], "ERC20Pool: user has already claimed the reward");
        uint proportion = (lastRewardAmount * balances[user]) / lastTotalBalanceSnapshot;
        balances[user] += proportion;
        claims[user][lastRewardTime] = true;
        claimed += proportion;
        emit RewardClaim(user, proportion);

        return true;
    }

}
