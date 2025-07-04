'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { shaktiVaultAbi } from '@/abi/shaktiVault';
import { useApproveLoan } from '@/hooks/useApproveLoan';
import { useVaultData } from '@/hooks/useVaultData';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useVoteStatus, useRecordVote, useLoanSummary } from '@/hooks/useBackendApi';
import { formatUnits } from 'viem';
import dynamic from 'next/dynamic';
import { NavigationBar } from '@/components/NavigationBar';
import { RepayLoan } from '@/components/RepayLoan';
import Web3ConnectionStatus from '@/components/Web3ConnectionStatus';

// Dynamically import ConnectButton to avoid SSR issues
const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => ({ default: mod.ConnectButton })),
  { ssr: false }
);

type LoanProposalPageProps = {
  params: Promise<{
    id: `0x${string}`;
    loanId: string;
  }>;
};

export default function LoanProposalPage({ params }: LoanProposalPageProps) {
  const { id: vaultAddress, loanId: loanIdStr } = use(params);
  const loanId = BigInt(loanIdStr);
  const isMounted = useIsMounted();
  const { isConnected, address: connectedAddress } = useAccount();
  
  // Backend voting hooks
  const proposalId = `${vaultAddress}_${loanIdStr}`;
  const { data: voteStatus, isLoading: voteStatusLoading } = useVoteStatus(proposalId, connectedAddress || '');
  const { mutateAsync: recordVote } = useRecordVote();
  
  // Get loan summary with repayment data from backend
  const { data: loanSummary, refetch: refetchLoanSummary } = useLoanSummary(proposalId);
  
  // Get vault data for member information
  const { memberCount, isUserMember: userMembershipStatus, stablecoinAddress } = useVaultData(vaultAddress);
  const isUserMember = Boolean(userMembershipStatus);
  
  // Get loan details
  const { data: loan, isLoading, error: readError, refetch: refetchLoan } = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [loanId],
  });

  const { approveLoan, isPending, isConfirming, isConfirmed, error: writeError } = useApproveLoan();

  // Auto-refresh loan data when approval transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      // Record vote in backend
      if (connectedAddress) {
        recordVote({
          proposalId,
          voteData: {
            voterAddress: connectedAddress,
            voteType: 'approve',
            txHash: undefined, // You might want to get the transaction hash from the approveLoan hook
          }
        }).catch(error => {
          console.error('Error recording vote in backend:', error);
          // Vote recording failure shouldn't block the UI, as the blockchain state is the source of truth
        });
      }
      
      // Refetch loan data after a successful approval
      const timer = setTimeout(() => {
        refetchLoan();
      }, 1000); // Wait 1 second to allow blockchain state to update
      
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, refetchLoan, connectedAddress, proposalId, recordVote]);

  // Periodic refresh to keep data up-to-date
  useEffect(() => {
    if (!isMounted) return;
    
    const interval = setInterval(() => {
      refetchLoan();
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(interval);
  }, [isMounted, refetchLoan]);

  // Calculate approval threshold (60% of members)
  const approvalThreshold = memberCount ? Math.ceil(Number(memberCount) * 0.6) : 2;

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Loan Proposal...</h2>
          <p className="text-gray-600">Fetching details from blockchain</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading loan details...</h2>
          <p className="text-gray-600">Fetching information from Sepolia testnet</p>
        </div>
      </div>
    );
  }

  if (readError || !loan?.exists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Loan Not Found</h2>
          <p className="text-gray-600 mb-4">
            Unable to load loan proposal. This could be due to:
          </p>
          <ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
            <li>• Invalid loan ID</li>
            <li>• Loan doesn&apos;t exist in this vault</li>
            <li>• Network connectivity issues</li>
            <li>• Contract interaction failed</li>
          </ul>
          <div className="flex gap-3 justify-center">
            <Link 
              href={`/vault/${vaultAddress}/loans`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              ← View All Proposals
            </Link>
            <Link 
              href={`/vault/${vaultAddress}`}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ← Back to Vault
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    approveLoan(vaultAddress, loanId);
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const isApprovalComplete = Number(loan.approvals) >= approvalThreshold;
  const progressPercentage = Math.min((Number(loan.approvals) / approvalThreshold) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                💰 Loan Proposal #{loanId.toString()}
              </h1>
              <p className="text-sm text-gray-500">
                Requested by: {formatAddress(loan.borrower)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Vault: {formatAddress(vaultAddress)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Web3ConnectionStatus 
                showMembershipStatus={true}
                isUserMember={isUserMember}
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loan Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">📋 Loan Details</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">💵 Requested Amount</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatUnits(loan.amount, 6)} USDC
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">🏦 Repayment Status</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Repaid:</span>
                  <span className="font-medium">{formatUnits(loan.repaid, 6)} USDC</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Outstanding:</span>
                  <span className="font-medium text-red-600">
                    {formatUnits(loan.amount - loan.repaid, 6)} USDC
                  </span>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                loan.disbursed ? 'bg-green-50' : 'bg-orange-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-2 ${
                  loan.disbursed ? 'text-green-800' : 'text-orange-800'
                }`}>
                  📤 Disbursement Status
                </h3>
                <p className={`font-medium ${
                  loan.disbursed ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {loan.disbursed ? '✅ Funds Disbursed' : '⏳ Pending Approval'}
                </p>
                {!loan.disbursed && (
                  <p className="text-sm text-orange-600 mt-1">
                    Funds will be automatically transferred once approved
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Approval Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">🗳️ Member Approval</h2>
            
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Approval Progress
                  {isConfirming && (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                      <span className="text-xs text-blue-600">Updating...</span>
                    </div>
                  )}
                </span>
                <span className="text-sm text-gray-500">
                  {loan.approvals.toString()} / {approvalThreshold} votes
                </span>
              </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isApprovalComplete ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {approvalThreshold} approvals needed (60% of {memberCount?.toString() || '?'} members)
                  {voteStatus?.hasVoted && connectedAddress && (
                    <span className="block text-green-600 font-medium mt-1">
                      ✓ You have voted on this proposal
                    </span>
                  )}
                </p>
              </div>

              {/* Status Badge */}
              <div className={`p-4 rounded-lg text-center ${
                isApprovalComplete 
                  ? 'bg-green-50 border border-green-200' 
                  : voteStatus?.hasVoted && connectedAddress
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className={`text-2xl mb-2 ${
                  isApprovalComplete 
                    ? 'text-green-600' 
                    : voteStatus?.hasVoted && connectedAddress
                      ? 'text-blue-600'
                      : 'text-yellow-600'
                }`}>
                  {isApprovalComplete ? '✅' : voteStatus?.hasVoted && connectedAddress ? '🗳️' : '⏳'}
                </div>
                <h3 className={`font-semibold ${
                  isApprovalComplete 
                    ? 'text-green-800' 
                    : voteStatus?.hasVoted && connectedAddress
                      ? 'text-blue-800'
                      : 'text-yellow-800'
                }`}>
                  {isApprovalComplete 
                    ? 'Approval Complete!' 
                    : voteStatus?.hasVoted && connectedAddress
                      ? 'You Have Voted'
                      : 'Awaiting Approval'
                  }
                </h3>
                <p className={`text-sm mt-1 ${
                  isApprovalComplete 
                    ? 'text-green-600' 
                    : voteStatus?.hasVoted && connectedAddress
                      ? 'text-blue-600'
                      : 'text-yellow-600'
                }`}>
                  {isApprovalComplete 
                    ? 'This loan has received sufficient approvals'
                    : voteStatus?.hasVoted && connectedAddress
                      ? 'Your vote has been recorded. Waiting for other members.'
                      : `${approvalThreshold - Number(loan.approvals)} more approval(s) needed`
                  }
                </p>
              </div>

              {/* Action Button */}
              {!isConnected ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Connect your wallet to vote on this proposal</p>
                  <ConnectButton />
                </div>
              ) : !isUserMember ? (
                <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 mb-2">⚠ You are not a member of this vault</p>
                  <p className="text-sm text-yellow-600">
                    Only vault members can vote on loan proposals
                  </p>
                </div>
              ) : loan.disbursed ? (
                <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 mb-2">✅ Loan Already Disbursed</p>
                  <p className="text-sm text-green-600">
                    This loan has been approved and funds have been transferred
                  </p>
                </div>
              ) : voteStatus?.hasVoted ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 mb-2">✅ You Have Already Voted</p>
                  <p className="text-sm text-gray-600">
                    Your approval has been submitted for this loan proposal
                  </p>
                  <div className="mt-4">
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed border-2 border-gray-300"
                    >
                      ✓ Vote Already Cast
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleApprove}
                    disabled={isPending || isConfirming || isConfirmed}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending 
                      ? '📱 Check Wallet...' 
                      : isConfirming 
                        ? '⏳ Submitting Vote...' 
                        : isConfirmed
                          ? '✅ Vote Submitted!'
                          : '👍 Approve This Loan'
                    }
                  </button>
                  
                  {isConfirmed && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-1">Vote Submitted Successfully!</h4>
                      <p className="text-sm text-green-600">
                        Your approval has been recorded on the blockchain.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {writeError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-1">Transaction Failed</h4>
                  <p className="text-sm text-red-600">
                    {writeError.message || 'An unknown error occurred'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Loan Repayment Section - Only show for borrower if loan is disbursed */}
          {isConnected && connectedAddress && loan && 
           loan.borrower.toLowerCase() === connectedAddress.toLowerCase() && 
           loan.disbursed && 
           stablecoinAddress && (
            <RepayLoan
              vaultAddress={vaultAddress}
              stablecoinAddress={stablecoinAddress as `0x${string}`}
              loanId={loanId}
              loanAmount={loan.amount}
              repaidAmount={loan.repaid}
              onRepaymentSuccess={() => {
                refetchLoan();
                refetchLoanSummary();
              }}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link 
            href={`/vault/${vaultAddress}/loans`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ← All Proposals
          </Link>
          <Link 
            href={`/vault/${vaultAddress}`}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Vault Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}