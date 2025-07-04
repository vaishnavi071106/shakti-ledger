'use client';

import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';

// Dynamically import Web3 components to avoid SSR issues
const ConnectWallet = dynamic(
  () => import('@/components/ConnectWallet').then((mod) => ({ default: mod.ConnectWallet })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Shakti Ledger</h2>
          <p className="text-gray-600">On-chain SHG treasury & micro-credit system</p>
        </div>
        <div className="mb-6">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Loading wallet...
          </div>
        </div>
      </div>
    ),
  }
);

const CreateVaultForm = dynamic(
  () => import('@/components/CreateVaultForm').then((mod) => ({ default: mod.CreateVaultForm })),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New SHG Vault</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    ),
  }
);

const VaultDiscovery = dynamic(
  () => import('@/components/VaultDiscovery').then((mod) => ({ default: mod.VaultDiscovery })),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Existing Vaults</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading vaults...</p>
        </div>
      </div>
    ),
  }
);

const VaultMetadataDebug = dynamic(
  () => import('@/components/VaultMetadataDebug').then((mod) => ({ default: mod.VaultMetadataDebug })),
  { ssr: false }
);

export const HomeContent = () => {
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Shakti Ledger...</h2>
          <p className="text-gray-600">Initializing blockchain connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Always show wallet connection */}
      <ConnectWallet />
      
      {/* Only show vault functionality when wallet is connected */}
      {isConnected ? (
        <>
          <CreateVaultForm />
          <VaultDiscovery />
          <VaultMetadataDebug />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-2xl mx-auto p-8 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">
              Wallet Connection Required
            </h2>
            <p className="text-yellow-700 mb-6">
              To create new SHG vaults or access existing vaults, please connect your Web3 wallet. 
              This ensures secure blockchain interactions and proper identity verification.
            </p>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">What you can do after connecting:</h3>
              <ul className="text-left text-yellow-700 space-y-1">
                <li>• 🏛️ Create new Self-Help Group vaults</li>
                <li>• 🔍 Discover and join existing vaults</li>
                <li>• 💰 Request and manage loans within your groups</li>
                <li>• 🗳️ Vote on loan proposals from other members</li>
                <li>• 📊 Track vault statistics and your contributions</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug component for testing */}
      <VaultMetadataDebug />
    </div>
  );
};
