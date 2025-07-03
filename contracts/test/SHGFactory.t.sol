// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/SHGFactory.sol";
import "../src/ShaktiVault.sol";
import "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract SHGFactoryTest is Test {
    SHGFactory public factory;
    ERC20Mock public stablecoin;

    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public user3 = makeAddr("user3");

    function setUp() public {
        // Deploy a mock stablecoin
        stablecoin = new ERC20Mock();
        // Deploy the factory, linking it to the stablecoin
        factory = new SHGFactory(address(stablecoin));
    }

    function test_CreateAndConfigureVault() public {
        // 1. Prepare members for the new vault
        address[] memory initialMembers = new address[](3);
        initialMembers[0] = user1;
        initialMembers[1] = user2;
        initialMembers[2] = user3;

        // 2. Call the factory to create the vault
        factory.createVault(initialMembers);

        // 3. Verify the factory's state
        address[] memory deployed = factory.getDeployedVaults();
        assertEq(deployed.length, 1, "Factory should have one deployed vault");
        
        // 4. Verify the deployed vault's configuration
        address newVaultAddress = deployed[0];
        ShaktiVault newVault = ShaktiVault(newVaultAddress);

        assertEq(newVault.memberCount(), 3, "New vault has incorrect member count");
        assertEq(address(newVault.stablecoin()), address(stablecoin), "New vault has incorrect stablecoin address");
    }
}
