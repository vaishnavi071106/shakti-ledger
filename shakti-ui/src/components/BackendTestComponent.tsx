'use client';

import { useBackendVaults, useCreateBackendVault } from '@/hooks/useBackendApi';
import { useState } from 'react';

export const BackendTestComponent = () => {
  const { data: vaultsData, isLoading, error } = useBackendVaults();
  const createVaultMutation = useCreateBackendVault();
  
  const [testForm, setTestForm] = useState({
    contractAddress: '',
    name: '',
    creatorAddress: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testForm.contractAddress || !testForm.name || !testForm.creatorAddress) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await createVaultMutation.mutateAsync({
        contractAddress: testForm.contractAddress,
        name: testForm.name,
        creatorAddress: testForm.creatorAddress,
        network: 'sepolia',
        members: [
          { address: testForm.creatorAddress, name: 'Creator' },
          { address: '0x1234567890123456789012345678901234567890', name: 'Test Member' },
        ],
      });
      
      alert('Vault created successfully!');
      setTestForm({ contractAddress: '', name: '', creatorAddress: '' });
    } catch (error) {
      console.error('Error creating vault:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Backend API Test</h2>
      
      {/* Test Form */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Create Test Vault</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Address
            </label>
            <input
              type="text"
              value={testForm.contractAddress}
              onChange={(e) => setTestForm(prev => ({ ...prev, contractAddress: e.target.value }))}
              placeholder="0x1234..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vault Name
            </label>
            <input
              type="text"
              value={testForm.name}
              onChange={(e) => setTestForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Test Vault"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Creator Address
            </label>
            <input
              type="text"
              value={testForm.creatorAddress}
              onChange={(e) => setTestForm(prev => ({ ...prev, creatorAddress: e.target.value }))}
              placeholder="0x5678..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={createVaultMutation.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createVaultMutation.isPending ? 'Creating...' : 'Create Test Vault'}
          </button>
        </form>
      </div>

      {/* Vaults List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Existing Vaults</h3>
        
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading vaults...</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        )}
        
        {vaultsData && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Found {vaultsData.count} vault(s)
            </div>
            
            {vaultsData.data.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No vaults found. Create one above to test!
              </div>
            ) : (
              <div className="grid gap-4">
                {vaultsData.data.map((vault: any) => (
                  <div key={vault.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{vault.name}</h4>
                        <p className="text-sm text-gray-600">
                          Contract: {vault.contractAddress}
                        </p>
                        <p className="text-sm text-gray-600">
                          Creator: {vault.creatorAddress}
                        </p>
                        <p className="text-sm text-gray-600">
                          Network: {vault.network}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {vault._count.members} member(s)
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(vault.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {vault.members && vault.members.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Members:</p>
                        <div className="space-y-1">
                          {vault.members.map((member: any) => (
                            <div key={member.id} className="text-sm text-gray-600">
                              {member.displayName} ({member.walletAddress.slice(0, 6)}...{member.walletAddress.slice(-4)}) 
                              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                                {member.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
