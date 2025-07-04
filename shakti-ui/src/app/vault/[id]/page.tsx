'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useVaultData } from '@/hooks/useVaultData';
import { useVaultLoans } from '@/hooks/useVaultLoans';
import { useVaultMembers } from '@/hooks/useVaultMembers';
import { useVaultMetadata } from '@/hooks/useVaultMetadataBackend';
import { useBackendVault } from '@/hooks/useBackendApi';
import { useAccount, useBalance } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';
import { RequestLoanSheet } from '@/components/RequestLoanSheet';
import dynamic from 'next/dynamic';
import { NavigationBar } from '@/components/NavigationBar';

// Dynamically import components to avoid SSR issues
const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => ({ default: mod.ConnectButton })),
  { ssr: false }
);

type VaultPageProps = {
  params: Promise<{ id: `0x${string}` }>;
};

export default function VaultPage({ params }: VaultPageProps) {
  const { id: vaultId } = use(params);
  const [showRequestLoanSheet, setShowRequestLoanSheet] = useState(false);
  const isMounted = useIsMounted();
  const { isConnected, address: connectedAddress } = useAccount();
  const { memberCount, stablecoinAddress, totalSupply, isUserMember, userBalance, isPending, error, refetch: refetchVaultData } = useVaultData(vaultId);
  
  // Get vault-specific loan data
  const { loans, loanStats, isPending: loansLoading } = useVaultLoans(vaultId, memberCount as bigint | undefined);
  
  // Get vault members and metadata
  const { memberAddresses, isPending: membersPending } = useVaultMembers(vaultId);
  const { getVaultName, getMemberName } = useVaultMetadata();
  
  // Get vault details from backend
  const { data: backendVaultData, isLoading: backendVaultLoading } = useBackendVault(vaultId);
  
  // Get stablecoin balance
  const { data: stablecoinBalance } = useBalance({
    address: vaultId,
    token: stablecoinAddress as `0x${string}` | undefined,
  });

  // Periodic refresh to keep vault data up-to-date
  useEffect(() => {
    if (!isMounted) return;
    
    const interval = setInterval(() => {
      refetchVaultData();
    }, 30000); // Refresh every 30 seconds for vault data
    
    return () => clearInterval(interval);
  }, [isMounted, refetchVaultData]);

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Vault Dashboard...</h2>
          <p className="text-gray-600">Fetching vault information from blockchain</p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading vault data...</h2>
          <p className="text-gray-600">Fetching information from Sepolia testnet</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Vault</h2>
          <p className="text-gray-600 mb-4">
            Unable to load vault data. This could be due to:
          </p>
          <ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
            <li>• Invalid vault address</li>
            <li>• Vault doesn&apos;t exist on this network</li>
            <li>• Network connectivity issues</li>
            <li>• Contract interaction failed</li>
          </ul>
          <p className="text-xs text-red-600 font-mono bg-red-50 p-2 rounded">
            {error.message || 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatBalance = (balance: bigint | string | number | undefined, decimals: number = 6) => {
    if (!balance) return '0';
    const balanceAsBigInt = typeof balance === 'bigint' ? balance : BigInt(balance.toString());
    return (Number(balanceAsBigInt) / Math.pow(10, decimals)).toFixed(2);
  };

  // Get vault name from backend data or fallback to metadata hook
  const getDisplayVaultName = () => {
    if (backendVaultData?.success && backendVaultData?.data?.name) {
      return backendVaultData.data.name;
    }
    return getVaultName(vaultId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getDisplayVaultName()}</h1>
              <p className="text-sm text-gray-500 font-mono">
                Vault: {formatAddress(vaultId)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Full address: {vaultId}
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

        {/* Vault Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">👥 Members</h3>
            <p className="text-3xl font-bold text-blue-600">{memberCount?.toString() || '0'}</p>
            <p className="text-sm text-gray-500 mt-1">Active vault members</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 Vault Balance</h3>
            <p className="text-3xl font-bold text-green-600">
              {stablecoinBalance ? formatBalance(stablecoinBalance.value, 6) : '0'} USDC
            </p>
            <p className="text-sm text-gray-500 mt-1">Total funds in vault</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🪙 Total Shares</h3>
            <p className="text-3xl font-bold text-purple-600">
              {totalSupply ? formatBalance(totalSupply, 18) : '0'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total vault shares issued</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📊 Your Shares</h3>
            <p className="text-3xl font-bold text-orange-600">
              {isConnected && userBalance !== undefined ? formatBalance(userBalance, 18) : '--'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isConnected ? 'Your vault ownership' : 'Connect wallet to view'}
            </p>
          </div>
        </div>

        {/* Action Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Member Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">💼 Member Actions</h2>
            
            {!isConnected ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">Connect your wallet to interact with the vault</p>
                <ConnectButton />
              </div>
            ) : !isUserMember ? (
              <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 mb-2">⚠ You are not a member of this vault</p>
                <p className="text-sm text-yellow-600">
                  Only vault members can contribute funds and request loans
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                  💵 Contribute Funds
                </button>
                <button 
                  onClick={() => setShowRequestLoanSheet(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  🏦 Request Loan
                </button>
                <Link 
                  href={`/vault/${vaultId}/loans`}
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
                >
                  🗳️ View All Proposals
                </Link>
              </div>
            )}
          </div>

          {/* Vault Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ℹ️ Vault Information</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Stablecoin Contract:</span>
                <span className="font-mono text-sm text-gray-800">
                  {stablecoinAddress ? formatAddress(stablecoinAddress.toString()) : 'Loading...'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Network:</span>
                <span className="text-gray-800">Sepolia Testnet</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Governance Threshold:</span>
                <span className="text-gray-800">60% approval required</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Vault Type:</span>
                <span className="text-gray-800">Self-Help Group Treasury</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🔗 Quick Links</h4>
              <div className="space-y-2 text-sm">
                <a 
                  href={`https://sepolia.etherscan.io/address/${vaultId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  📊 View on Etherscan
                </a>
                <a 
                  href={`https://sepolia.etherscan.io/address/${stablecoinAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  🪙 View Stablecoin Contract
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Vault Members</h2>
          
          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
            <strong>Debug:</strong> 
            <br/>VaultId: "{vaultId}" (type: {typeof vaultId})
            <br/>Backend Loading: {backendVaultLoading ? 'Yes' : 'No'} | 
            Has Data: {backendVaultData ? 'Yes' : 'No'} | 
            Success: {backendVaultData?.success ? 'Yes' : 'No'} | 
            Members: {backendVaultData?.data?.members?.length || 0}
            <br/>
            <button 
              onClick={async () => {
                try {
                  console.log('Testing direct API call to:', `http://localhost:3004/api/vaults/${vaultId}`);
                  const response = await fetch(`http://localhost:3004/api/vaults/${vaultId}`);
                  const data = await response.json();
                  console.log('Direct API response:', data);
                  alert('Direct API call successful! Check console for details.');
                } catch (error) {
                  console.error('Direct API call failed:', error);
                  alert('Direct API call failed! Check console for details.');
                }
              }}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              Test Direct API Call
            </button>
            {backendVaultData && (
              <details className="mt-2">
                <summary>Raw Backend Data</summary>
                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(backendVaultData, null, 2)}
                </pre>
              </details>
            )}
          </div>
          
          {backendVaultLoading || membersPending ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-gray-600">Loading member information...</p>
            </div>
          ) : backendVaultData?.data?.members && backendVaultData.data.members.length > 0 ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                <strong className="text-green-800">✅ Showing Backend Member Data ({backendVaultData.data.members.length} members)</strong>
              </div>
              {backendVaultData.data.members.map((member: any, index: number) => {
                const isCurrentUser = isConnected && member.walletAddress.toLowerCase() === connectedAddress?.toLowerCase();
                const isCreator = member.role === 'creator';
                
                return (
                  <div key={member.walletAddress} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCreator ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <span className={`font-semibold ${
                          isCreator ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {member.displayName ? member.displayName.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">
                            {member.displayName || `Member ${index + 1}`}
                          </h4>
                          {isCurrentUser && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">You</span>
                          )}
                          {isCreator && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Creator</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-mono">{formatAddress(member.walletAddress)}</p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Member #{index + 1}</p>
                      <p className="text-xs text-gray-400">
                        {member.role === 'creator' ? 'Vault Creator' : 'Equal voting rights'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : memberAddresses.length > 0 ? (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Showing blockchain member addresses. Backend member names not available for this vault.
                </p>
              </div>
              {memberAddresses.map((address, index) => {
                const memberName = getMemberName(vaultId, address);
                const isCurrentUser = isConnected && address.toLowerCase() === connectedAddress?.toLowerCase();
                
                return (
                  <div key={address} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{memberName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">{memberName}</h4>
                          {isCurrentUser && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">You</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-mono">{formatAddress(address)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Member #{index + 1}</p>
                      <p className="text-xs text-gray-400">Equal voting rights</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No member information available</p>
              <p className="text-sm text-gray-500 mt-1">Member data is loading from the blockchain</p>
            </div>
          )}
        </div>

        {/* Loan Proposals Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">💰 Recent Loan Proposals</h2>
            <Link 
              href={`/vault/${vaultId}/loans`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
          
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-600 mb-4">
              {loanStats.total > 0 
                ? `This vault has ${loanStats.total} loan proposal${loanStats.total === 1 ? '' : 's'}`
                : 'No loan proposals yet in this vault'
              }
            </p>
            
            {loanStats.total > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-6">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{loanStats.pending}</div>
                  <div className="text-xs text-yellow-700">Pending</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{loanStats.approved}</div>
                  <div className="text-xs text-blue-700">Approved</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{loanStats.disbursed}</div>
                  <div className="text-xs text-green-700">Disbursed</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-600">{loanStats.repaid}</div>
                  <div className="text-xs text-gray-700">Repaid</div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="text-gray-400 text-sm">
                  This vault doesn&apos;t have any loan proposals yet.
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {loanStats.total > 0 && (
                <Link 
                  href={`/vault/${vaultId}/loans`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  📋 View All Proposals ({loanStats.total})
                </Link>
              )}
              {isUserMember && (
                <button 
                  onClick={() => setShowRequestLoanSheet(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  💰 {loanStats.total === 0 ? 'Create First Loan Request' : 'Request New Loan'}
                </button>
              )}
            </div>
            
            {loansLoading && (
              <p className="text-xs text-gray-500 mt-4">
                Loading loan data from blockchain...
              </p>
            )}
          </div>
          
          {/* Recent Loan Proposals Preview */}
          {loans.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Recent Proposals</h3>
              <div className="space-y-2">
                {loans.slice(0, 3).map((loan) => (
                  <Link
                    key={loan.id.toString()}
                    href={`/vault/${vaultId}/loan/${loan.id}`}
                    className="block p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-800">
                          Loan #{loan.id.toString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          loan.status === 'disbursed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {(Number(loan.amount) / 1000000).toFixed(2)} USDC
                      </div>
                    </div>
                  </Link>
                ))}
                {loans.length > 3 && (
                  <div className="text-center">
                    <Link
                      href={`/vault/${vaultId}/loans`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View {loans.length - 3} more proposals →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
      
      {/* Request Loan Sheet */}
      {showRequestLoanSheet && (
        <RequestLoanSheet
          vaultAddress={vaultId}
          onClose={() => setShowRequestLoanSheet(false)}
        />
      )}
    </div>
  );
};