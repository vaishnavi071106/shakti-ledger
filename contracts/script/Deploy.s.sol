// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/SHGFactory.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC contract for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        // Mint 1M USDC to deployer for testing
        _mint(msg.sender, 1_000_000 * 10**6); // USDC has 6 decimals
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    // Allow anyone to mint for testing purposes
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract DeployScript is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying contracts to Sepolia testnet...");
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        // 1. Deploy Mock USDC for testing
        MockUSDC mockUSDC = new MockUSDC();
        console.log("Mock USDC deployed at:", address(mockUSDC));
        
        // 2. Deploy SHGFactory with the mock USDC address
        SHGFactory factory = new SHGFactory(address(mockUSDC));
        console.log("SHGFactory deployed at:", address(factory));
        
        // 3. Verify the deployment
        console.log("SHGFactory stablecoin:", address(factory.stablecoin()));
        console.log("Initial deployed vaults count:", factory.getDeployedVaults().length);
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("Mock USDC:", address(mockUSDC));
        console.log("SHGFactory:", address(factory));
        console.log("\nUpdate your .env.local file with:");
        console.log("NEXT_PUBLIC_SHG_FACTORY_ADDRESS=", address(factory));
        console.log("NEXT_PUBLIC_STABLECOIN_ADDRESS=", address(mockUSDC));
    }
}
