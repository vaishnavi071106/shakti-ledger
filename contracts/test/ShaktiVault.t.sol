// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/ShaktiVault.sol";
import "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract ShaktiVaultTest is Test {
    ShaktiVault public vault;
    ERC20Mock public stablecoin;

    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public user3 = makeAddr("user3");
    address public nonMember = makeAddr("nonMember");

    function setUp() public {
        // 1. Deploy a ready-to-mint ERC20 mock
        stablecoin = new ERC20Mock();

        // 2. Deploy the vault with the three members
        address[] memory initial = new address[](3);
        initial[0] = user1;
        initial[1] = user2;
        initial[2] = user3;

        vault = new ShaktiVault(initial, address(stablecoin));
        
        // 3. Mint stablecoin to the vault for loan disbursements
        stablecoin.mint(address(vault), 10_000_000e18); // Mint 10M stablecoin to vault
        
        // 4. Mint stablecoin to each user for later repay tests
        stablecoin.mint(user1, 1_000_000e18); // Mint 1M stablecoin
        stablecoin.mint(user2, 1_000_000e18);
        stablecoin.mint(user3, 1_000_000e18);
    }

    function test_InitialMemberShares() public view {
        uint256 expected = 1000 * 10**vault.decimals();
        assertEq(vault.balanceOf(user1), expected, "user1 share mismatch");
        assertEq(vault.balanceOf(user2), expected, "user2 share mismatch");
        assertEq(vault.balanceOf(user3), expected, "user3 share mismatch");
        assertEq(vault.memberCount(), 3, "memberCount mismatch");
    }

    function test_RequestAndApproveLoan_Disburses() public {
        // 1. User1 requests a loan of 500 stablecoins
        uint256 loanAmount = 500e18;
        vm.prank(user1);
        vault.requestLoan(loanAmount);

        // Check that the loan was created with correct details
        ShaktiVault.Loan memory loan = vault.getLoanDetails(0);
        assertEq(loan.borrower, user1, "Borrower should be user1");
        assertEq(loan.amount, loanAmount, "Loan amount is incorrect");
        assertFalse(loan.disbursed, "Loan should not be disbursed yet");

        // 2. User2 approves the loan (1 approval - not enough yet)
        vm.prank(user2);
        vault.approveLoan(0);

        // Check that it's not disbursed yet
        ShaktiVault.Loan memory partialLoan = vault.getLoanDetails(0);
        assertFalse(partialLoan.disbursed, "Loan should not be disbursed yet with only 1 approval");

        // 3. User3 approves the loan. This meets the 60% threshold (2/3 members = 66.67%)
        vm.prank(user3);
        vault.approveLoan(0);

        // 4. Check that the loan is now disbursed and funds are transferred
        ShaktiVault.Loan memory finalLoan = vault.getLoanDetails(0);
        assertTrue(finalLoan.disbursed, "Loan should be disbursed");
        assertEq(stablecoin.balanceOf(user1), 1_000_500e18, "User1 stablecoin balance should increase");
    }

    function test_RepayLoan() public {
        // --- Setup: A loan is requested and disbursed ---
        uint256 loanAmount = 500e18;

        vm.prank(user1);
        vault.requestLoan(loanAmount);
        
        // Need 2 approvals to meet 60% threshold (2/3 = 66.67%)
        vm.prank(user2);
        vault.approveLoan(0);
        
        vm.prank(user3);
        vault.approveLoan(0); // Loan is disbursed here

        // --- Test: Borrower (user1) repays the loan ---
        
        // 1. Borrower must first approve the vault to spend their stablecoin
        vm.prank(user1);
        stablecoin.approve(address(vault), loanAmount);

        // 2. Borrower calls the repay function
        uint256 initialVaultBalance = stablecoin.balanceOf(address(vault));
        vm.prank(user1);
        vault.repay(0, loanAmount);

        // --- Assertions ---
        ShaktiVault.Loan memory loan = vault.getLoanDetails(0);
        assertEq(loan.repaid, loan.amount, "Loan should be fully repaid");
        assertEq(stablecoin.balanceOf(address(vault)), initialVaultBalance + loanAmount, "Vault balance should increase after repayment");
    }
}