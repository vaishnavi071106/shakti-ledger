'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useVaultData } from '@/hooks/useVaultData';
import { useVaultLoans } from '@/hooks/useVaultLoans';
import { useIsMounted } from '@/hooks/useIsMounted';
import { formatUnits } from 'viem';
import dynamic from 'next/dynamic';
import { NavigationBar } from '@/components/NavigationBar';

// Dynamically import ConnectButton to avoid SSR issues
const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => ({ default: mod.ConnectButton })),
  { ssr: false }
);

type LoanStatus = 'pending' | 'approved' | 'disbursed' | 'repaid';

type LoansPageProps = {
  params: Promise<{ id: `0x${string}` }>;
};

export default function LoansPage({ params }: LoansPageProps) {
  const { id: vaultAddress } = use(params);
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();
  const [selectedFilter, setSelectedFilter] = useState<'all' | LoanStatus>('all');
  
  // Get vault data for member information and approval threshold
  const { memberCount, isUserMember } = useVaultData(vaultAddress);
  
  // Get vault-specific loan data using the improved hook
  const { loans, loanStats, isPending: loansLoading } = useVaultLoans(vaultAddress, memberCount as bigint | undefined);

  // Calculate approval threshold (60% of members)
  const approvalThreshold = memberCount ? Math.ceil(Number(memberCount) * 0.6) : 2;

  // Filter loans based on selected filter
  const filteredLoans = selectedFilter === 'all' 
    ? loans 
    : loans.filter(loan => loan.status === selectedFilter);

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Loan Proposals...</h2>
          <p className="text-gray-600">Fetching proposals from blockchain</p>
        </div>
      </div>
    );
  }

  const isLoading = loansLoading;

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getStatusBadge = (status: LoanStatus) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      disbursed: 'bg-green-100 text-green-800',
      repaid: 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      pending: '⏳ Pending Approval',
      approved: '✅ Approved',
      disbursed: '💰 Disbursed',
      repaid: '✔️ Repaid',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Loan Proposals</h1>
              <p className="text-sm text-gray-500 font-mono">
                Vault: {formatAddress(vaultAddress)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ConnectButton />
              {isConnected && isUserMember !== undefined && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isUserMember 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isUserMember ? '✓ Vault Member' : '⚠ Not a Member'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {(['all', 'pending', 'approved', 'disbursed', 'repaid'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All Proposals' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter !== 'all' && (
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {loanStats[filter as LoanStatus]}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Total: {loanStats.total} proposals | 
            Showing: {filteredLoans.length} {selectedFilter === 'all' ? 'proposals' : selectedFilter}
          </div>
        </div>

        {/* Loan List */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Loading proposals...</h2>
            <p className="text-gray-600">Fetching loan data from blockchain</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {selectedFilter === 'all' ? 'No Loan Proposals' : `No ${selectedFilter} Proposals`}
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedFilter === 'all' 
                ? 'There are currently no loan proposals in this vault.'
                : `There are no ${selectedFilter} loan proposals at the moment.`
              }
            </p>
            {isUserMember && (
              <Link 
                href={`/vault/${vaultAddress}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Request New Loan
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLoans.map((loan) => (
              <div key={loan.id.toString()} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Loan #{loan.id.toString()}
                      </h3>
                      {getStatusBadge(loan.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Borrower:</span>
                        <p className="font-mono">{formatAddress(loan.borrower)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <p className="font-semibold">{formatUnits(loan.amount, 6)} USDC</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Approvals:</span>
                        <p className="font-medium">
                          {loan.approvals.toString()} / {approvalThreshold}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Repaid:</span>
                        <p className="font-medium">{formatUnits(loan.repaid, 6)} USDC</p>
                      </div>
                    </div>
                    
                    {/* Progress bar for approvals */}
                    {loan.status === 'pending' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Approval Progress</span>
                          <span>{Math.min((Number(loan.approvals) / approvalThreshold) * 100, 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((Number(loan.approvals) / approvalThreshold) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/vault/${vaultAddress}/loan/${loan.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                    
                    {isUserMember && loan.status === 'pending' && (
                      <Link 
                        href={`/vault/${vaultAddress}/loan/${loan.id}`}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Vote Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link 
            href={`/vault/${vaultAddress}`}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Back to Vault Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
