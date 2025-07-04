'use client';

import { useDeployedVaults } from '@/hooks/useDeployedVaults';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useVaultMetadata } from '@/hooks/useVaultMetadataBackend';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export const VaultDiscovery = () => {
  const isMounted = useIsMounted();
  const { address: connectedAddress } = useAccount();
  const { vaults, isPending, error, factoryAddress } = useDeployedVaults();
  const { getVaultName, getVaultMembers, vaultMetadata, isLoaded } = useVaultMetadata();

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Existing Vaults</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading vaults...</p>
        </div>
      </div>
    );
  }

  if (!factoryAddress || factoryAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-yellow-800">⚠ Configuration Required</h2>
        <p className="text-yellow-700">
          Factory contract address not configured. Deploy contracts first.
        </p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Existing Vaults</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deployed vaults...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-red-800">Error Loading Vaults</h2>
        <p className="text-red-700 mb-2">Unable to fetch deployed vaults from factory.</p>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🏦 Existing Vaults</h2>
        <p className="text-gray-600">
          Browse and access deployed SHG vaults on the network
        </p>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Factory Contract:</h3>
        <p className="text-sm text-blue-700 font-mono break-all">{factoryAddress}</p>
      </div>

      {vaults.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Vaults Deployed Yet</h3>
          <p className="text-gray-600 mb-4">
            Be the first to create a vault for your Self-Help Group!
          </p>
          <p className="text-sm text-gray-500">
            Use the Create Vault form above to deploy your first SHG treasury.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Deployed Vaults ({vaults.length})</h3>
            <span className="text-sm text-gray-500">Click to view dashboard</span>
          </div>
          
          <div className="space-y-3">
            {vaults.map((vaultAddress, index) => {
              const vaultName = getVaultName(vaultAddress);
              const members = getVaultMembers(vaultAddress);
              
              return (
                <Link
                  key={vaultAddress}
                  href={`/vault/${vaultAddress}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-800 group-hover:text-blue-800">
                          {vaultName}
                        </h4>
                        {members.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {members.length} member{members.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-mono">
                        {formatAddress(vaultAddress)}
                      </p>
                      {members.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Members:</p>
                          <div className="flex flex-wrap gap-1">
                            {members.slice(0, 3).map((member, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {member.name}
                              </span>
                            ))}
                            {members.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                +{members.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-blue-600 group-hover:text-blue-800 ml-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Full address: {vaultAddress}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">🎉 Vaults Ready!</h4>
            <p className="text-sm text-green-700">
              {vaults.length} vault{vaults.length !== 1 ? 's' : ''} successfully deployed and ready for member interactions.
              Click any vault above to view its dashboard and start managing funds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
