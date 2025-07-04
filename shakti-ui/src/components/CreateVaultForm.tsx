'use client';

import { useState, useEffect } from 'react';
import { useCreateVault } from '@/hooks/useCreateVault';
import { useAccount } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useVaultMetadata, extractVaultAddressFromLogs } from '@/hooks/useVaultMetadataBackend';
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  name: string;
  walletAddress: string;
}

export const CreateVaultForm = () => {
  const [vaultName, setVaultName] = useState('');
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: '', walletAddress: '' },
    { id: '2', name: '', walletAddress: '' },
    { id: '3', name: '', walletAddress: '' },
  ]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  
  const isMounted = useIsMounted();
  const { createVault, isPending, isConfirming, isConfirmed, error, hash, receipt, factoryAddress } = useCreateVault();
  const { address: connectedAddress, isConnected } = useAccount();
  const { addVaultMetadata, isCreating } = useVaultMetadata(connectedAddress);
  const router = useRouter();

  // Save vault metadata when creation is successful
  useEffect(() => {
    if (isConfirmed && hash && vaultName.trim() && connectedAddress) {
      const saveVaultMetadata = async () => {
        try {
          let vaultAddress: string;
          
          // Try to extract actual vault address from transaction receipt
          if (receipt && receipt.logs) {
            const extractedAddress = extractVaultAddressFromLogs(receipt.logs);
            vaultAddress = extractedAddress || `0x${hash.slice(2, 42)}`;
          } else {
            // Fallback to mock address based on hash
            vaultAddress = `0x${hash.slice(2, 42)}`;
          }
          
          const validMembers = members.filter(member => member.name.trim() && member.walletAddress.trim());
          const vaultMembers = validMembers.map(member => ({
            address: member.walletAddress.trim(),
            name: member.name.trim(),
          }));

          await addVaultMetadata({
            address: vaultAddress,
            name: vaultName.trim(),
            members: vaultMembers,
            createdAt: new Date().toISOString(),
            txHash: hash,
          });

          console.log('Vault metadata saved to backend:', {
            address: vaultAddress,
            name: vaultName.trim(),
            memberCount: vaultMembers.length,
            txHash: hash,
          });

          // Auto-redirect to the new vault after a short delay
          setRedirectCountdown(3);
          const countdownInterval = setInterval(() => {
            setRedirectCountdown(prev => {
              if (prev === null || prev <= 1) {
                clearInterval(countdownInterval);
                router.push(`/vault/${vaultAddress}`);
                return null;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(countdownInterval);
        } catch (error) {
          console.error('Error saving vault metadata to backend:', error);
          // Could show an error message to the user here
        }
      };

      saveVaultMetadata();
    }
  }, [isConfirmed, hash, receipt, vaultName, members, addVaultMetadata, router, connectedAddress]);

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New SHG Vault</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  const addMember = () => {
    const newId = (Math.max(...members.map(m => parseInt(m.id))) + 1).toString();
    setMembers([...members, { id: newId, name: '', walletAddress: '' }]);
  };

  const removeMember = (id: string) => {
    if (members.length > 3) {
      setMembers(members.filter(member => member.id !== id));
    }
  };

  const updateMember = (id: string, field: 'name' | 'walletAddress', value: string) => {
    setMembers(members.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // Validate vault name
    if (!vaultName.trim()) {
      errors.push('Vault name is required.');
    }

    // Filter out empty members
    const validMembers = members.filter(member => member.name.trim() || member.walletAddress.trim());
    
    if (validMembers.length < 3) {
      errors.push('You need at least 3 members to create a vault.');
    }

    const uniqueAddresses = new Set<string>();
    const uniqueNames = new Set<string>();

    validMembers.forEach((member, index) => {
      const memberNumber = index + 1;
      
      // Validate member name
      if (!member.name.trim()) {
        errors.push(`Member ${memberNumber}: Name is required.`);
      } else {
        const lowerName = member.name.trim().toLowerCase();
        if (uniqueNames.has(lowerName)) {
          errors.push(`Member ${memberNumber}: Duplicate name "${member.name}".`);
        } else {
          uniqueNames.add(lowerName);
        }
      }
      
      // Validate wallet address
      if (!member.walletAddress.trim()) {
        errors.push(`Member ${memberNumber}: Wallet address is required.`);
      } else {
        const trimmedAddr = member.walletAddress.trim().toLowerCase();
        
        // Check if it's a valid Ethereum address format
        if (!trimmedAddr.match(/^0x[a-fA-F0-9]{40}$/)) {
          errors.push(`Member ${memberNumber}: "${member.walletAddress}" is not a valid Ethereum address.`);
        } else {
          // Check for duplicate addresses
          if (uniqueAddresses.has(trimmedAddr)) {
            errors.push(`Member ${memberNumber}: Duplicate wallet address "${member.walletAddress}".`);
          } else {
            uniqueAddresses.add(trimmedAddr);
          }
        }
      }
    });

    // Check if connected wallet is included in the members list
    if (connectedAddress && !validMembers.some(member => 
      member.walletAddress.trim().toLowerCase() === connectedAddress.toLowerCase()
    )) {
      errors.push('Your connected wallet address must be included in the member list.');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationErrors([]);

    if (!isConnected) {
      setValidationErrors(['Please connect your wallet first.']);
      setIsValidating(false);
      return;
    }

    const errors = validateForm();

    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsValidating(false);
      return;
    }

    try {
      // Extract wallet addresses from valid members (excluding empty ones)
      const validMembers = members.filter(member => member.name.trim() && member.walletAddress.trim());
      const memberAddresses = validMembers.map(member => member.walletAddress.trim() as `0x${string}`);
      
      // Note: The smart contract only takes addresses, but we'll store the vault name 
      // and member names in the UI state for future enhancements
      createVault(memberAddresses);
    } catch (err) {
      setValidationErrors([err instanceof Error ? err.message : 'Unknown error occurred']);
    }
    
    setIsValidating(false);
  };

  const addCurrentWallet = () => {
    if (connectedAddress) {
      // Find first empty member slot or add new one
      const emptyMemberIndex = members.findIndex(member => !member.walletAddress.trim());
      
      if (emptyMemberIndex >= 0) {
        updateMember(members[emptyMemberIndex].id, 'walletAddress', connectedAddress);
        updateMember(members[emptyMemberIndex].id, 'name', 'Me');
      } else {
        // Check if address is already added
        const addressExists = members.some(member => 
          member.walletAddress.trim().toLowerCase() === connectedAddress.toLowerCase()
        );
        
        if (!addressExists) {
          const newId = (Math.max(...members.map(m => parseInt(m.id))) + 1).toString();
          setMembers([...members, { id: newId, name: 'Me', walletAddress: connectedAddress }]);
        }
      }
    }
  };

  const generateSampleData = () => {
    const sampleMembers: Member[] = [
      { id: '1', name: 'Alice Johnson', walletAddress: connectedAddress || '0x1234567890123456789012345678901234567890' },
      { id: '2', name: 'Bob Smith', walletAddress: '0x2345678901234567890123456789012345678901' },
      { id: '3', name: 'Carol Davis', walletAddress: '0x3456789012345678901234567890123456789012' }
    ];
    
    setVaultName('Community Savings Group');
    setMembers(sampleMembers);

    // Create realistic test vaults that would appear in vault discovery
    const testVaults = [
      {
        address: '0x7c0DB073feE1533B38cEEb00Cc0bb306D51aFb1b',
        name: 'Community Savings Group',
        members: [
          { address: connectedAddress || '0x1234567890123456789012345678901234567890', name: 'Alice Johnson' },
          { address: '0x2345678901234567890123456789012345678901', name: 'Bob Smith' },
          { address: '0x3456789012345678901234567890123456789012', name: 'Carol Davis' }
        ],
        createdAt: new Date().toISOString(),
        txHash: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd123456',
      },
      {
        address: '0x8B3192f5eebd8579568a2ed41e6fed7b7a12a134',
        name: 'Women Entrepreneurs Circle',
        members: [
          { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', name: 'Maria Garcia' },
          { address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30', name: 'Sarah Williams' },
          { address: '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C', name: 'Jennifer Brown' },
          { address: '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB', name: 'Emily Davis' },
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        txHash: '0xefgh5678901234efgh5678901234efgh5678901234efgh5678901234efgh567890',
      },
      {
        address: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be',
        name: 'Small Business Cooperative',
        members: [
          { address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', name: 'David Wilson' },
          { address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', name: 'Michael Johnson' },
          { address: '0xBcd4042DE499D14e55001CcbB24a551F3b954096', name: 'Robert Anderson' },
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        txHash: '0xijkl9012345678ijkl9012345678ijkl9012345678ijkl9012345678ijkl901234',
      }
    ];

    // Add all test vaults to the database
    testVaults.forEach(vault => {
      addVaultMetadata(vault);
    });

    console.log('Sample data generated:', testVaults.length, 'vaults added to database');
  };

  if (!factoryAddress || factoryAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="p-8 border border-red-300 rounded-lg max-w-md mx-auto bg-red-50">
        <h2 className="text-2xl font-bold mb-4 text-red-800">Configuration Required</h2>
        <p className="text-red-700 mb-4">
          The SHG Factory contract address is not configured. 
        </p>
        <p className="text-sm text-red-600">
          Please set <code className="bg-red-200 px-1 rounded">NEXT_PUBLIC_SHG_FACTORY_ADDRESS</code> in your environment variables after deploying the contracts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 border border-gray-300 rounded-lg max-w-4xl mx-auto bg-white shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Create a New SHG Vault</h2>
        <p className="text-gray-600">
          Create a decentralized treasury for your Self-Help Group. Each vault requires at least 3 members.
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Factory Contract Info:</h3>
        <p className="text-sm text-blue-700 font-mono break-all">
          {factoryAddress}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vault Name Input */}
        <div>
          <label htmlFor="vaultName" className="block text-sm font-medium text-gray-700 mb-2">
            Vault Name *
          </label>
          <input
            id="vaultName"
            type="text"
            value={vaultName}
            onChange={(e) => setVaultName(e.target.value)}
            placeholder="Enter a name for your SHG vault (e.g., Community Savings Group)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Give your vault a meaningful name that members can easily identify.
          </p>
        </div>

        {/* Members Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Vault Members * (minimum 3 required)
            </label>
            <div className="flex gap-2">
              {isConnected && (
                <button
                  type="button"
                  onClick={addCurrentWallet}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Add My Wallet
                </button>
              )}
              <button
                type="button"
                onClick={generateSampleData}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Use Sample Data
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={member.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Member {index + 1}</h4>
                  {members.length > 3 && (
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                      title="Remove member"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Member Name *
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                      placeholder="Enter member's name"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Wallet Address *
                    </label>
                    <input
                      type="text"
                      value={member.walletAddress}
                      onChange={(e) => updateMember(member.id, 'walletAddress', e.target.value)}
                      placeholder="0x1234567890123456789012345678901234567890"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Member Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={addMember}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Member
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Each member should provide their name and wallet address. All members will have equal voting rights in the vault.
          </p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Transaction Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Transaction Error:</h4>
            <p className="text-sm text-red-700">{error.message || 'An unknown error occurred'}</p>
          </div>
        )}

        {/* Success Message */}
        {isConfirmed && hash && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✅ Vault Created Successfully!</h4>
            <p className="text-sm text-green-700 mb-2">
              Your SHG vault "{vaultName}" has been deployed to the blockchain with {members.filter(m => m.name.trim() && m.walletAddress.trim()).length} members.
            </p>
            <p className="text-sm text-green-600 mb-2">
              🚀 Redirecting to your new vault in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
            </p>
            <p className="text-xs text-green-600 font-mono break-all">
              Transaction: {hash}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isConnected || isPending || isConfirming || isValidating || isCreating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {!isConnected ? 'Connect Wallet First' :
           isPending ? 'Check Wallet...' : 
           isConfirming ? 'Creating Vault...' : 
           isCreating ? 'Saving Vault Data...' :
           isValidating ? 'Validating...' : 
           'Create SHG Vault'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• A new vault contract will be deployed with your specified members</li>
          <li>• Each member will receive equal shares in the vault</li>
          <li>• Members can contribute funds and request loans</li>
          <li>• Loan approvals require 60% member consensus</li>
          <li>• The vault name and member names are stored for better organization</li>
        </ul>
      </div>
    </div>
  );
};
