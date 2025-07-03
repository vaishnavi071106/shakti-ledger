// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./verifier.sol";

/**
 * @title ZKVerifier
 * @notice A wrapper contract around the auto-generated Groth16 verifier
 * @dev This contract provides a user-friendly interface for credit score verification
 */
contract ZKVerifier {
    // --- State Variables ---
    Groth16Verifier public immutable verifier;
    
    // Mapping to track verified proofs to prevent replay attacks
    mapping(bytes32 => bool) public verifiedProofs;
    
    // --- Events ---
    event ProofSubmitted(
        address indexed user,
        uint256 indexed threshold,
        bytes32 indexed proofHash,
        bool verified
    );
    
    event CreditScoreVerified(
        address indexed user,
        uint256 indexed threshold,
        bytes32 indexed proofHash
    );
    
    // --- Errors ---
    error ProofAlreadyUsed(bytes32 proofHash);
    error InvalidProof();
    error InvalidThreshold();
    
    // --- Constructor ---
    constructor() {
        verifier = new Groth16Verifier();
    }
    
    /**
     * @notice Submit a ZK proof to verify credit score is above threshold
     * @param _pA First component of the proof
     * @param _pB Second component of the proof  
     * @param _pC Third component of the proof
     * @param _threshold The minimum credit score threshold (public input)
     * @dev The proof demonstrates that the user's private credit score >= _threshold
     * @dev Public inputs are [threshold], private inputs are [score]
     */
    function submitProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB, 
        uint[2] calldata _pC,
        uint256 _threshold
    ) external {
        // Validate threshold (assuming valid range 300-850 for credit scores)
        if (_threshold < 300 || _threshold > 850) {
            revert InvalidThreshold();
        }
        
        // Create public signals array - for our circuit, only threshold is public
        uint[1] memory pubSignals = [_threshold];
        
        // Generate proof hash to prevent replay attacks
        bytes32 proofHash = keccak256(abi.encodePacked(
            _pA[0], _pA[1],
            _pB[0][0], _pB[0][1], _pB[1][0], _pB[1][1],
            _pC[0], _pC[1],
            _threshold,
            msg.sender
        ));
        
        // Check if proof has already been used
        if (verifiedProofs[proofHash]) {
            revert ProofAlreadyUsed(proofHash);
        }
        
        // Verify the proof using the Groth16 verifier
        bool isValid = verifier.verifyProof(_pA, _pB, _pC, pubSignals);
        
        // Emit event for proof submission
        emit ProofSubmitted(msg.sender, _threshold, proofHash, isValid);
        
        if (!isValid) {
            revert InvalidProof();
        }
        
        // Mark proof as used
        verifiedProofs[proofHash] = true;
        
        // Emit success event
        emit CreditScoreVerified(msg.sender, _threshold, proofHash);
    }
    
    /**
     * @notice Check if a user has submitted a valid proof for a given threshold
     * @param _user The user's address
     * @param _threshold The credit score threshold
     * @param _pA First component of the proof
     * @param _pB Second component of the proof
     * @param _pC Third component of the proof
     * @return bool Whether the proof is valid and has been verified
     */
    function isProofVerified(
        address _user,
        uint256 _threshold,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC
    ) external view returns (bool) {
        bytes32 proofHash = keccak256(abi.encodePacked(
            _pA[0], _pA[1],
            _pB[0][0], _pB[0][1], _pB[1][0], _pB[1][1],
            _pC[0], _pC[1],
            _threshold,
            _user
        ));
        
        return verifiedProofs[proofHash];
    }
    
    /**
     * @notice Get the address of the underlying Groth16 verifier
     * @return address The verifier contract address
     */
    function getVerifierAddress() external view returns (address) {
        return address(verifier);
    }
}
