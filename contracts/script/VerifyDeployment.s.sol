// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/SHGFactory.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// MockUSDC contract for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**decimals()); // Mint 1M USDC to deployer
    }
    
    function decimals() public pure override returns (uint8) {
        return 6; // USDC has 6 decimals
    }
}

contract VerifyDeployment is Script {
    function run() external {
        // Contract addresses from deployment
        address shgFactoryAddress = 0x780AA5Ae2222C82F79c482D6f309936FA80D6277;
        address mockUSDCAddress = 0xeB165CaF13A24e5e00fB5779f64A81aD47Ce6d58;
        
        console.log("Verifying deployment on Sepolia...");
        console.log("SHGFactory address:", shgFactoryAddress);
        console.log("MockUSDC address:", mockUSDCAddress);
        
        // Check if contracts exist
        uint256 shgFactoryCodeSize;
        uint256 mockUSDCCodeSize;
        
        assembly {
            shgFactoryCodeSize := extcodesize(shgFactoryAddress)
            mockUSDCCodeSize := extcodesize(mockUSDCAddress)
        }
        
        console.log("SHGFactory code size:", shgFactoryCodeSize);
        console.log("MockUSDC code size:", mockUSDCCodeSize);
        
        if (shgFactoryCodeSize > 0) {
            console.log("[SUCCESS] SHGFactory contract deployed successfully");
            
            // Try to interact with SHGFactory
            SHGFactory factory = SHGFactory(shgFactoryAddress);
            try factory.stablecoin() returns (IERC20 stablecoinToken) {
                address stablecoinAddr = address(stablecoinToken);
                console.log("[SUCCESS] SHGFactory stablecoin address:", stablecoinAddr);
                if (stablecoinAddr == mockUSDCAddress) {
                    console.log("[SUCCESS] Stablecoin reference is correct");
                } else {
                    console.log("[ERROR] Stablecoin reference mismatch");
                }
            } catch {
                console.log("[ERROR] Failed to read stablecoin address from SHGFactory");
            }
        } else {
            console.log("[ERROR] SHGFactory contract not found");
        }
        
        if (mockUSDCCodeSize > 0) {
            console.log("[SUCCESS] MockUSDC contract deployed successfully");
            
            // Try to interact with MockUSDC
            MockUSDC usdc = MockUSDC(mockUSDCAddress);
            try usdc.name() returns (string memory name) {
                console.log("[SUCCESS] MockUSDC name:", name);
            } catch {
                console.log("[ERROR] Failed to read name from MockUSDC");
            }
        } else {
            console.log("[ERROR] MockUSDC contract not found");
        }
    }
}
