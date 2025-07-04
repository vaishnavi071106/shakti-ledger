'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';

interface Web3ProviderWrapperProps {
  children: ReactNode;
}

export default function Web3ProviderWrapper({ children }: Web3ProviderWrapperProps) {
  const isMounted = useIsMounted();
  const [Web3Provider, setWeb3Provider] = useState<React.ComponentType<{ children: ReactNode }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMounted) return;

    let isCancelled = false;

    const loadProvider = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Import the Web3Provider module
        const module = await import('@/providers/WagmiProvider');
        
        if (!isCancelled) {
          setWeb3Provider(() => module.Web3Provider);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load Web3Provider:', error);
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load Web3 provider');
          setIsLoading(false);
        }
      }
    };

    loadProvider();

    return () => {
      isCancelled = true;
    };
  }, [isMounted]);

  // Show loading state during SSR or while loading
  if (!isMounted || isLoading) {
    return (
      <div 
        suppressHydrationWarning 
        style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8fafc'
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{!isMounted ? 'Initializing...' : 'Loading Web3...'}</p>
        </div>
      </div>
    );
  }

  // Show error state if loading failed
  if (loadError || !Web3Provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Web3 Loading Error</h2>
          <p className="text-gray-600 mb-4">
            Failed to initialize Web3 services. This might be due to:
          </p>
          <ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
            <li>• Module loading failure</li>
            <li>• Network connectivity issues</li>
            <li>• Browser compatibility issues</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Retry Loading
          </button>
          {loadError && (
            <p className="text-xs text-red-500 mt-4">Error: {loadError}</p>
          )}
        </div>
      </div>
    );
  }

  // Render the children with the Web3Provider
  return <Web3Provider>{children}</Web3Provider>;
}
