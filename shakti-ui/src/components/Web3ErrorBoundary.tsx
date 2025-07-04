'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class Web3ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Web3 Error Boundary caught an error:', error, errorInfo);
    
    // Check if this is a WagmiProvider error specifically
    if (error.message?.includes('useConfig must be used within WagmiProvider')) {
      console.error('WagmiProvider context error - this page may not be properly wrapped');
    }
  }

  render() {
    if (this.state.hasError) {
      // Check if it's a WagmiProvider error
      const isWagmiError = this.state.error?.message?.includes('useConfig must be used within WagmiProvider');
      
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                {isWagmiError ? 'Configuration Error' : 'Connection Error'}
              </h2>
              <p className="text-gray-600 mb-4">
                {isWagmiError 
                  ? 'There was an issue with the Web3 configuration. This might be due to:'
                  : 'There was an issue connecting to the Web3 services. This might be due to:'
                }
              </p>
              <ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
                {isWagmiError ? (
                  <>
                    <li>• Missing WagmiProvider context</li>
                    <li>• Page not properly wrapped in providers</li>
                    <li>• Component initialization error</li>
                  </>
                ) : (
                  <>
                    <li>• Network connectivity issues</li>
                    <li>• WalletConnect service temporarily unavailable</li>
                    <li>• Browser blocking Web3 connections</li>
                  </>
                )}
              </ul>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default Web3ErrorBoundary;
