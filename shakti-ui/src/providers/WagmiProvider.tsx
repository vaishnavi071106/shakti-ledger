'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useIsMounted } from '@/hooks/useIsMounted';

// Get the WalletConnect Project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// 1. Configure wagmi with a valid project ID
const config = getDefaultConfig({
  appName: 'Shakti Ledger',
  projectId: projectId || '2f5a2875ac72b44e2a57eb534047d572', // Fallback for development
  chains: [sepolia],
  ssr: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduce retries for faster development
      retryDelay: 500,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// 2. Create the provider component
export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const isMounted = useIsMounted();

  // Don't render Web3 components until mounted on client
  if (!isMounted) {
    return (
      <div 
        suppressHydrationWarning 
        style={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-pink-400 animate-ping mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Initializing Shakti Ledger</h2>
          <p className="text-white/80">Connecting to Web3 infrastructure...</p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          initialChain={sepolia}
          showRecentTransactions={true}
          modalSize="compact"
          appInfo={{
            appName: 'Shakti Ledger',
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
