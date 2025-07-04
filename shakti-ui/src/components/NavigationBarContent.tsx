'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';
import dynamic from 'next/dynamic';

// Dynamically import ConnectButton to avoid SSR issues
const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => ({ default: mod.ConnectButton })),
  { ssr: false }
);

export const NavigationBarContent = () => {
  const isMounted = useIsMounted();
  const { isConnected, address } = useAccount();

  if (!isMounted) {
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-gray-200 animate-pulse h-8 w-32 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-8">
      {/* Navigation Links - Only show when wallet is connected */}
      {isConnected && (
        <div className="hidden md:flex space-x-6">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            Home
          </Link>
          <Link 
            href="/backend-test" 
            className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
          >
            🚀 Backend Test
          </Link>
          <Link 
            href="/simulation" 
            className="text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            🧪 Create Vault Demo
          </Link>
          <Link 
            href="/vault-simulation" 
            className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
          >
            📊 Dashboard Demo
          </Link>
        </div>
      )}

      {/* Wallet Section */}
      <div className="flex items-center space-x-4">
        {isConnected && address && (
          <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-mono text-blue-700">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </span>
          </div>
        )}
        <ConnectButton />
      </div>
    </div>
  );
};
