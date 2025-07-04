'use client';

import { useState, useEffect } from 'react';
import { useRepayLoan } from '@/hooks/useRepayLoan';
import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { mockUsdcAbi } from '@/abi/mockUsdc';

interface RepayLoanProps {
  vaultAddress: `0x${string}`;
  stablecoinAddress: `0x${string}`;
  loanId: bigint;
  loanAmount: bigint;
  repaidAmount: bigint;
  onRepaymentSuccess?: () => void;
}

export const RepayLoan = ({ 
  vaultAddress, 
  stablecoinAddress, 
  loanId, 
  loanAmount, 
  repaidAmount,
  onRepaymentSuccess 
}: RepayLoanProps) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'approve' | 'repay' | 'success'>('input');
  const { address } = useAccount();
  
  const { repayLoan, isPending: isRepayPending, isConfirming: isRepayConfirming, isConfirmed: isRepayConfirmed, error: repayError } = useRepayLoan();
  const { writeContract: approveSpend, isPending: isApprovePending } = useWriteContract();

  // Check user's USDC balance
  const { data: userBalance } = useReadContract({
    address: stablecoinAddress,
    abi: mockUsdcAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Check current allowance
  const { data: allowance } = useReadContract({
    address: stablecoinAddress,
    abi: mockUsdcAbi,
    functionName: 'allowance',
    args: address ? [address, vaultAddress] : undefined,
  });

  const remainingAmount = loanAmount - repaidAmount;
  const userBalanceFormatted = userBalance ? formatUnits(userBalance, 6) : '0';
  const remainingFormatted = formatUnits(remainingAmount, 6);
  const repaidFormatted = formatUnits(repaidAmount, 6);
  const totalFormatted = formatUnits(loanAmount, 6);
  
  const amountBigInt = amount ? parseUnits(amount, 6) : 0n;
  const hasEnoughBalance = userBalance && amountBigInt <= userBalance;
  const hasEnoughAllowance = allowance && amountBigInt <= allowance;
  const isValidAmount = amountBigInt > 0n && amountBigInt <= remainingAmount;

  useEffect(() => {
    if (isRepayConfirmed) {
      setStep('success');
      onRepaymentSuccess?.();
    }
  }, [isRepayConfirmed, onRepaymentSuccess]);

  const handleApprove = () => {
    if (!isValidAmount) return;
    
    approveSpend({
      address: stablecoinAddress,
      abi: mockUsdcAbi,
      functionName: 'approve',
      args: [vaultAddress, amountBigInt],
    });
    setStep('approve');
  };

  const handleRepay = () => {
    if (!isValidAmount || !hasEnoughAllowance) return;
    
    repayLoan(vaultAddress, loanId, amountBigInt);
    setStep('repay');
  };

  const handleMaxAmount = () => {
    const maxRepayable = userBalance && userBalance < remainingAmount ? userBalance : remainingAmount;
    if (maxRepayable) {
      setAmount(formatUnits(maxRepayable, 6));
    }
  };

  const getStepStatus = (stepName: string) => {
    switch (stepName) {
      case 'approve':
        return hasEnoughAllowance ? 'complete' : step === 'approve' ? 'active' : 'pending';
      case 'repay':
        return step === 'success' ? 'complete' : step === 'repay' ? 'active' : 'pending';
      default:
        return 'pending';
    }
  };

  if (remainingAmount <= 0n) {
    return (
      <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-lg">✓</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Loan Fully Repaid</h3>
            <p className="text-green-600">This loan has been completely repaid. Total: {totalFormatted} USDC</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">💰 Repay Loan</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Loan:</span>
              <p className="font-semibold text-gray-800">{totalFormatted} USDC</p>
            </div>
            <div>
              <span className="text-gray-600">Already Repaid:</span>
              <p className="font-semibold text-green-600">{repaidFormatted} USDC</p>
            </div>
            <div>
              <span className="text-gray-600">Remaining:</span>
              <p className="font-semibold text-red-600">{remainingFormatted} USDC</p>
            </div>
            <div>
              <span className="text-gray-600">Your Balance:</span>
              <p className="font-semibold text-blue-600">{userBalanceFormatted} USDC</p>
            </div>
          </div>
        </div>
      </div>

      {step === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">✓</span>
            </div>
            <div>
              <h4 className="font-semibold text-green-800">Repayment Successful!</h4>
              <p className="text-green-600">Successfully repaid {amount} USDC</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Repayment Amount (USDC)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                max={remainingFormatted}
                step="0.01"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleMaxAmount}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                Max
              </button>
            </div>
            
            {/* Validation Messages */}
            {amount && !isValidAmount && (
              <p className="text-red-600 text-sm">
                Amount must be between 0.01 and {remainingFormatted} USDC
              </p>
            )}
            {amount && !hasEnoughBalance && (
              <p className="text-red-600 text-sm">
                Insufficient balance. You have {userBalanceFormatted} USDC
              </p>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 py-4">
            <div className={`flex items-center gap-2 ${getStepStatus('approve') === 'complete' ? 'text-green-600' : getStepStatus('approve') === 'active' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                getStepStatus('approve') === 'complete' ? 'bg-green-100' : 
                getStepStatus('approve') === 'active' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {getStepStatus('approve') === 'complete' ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium">Approve</span>
            </div>
            
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            
            <div className={`flex items-center gap-2 ${getStepStatus('repay') === 'complete' ? 'text-green-600' : getStepStatus('repay') === 'active' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                getStepStatus('repay') === 'complete' ? 'bg-green-100' : 
                getStepStatus('repay') === 'active' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {getStepStatus('repay') === 'complete' ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium">Repay</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!hasEnoughAllowance ? (
              <button
                onClick={handleApprove}
                disabled={!isValidAmount || !hasEnoughBalance || isApprovePending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                {isApprovePending ? 'Approving...' : '1. Approve USDC Spending'}
              </button>
            ) : (
              <button
                onClick={handleRepay}
                disabled={!isValidAmount || !hasEnoughBalance || isRepayPending || isRepayConfirming}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                {isRepayPending ? 'Check Wallet...' : 
                 isRepayConfirming ? 'Processing Repayment...' : 
                 '2. Repay Loan'}
              </button>
            )}
          </div>

          {/* Error Display */}
          {repayError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">
                Error: {repayError.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
