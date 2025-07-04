'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';

export const ConnectWallet = () => {
  const isMounted = useIsMounted();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  // Show loading state during SSR
  if (!isMounted) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Shakti Ledger</h2>
        <p className="text-gray-600">On-chain SHG treasury & micro-credit system</p>
        {process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID === 'YOUR_WALLETCONNECT_PROJECT_ID' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              🔧 <strong>Development Mode:</strong> Using MetaMask-only connection. 
              <br />
              For full wallet support, configure WalletConnect in .env.local
            </p>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <ConnectButton />
      </div>
      
      {isConnected && (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Wallet Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-mono text-sm text-gray-800">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Balance:</span>
              <span className="font-mono text-sm text-gray-800">
                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
