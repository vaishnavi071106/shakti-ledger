'use client';

import { ReactNode } from 'react';
import Web3ErrorBoundary from './Web3ErrorBoundary';
import Web3ProviderWrapper from './Web3ProviderWrapper';

interface ClientWrapperProps {
  children: ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <Web3ErrorBoundary>
      <Web3ProviderWrapper>{children}</Web3ProviderWrapper>
    </Web3ErrorBoundary>
  );
}
