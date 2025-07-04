'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';

export const MobileNavigation = () => {
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();

  if (!isMounted || !isConnected) {
    return null;
  }

  return (
    <div className="md:hidden border-t border-gray-200 py-2">
      <div className="flex flex-wrap gap-2">
        <Link 
          href="/simulation"
          className="text-sm px-3 py-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          🧪 Create Vault Demo
        </Link>
        <Link 
          href="/vault-simulation"
          className="text-sm px-3 py-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          📊 Dashboard Demo
        </Link>
      </div>
    </div>
  );
};
