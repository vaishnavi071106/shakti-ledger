// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./ShaktiVault.sol";

contract SHGFactory {
    // --- State Variables ---
    address[] public deployedVaults;
    IERC20 public immutable stablecoin;

    // --- Events ---
    event VaultCreated(
        address indexed vaultAddress,
        address indexed creator,
        address[] initialMembers,
        uint256 vaultId,
        address zkVerifier
    );

    // --- Errors ---
    error ZeroAddressNotAllowed();

    constructor(address _stablecoin) {
        if (_stablecoin == address(0)) revert ZeroAddressNotAllowed();
        stablecoin = IERC20(_stablecoin);
    }

    function createVault(address[] memory _initialMembers) external {
        // Create a new ShaktiVault instance
        ShaktiVault newVault = new ShaktiVault(_initialMembers, address(stablecoin));
        
        // Store the address of the newly created vault
        deployedVaults.push(address(newVault));

        // Emit an event with the new vault's details
        emit VaultCreated(
            address(newVault),
            msg.sender,
            _initialMembers,
            deployedVaults.length - 1,
            newVault.getZKVerifierAddress()
        );
    }

    function getDeployedVaults() external view returns (address[] memory) {
        return deployedVaults;
    }
}
