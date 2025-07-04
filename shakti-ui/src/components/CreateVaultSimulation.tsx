'use client';

import { useState } from 'react';

// Mock data for simulation
const mockSimulation = {
  contractAddress: '0x780AA5Ae2222C82F79c482D6f309936FA80D6277',
  stablecoinAddress: '0xeB165CaF13A24e5e00fB5779f64A81aD47Ce6d58',
  sampleMembers: [
    '0x1234567890123456789012345678901234567890',
    '0x2345678901234567890123456789012345678901', 
    '0x3456789012345678901234567890123456789012'
  ],
  mockTxHash: '0xe54b7932d87aae60d8565cc4f06cddd59f3c73d539f88c6ad0a6bb34b81b0105'
};

export const CreateVaultSimulation = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [membersStr, setMembersStr] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const simulationSteps = [
    {
      title: "Initial State",
      description: "Create Vault Wizard loaded with deployed contract configuration",
      status: "ready"
    },
    {
      title: "User Input",
      description: "User enters member addresses (minimum 3 required)",
      status: "pending"
    },
    {
      title: "Frontend Validation",
      description: "Validate addresses format, duplicates, and minimum count",
      status: "pending"
    },
    {
      title: "Wallet Connection Check",
      description: "Ensure user wallet is connected and on correct network",
      status: "pending"
    },
    {
      title: "Transaction Preparation", 
      description: "wagmi prepares createVault transaction with gas estimation",
      status: "pending"
    },
    {
      title: "User Confirmation",
      description: "MetaMask popup appears, user confirms transaction",
      status: "pending"
    },
    {
      title: "Transaction Submission",
      description: "Transaction sent to Sepolia mempool",
      status: "pending"
    },
    {
      title: "Blockchain Confirmation",
      description: "Transaction mined and confirmed on Sepolia",
      status: "pending"
    },
    {
      title: "Success State",
      description: "New vault deployed, UI shows success with transaction hash",
      status: "pending"
    }
  ];

  const validateAddresses = (addressList: string[]): string[] => {
    const errors: string[] = [];
    const uniqueAddresses = new Set<string>();

    if (addressList.length < 3) {
      errors.push('You need at least 3 members to create a vault.');
    }

    addressList.forEach((addr, index) => {
      const trimmedAddr = addr.trim().toLowerCase();
      
      if (!trimmedAddr.match(/^0x[a-fA-F0-9]{40}$/)) {
        errors.push(`Address ${index + 1} is not a valid Ethereum address: ${addr}`);
      }
      
      if (uniqueAddresses.has(trimmedAddr)) {
        errors.push(`Duplicate address found: ${addr}`);
      } else {
        uniqueAddresses.add(trimmedAddr);
      }
    });

    return errors;
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    
    // Step through each phase with delays to simulate real flow
    for (let i = 0; i <= simulationSteps.length - 1; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setIsSimulating(false);
  };

  const populateSampleData = () => {
    setMembersStr(mockSimulation.sampleMembers.join(', '));
  };

  const membersList = membersStr.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0);
  const validationErrors = membersStr ? validateAddresses(membersList) : [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Vault Wizard - Simulation Mode
        </h1>
        <p className="text-gray-600">
          Testing the complete flow without requiring wallet connection
        </p>
      </div>

      {/* Contract Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Deployed Contract Info:</h3>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">SHGFactory:</span> <code className="text-blue-700">{mockSimulation.contractAddress}</code></p>
          <p><span className="font-medium">MockUSDC:</span> <code className="text-blue-700">{mockSimulation.stablecoinAddress}</code></p>
          <p><span className="font-medium">Network:</span> <span className="text-blue-700">Sepolia Testnet</span></p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Member Addresses Input</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Member Wallet Addresses (minimum 3)
                </label>
                <textarea
                  value={membersStr}
                  onChange={(e) => setMembersStr(e.target.value)}
                  placeholder="0x1234..., 0x5678..., 0x9abc..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono"
                  rows={4}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={populateSampleData}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Use Sample Addresses
                  </button>
                </div>
              </div>

              {/* Validation Display */}
              {membersStr && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Validation Results:</h4>
                  {validationErrors.length === 0 ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-700 text-sm">✅ All validations passed!</p>
                      <p className="text-green-600 text-xs mt-1">
                        Found {membersList.length} valid unique addresses
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 text-sm font-medium">❌ Validation errors:</p>
                      <ul className="text-red-600 text-xs mt-1 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Simulation Controls */}
              <div className="flex gap-2">
                <button
                  onClick={runSimulation}
                  disabled={validationErrors.length > 0 || !membersStr || isSimulating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg"
                >
                  {isSimulating ? 'Running Simulation...' : 'Simulate Create Vault'}
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Simulation Progress */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Simulation Progress</h2>
            
            <div className="space-y-3">
              {simulationSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      isActive 
                        ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-300' 
                        : isCompleted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive 
                          ? 'bg-blue-500 text-white animate-pulse' 
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          isActive ? 'text-blue-800' : isCompleted ? 'text-green-800' : 'text-gray-600'
                        }`}>
                          {step.title}
                        </h4>
                        <p className={`text-sm ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Success State */}
            {currentStep >= simulationSteps.length - 1 && !isSimulating && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🎉 Simulation Complete!</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>New Vault Address:</strong> <code>0xB0a099500562dDf6D2aace6Fcc5d219D8a288B97A</code></p>
                  <p><strong>Transaction Hash:</strong> <code>{mockSimulation.mockTxHash}</code></p>
                  <p><strong>Members:</strong> {membersList.length} addresses configured</p>
                  <p><strong>Status:</strong> Ready for contributions and loan requests</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Simulation Notes</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• This simulation demonstrates the complete Create Vault Wizard flow</li>
          <li>• All contract addresses are real and deployed on Sepolia testnet</li>
          <li>• Validation logic matches exactly what the frontend implements</li>
          <li>• Transaction states simulate real wagmi/RainbowKit behavior</li>
          <li>• Ready for testing with actual wallets when available</li>
        </ul>
      </div>
    </div>
  );
};
