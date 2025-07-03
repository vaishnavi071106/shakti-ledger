// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/ShaktiVault.sol";
import "../src/SHGFactory.sol";
import "../src/ZKVerifier.sol";
import "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract IntegrationTest is Test {
    SHGFactory public factory;
    ShaktiVault public vault;
    ZKVerifier public zkVerifier;
    ERC20Mock public stablecoin;

    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public user3 = makeAddr("user3");

    function setUp() public {
        // Deploy stablecoin
        stablecoin = new ERC20Mock();
        
        // Deploy factory
        factory = new SHGFactory(address(stablecoin));
        
        // Create vault through factory
        address[] memory initialMembers = new address[](3);
        initialMembers[0] = user1;
        initialMembers[1] = user2;
        initialMembers[2] = user3;
        
        factory.createVault(initialMembers);
        
        // Get deployed vault
        address[] memory deployedVaults = factory.getDeployedVaults();
        vault = ShaktiVault(deployedVaults[0]);
        
        // Get ZK verifier from vault
        zkVerifier = ZKVerifier(vault.getZKVerifierAddress());
        
        // Fund vault and users
        stablecoin.mint(address(vault), 10_000_000e18);
        stablecoin.mint(user1, 1_000_000e18);
        stablecoin.mint(user2, 1_000_000e18);
        stablecoin.mint(user3, 1_000_000e18);
    }

    function test_FactoryCreatesVaultWithZKVerifier() public view {
        // Verify vault is created correctly
        assertEq(vault.memberCount(), 3, "Vault should have 3 members");
        assertEq(address(vault.stablecoin()), address(stablecoin), "Vault should use correct stablecoin");
        
        // Verify ZK verifier is deployed
        address zkVerifierAddr = vault.getZKVerifierAddress();
        assertTrue(zkVerifierAddr != address(0), "ZK verifier should be deployed");
        assertEq(zkVerifierAddr, address(zkVerifier), "ZK verifier addresses should match");
    }

    function test_VaultIntegratesWithZKVerifier() public {
        // User1 requests a loan with ZK proof requirement
        vm.prank(user1);
        vault.requestLoanWithZKProof(500e18, 700);
        
        // Verify loan was created with ZK proof requirement
        ShaktiVault.Loan memory loan = vault.getLoanDetails(0);
        assertTrue(loan.requiresZKProof, "Loan should require ZK proof");
        assertEq(loan.minCreditScore, 700, "Loan should have correct min credit score");
        assertFalse(loan.zkProofVerified, "ZK proof should not be verified yet");
        
        // Try to approve loan without ZK proof should fail
        vm.prank(user2);
        vm.expectRevert(abi.encodeWithSelector(ShaktiVault.ZKProofNotVerified.selector, 0));
        vault.approveLoan(0);
    }

    function test_ZKVerifierStandaloneOperation() public {
        // Test that ZK verifier can handle invalid proofs
        uint[2] memory mockProofA = [uint(1), uint(2)];
        uint[2][2] memory mockProofB = [[uint(3), uint(4)], [uint(5), uint(6)]];
        uint[2] memory mockProofC = [uint(7), uint(8)];
        
        vm.expectRevert(ZKVerifier.InvalidProof.selector);
        zkVerifier.submitProof(mockProofA, mockProofB, mockProofC, 700);
    }

    function test_NormalLoanWorkflow() public {
        // Test normal loan workflow (without ZK proof)
        vm.prank(user1);
        vault.requestLoan(500e18);
        
        // Verify loan was created without ZK proof requirement
        ShaktiVault.Loan memory loan = vault.getLoanDetails(0);
        assertFalse(loan.requiresZKProof, "Loan should not require ZK proof");
        assertFalse(loan.zkProofVerified, "ZK proof should not be verified");
        
        // Approve loan (should work without ZK proof)
        vm.prank(user2);
        vault.approveLoan(0);
        
        vm.prank(user3);
        vault.approveLoan(0);
        
        // Verify loan was disbursed
        ShaktiVault.Loan memory finalLoan = vault.getLoanDetails(0);
        assertTrue(finalLoan.disbursed, "Loan should be disbursed");
        assertEq(stablecoin.balanceOf(user1), 1_000_500e18, "User1 should receive loan");
    }

    function test_ZKVerifierAddressConsistency() public view {
        // Verify that the ZK verifier address is consistent
        address zkAddr1 = vault.getZKVerifierAddress();
        address zkAddr2 = address(zkVerifier);
        address zkAddr3 = zkVerifier.getVerifierAddress();
        
        assertEq(zkAddr1, zkAddr2, "ZK verifier addresses should match");
        assertTrue(zkAddr3 != address(0), "Underlying verifier should exist");
    }
}
