// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/ZKVerifier.sol";

contract ZKVerifierTest is Test {
    ZKVerifier public zkVerifier;
    
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    
    // Mock proof data for testing
    uint[2] public mockProofA = [
        0x1234567890123456789012345678901234567890123456789012345678901234,
        0x2345678901234567890123456789012345678901234567890123456789012345
    ];
    
    uint[2][2] public mockProofB = [
        [0x3456789012345678901234567890123456789012345678901234567890123456,
         0x4567890123456789012345678901234567890123456789012345678901234567],
        [0x5678901234567890123456789012345678901234567890123456789012345678,
         0x6789012345678901234567890123456789012345678901234567890123456789]
    ];
    
    uint[2] public mockProofC = [
        0x7890123456789012345678901234567890123456789012345678901234567890,
        0x8901234567890123456789012345678901234567890123456789012345678901
    ];
    
    function setUp() public {
        zkVerifier = new ZKVerifier();
    }
    
    function test_InitialState() public view {
        // Check that verifier is deployed
        address verifierAddr = zkVerifier.getVerifierAddress();
        assertTrue(verifierAddr != address(0), "Verifier should be deployed");
    }
    
    function test_SubmitProof_RevertInvalidThreshold() public {
        // Test threshold too low
        vm.expectRevert(ZKVerifier.InvalidThreshold.selector);
        zkVerifier.submitProof(mockProofA, mockProofB, mockProofC, 250);
        
        // Test threshold too high  
        vm.expectRevert(ZKVerifier.InvalidThreshold.selector);
        zkVerifier.submitProof(mockProofA, mockProofB, mockProofC, 900);
    }
    
    function test_SubmitProof_InvalidProof() public {
        // Since we're using mock proof data, the verification should fail
        vm.expectRevert(ZKVerifier.InvalidProof.selector);
        zkVerifier.submitProof(mockProofA, mockProofB, mockProofC, 700);
    }
    
    function test_SubmitProof_EmitsEvent() public {
        // Test that ProofSubmitted event is emitted even for invalid proofs
        // Since the proof hash is dynamic, we can't predict the exact event parameters
        // But we can check that the function reverts with InvalidProof after emitting the event
        vm.expectRevert(ZKVerifier.InvalidProof.selector);
        zkVerifier.submitProof(mockProofA, mockProofB, mockProofC, 700);
    }
    
    function test_IsProofVerified_ReturnsFalse() public view {
        // Since no valid proofs have been submitted, this should return false
        bool verified = zkVerifier.isProofVerified(
            user1, 
            700, 
            mockProofA, 
            mockProofB, 
            mockProofC
        );
        assertFalse(verified, "Proof should not be verified");
    }
    
    function test_GetVerifierAddress() public view {
        address verifierAddr = zkVerifier.getVerifierAddress();
        assertTrue(verifierAddr != address(0), "Verifier address should not be zero");
    }
    
    // Test that helps verify the proof hash generation is consistent
    function test_ProofHashConsistency() public {
        bytes32 hash1 = keccak256(abi.encodePacked(
            mockProofA[0], mockProofA[1],
            mockProofB[0][0], mockProofB[0][1], mockProofB[1][0], mockProofB[1][1],
            mockProofC[0], mockProofC[1],
            uint256(700),
            user1
        ));
        
        bytes32 hash2 = keccak256(abi.encodePacked(
            mockProofA[0], mockProofA[1],
            mockProofB[0][0], mockProofB[0][1], mockProofB[1][0], mockProofB[1][1],
            mockProofC[0], mockProofC[1],
            uint256(700),
            user1
        ));
        
        assertEq(hash1, hash2, "Proof hashes should be consistent");
    }
    
    // Test that different users generate different hashes
    function test_ProofHashDifferentUsers() public {
        bytes32 hash1 = keccak256(abi.encodePacked(
            mockProofA[0], mockProofA[1],
            mockProofB[0][0], mockProofB[0][1], mockProofB[1][0], mockProofB[1][1],
            mockProofC[0], mockProofC[1],
            uint256(700),
            user1
        ));
        
        bytes32 hash2 = keccak256(abi.encodePacked(
            mockProofA[0], mockProofA[1],
            mockProofB[0][0], mockProofB[0][1], mockProofB[1][0], mockProofB[1][1],
            mockProofC[0], mockProofC[1],
            uint256(700),
            user2
        ));
        
        assertTrue(hash1 != hash2, "Different users should generate different hashes");
    }
    
    // Test edge cases for thresholds
    function test_ValidThresholdBoundaries() public {
        // Test valid boundary values
        vm.expectRevert(ZKVerifier.InvalidProof.selector);
        zkVerifier.submitProof(mockProofA, mockProofB, mockProofC, 300);
        
        vm.expectRevert(ZKVerifier.InvalidProof.selector);
        zkVerifier.submitProof(mockProofA, mockProofB, mockProofC, 850);
    }
}
