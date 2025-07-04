'use client';

import { useAccount, useConnect } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';
import dynamic from 'next/dynamic';

// Dynamically import ConnectButton to avoid SSR issues
const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => ({ default: mod.ConnectButton })),
  { ssr: false }
);

interface Web3ConnectionStatusProps {
  requireConnection?: boolean;
  showMembershipStatus?: boolean;
  isUserMember?: boolean;
  children?: React.ReactNode;
}

export default function Web3ConnectionStatus({ 
  requireConnection = false,
  showMembershipStatus = false,
  isUserMember,
  children 
}: Web3ConnectionStatusProps) {
  const isMounted = useIsMounted();
  const { isConnected, isConnecting } = useAccount();

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Checking connection...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <ConnectButton />
      
      {isConnected && showMembershipStatus && isUserMember !== undefined && (
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isUserMember 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isUserMember ? '✓ Vault Member' : '⚠ Not a Member'}
        </div>
      )}
      
      {children}
    </div>
  );
}
