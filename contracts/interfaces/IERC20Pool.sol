// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IERC20Pool {

    event Deposit(address indexed user, uint amount);
    event Withdraw(address indexed user, uint amount);
    event RewardDeposit(uint timestamp, uint amount);
    event RewardClaim(address indexed user, uint amount);

    /*
    * @dev allow the user to deposit ERC20 tokens into the pool
    * @dev this call will claim rewards if the user is eligible
    * @dev emits a Deposit event
    * @param amount - the amount of tokens the user wants to deposit
    * @returns - true if the deposit is successful
    */
    function deposit(uint amount) external returns(bool);
    /*
    * @dev allow the user to withdraw ERC20 tokens from the pool (their deposit plus rewards)
    * @dev this call will claim rewards if the user is eligible
    * @dev emits a Withdraw event
    * @param amount - the amount of tokens the user wants to withdraw
    * @returns - true if the withdraw is successful
    */
    function withdraw(uint amount) external returns(bool);
    /*
    * @dev allow the operator to deposit reward tokens
    * @dev emits a RewardDeposit event
    * @dev only the operator can deposit
    * @param amount - the amount of tokens the operator wants to deposit
    * @returns - true if the deposit is successful
    */
    function depositRewards(uint amount) external returns(bool);
    /*
    * @dev allow the user to claim the most recent reward (anyone can call)
    * @dev emits a RewardClaim event
    * @dev if the user does not claim the reward before the next reward gets deposited, they will not be eligible
    * @param user - the address of the user to claim rewards
    * @returns - true if the claim is successful
    */
    function claimReward(address user) external returns(bool);
}
