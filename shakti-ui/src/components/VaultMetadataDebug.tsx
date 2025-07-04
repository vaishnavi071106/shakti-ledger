'use client';

import { useVaultMetadata } from '@/hooks/useVaultMetadata';

export const VaultMetadataDebug = () => {
  const { vaultMetadata, getVaultStats, clearAllMetadata } = useVaultMetadata();
  const stats = getVaultStats();

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border rounded-lg shadow-lg text-xs max-w-xs">
      <h4 className="font-semibold mb-2">🗄️ Vault Database</h4>
      <div className="space-y-1 mb-3">
        <p><strong>Vaults:</strong> {stats.totalVaults}</p>
        <p><strong>Members:</strong> {stats.totalMembers}</p>
        {vaultMetadata.length > 0 && (
          <div>
            <p className="font-medium mt-2 mb-1">Recent Vaults:</p>
            {stats.recentVaults.map((vault, idx) => (
              <div key={vault.address} className="text-xs text-gray-600 truncate">
                {idx + 1}. {vault.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <button 
        onClick={clearAllMetadata}
        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 w-full"
      >
        Clear Database
      </button>
    </div>
  );
};
