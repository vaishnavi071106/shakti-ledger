'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the wallet-dependent content
const NavigationBarContent = dynamic(
  () => import('@/components/NavigationBarContent').then((mod) => ({ default: mod.NavigationBarContent })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center space-x-4">
        <div className="bg-gray-200 animate-pulse h-8 w-32 rounded"></div>
      </div>
    )
  }
);

// Dynamically import mobile navigation
const MobileNavigation = dynamic(
  () => import('@/components/MobileNavigation').then((mod) => ({ default: mod.MobileNavigation })),
  { 
    ssr: false,
    loading: () => null
  }
);

export const NavigationBar = () => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              🏛️ Shakti Ledger
            </Link>
          </div>

          {/* Navigation and Wallet Section - handled by NavigationBarContent */}
          <NavigationBarContent />
        </div>

        {/* Mobile Navigation Menu */}
        <MobileNavigation />
      </div>
    </nav>
  );
};
