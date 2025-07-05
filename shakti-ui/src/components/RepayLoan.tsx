'use client';

import { useState, useEffect } from 'react';
import { useRepayLoan } from '@/hooks/useRepayLoan';
import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { mockUsdcAbi } from '@/abi/mockUsdc';
import { 
  DollarSign, CheckCircle, AlertCircle, Loader2, 
  TrendingUp, Wallet, ArrowRight, Info, Sparkles 
} from 'lucide-react';

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
  
  const amountBigInt = amount ? parseUnits(amount, 6) : BigInt(0);
  const hasEnoughBalance = userBalance && amountBigInt <= userBalance;
  const hasEnoughAllowance = allowance && amountBigInt <= allowance;
  const isValidAmount = amountBigInt > BigInt(0) && amountBigInt <= remainingAmount;

  // Calculate repayment progress
  const repaymentProgress = loanAmount > BigInt(0) 
    ? Number((repaidAmount * BigInt(100)) / loanAmount) 
    : 0;

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

  if (remainingAmount <= BigInt(0)) {
    return (
      <div className="mt-6 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl border border-green-400/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-400">Loan Fully Repaid</h3>
            <p className="text-green-300/80">This loan has been completely repaid. Total: {totalFormatted} USDC</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-surface-primary rounded-2xl border border-surface overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-surface">
        <h3 className="text-xl font-semibold text-primary mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          Repay Loan
        </h3>
        
        {/* Loan Overview */}
        <div className="mt-4 bg-surface-secondary rounded-xl p-4 border border-surface">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-tertiary">Total Loan</span>
              <p className="font-semibold text-primary text-lg">{totalFormatted} USDC</p>
            </div>
            <div>
              <span className="text-tertiary">Already Repaid</span>
              <p className="font-semibold text-green-400 text-lg">{repaidFormatted} USDC</p>
            </div>
            <div>
              <span className="text-tertiary">Remaining</span>
              <p className="font-semibold text-orange-400 text-lg">{remainingFormatted} USDC</p>
            </div>
            <div>
              <span className="text-tertiary">Your Balance</span>
              <p className="font-semibold text-blue-400 text-lg">{userBalanceFormatted} USDC</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-tertiary mb-1">
              <span>Progress</span>
              <span>{repaymentProgress}% Complete</span>
            </div>
            <div className="w-full bg-surface-tertiary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                style={{ width: `${repaymentProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {step === 'success' ? (
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-green-400 text-lg mb-1">Repayment Successful!</h4>
                <p className="text-green-300/80">Successfully repaid {amount} USDC</p>
                <div className="mt-3 flex items-center gap-2 text-green-300/60 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Transaction confirmed on blockchain</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary">
                Repayment Amount (USDC)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    max={remainingFormatted}
                    step="0.01"
                    className="w-full px-4 py-3 bg-surface-tertiary border border-surface rounded-xl text-primary placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-surface-secondary transition-all"
                  />
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                </div>
                <button
                  onClick={handleMaxAmount}
                  className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl font-medium transition-all border border-purple-400/30"
                >
                  Max
                </button>
              </div>
              
              {/* Validation Messages */}
              {amount && !isValidAmount && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Amount must be between 0.01 and {remainingFormatted} USDC
                </p>
              )}
              {amount && !hasEnoughBalance && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Insufficient balance. You have {userBalanceFormatted} USDC
                </p>
              )}
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 py-4">
              <div className={`flex items-center gap-2 transition-colors duration-300 ${
                getStepStatus('approve') === 'complete' ? 'text-green-400' :
                getStepStatus('approve') === 'active' ? 'text-blue-400' : 'text-tertiary'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  getStepStatus('approve') === 'complete' ? 'bg-green-500/20 border border-green-400/30' :
                  getStepStatus('approve') === 'active' ? 'bg-blue-500/20 border border-blue-400/30 animate-pulse' :
                  'bg-surface-tertiary border border-surface'
                }`}>
                  {getStepStatus('approve') === 'complete' ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="text-sm font-medium">Approve</span>
              </div>
              
              <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                getStepStatus('approve') === 'complete' ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-surface-tertiary'
              }`}></div>
              
              <div className={`flex items-center gap-2 transition-colors duration-300 ${
                getStepStatus('repay') === 'complete' ? 'text-green-400' :
                getStepStatus('repay') === 'active' ? 'text-blue-400' : 'text-tertiary'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  getStepStatus('repay') === 'complete' ? 'bg-green-500/20 border border-green-400/30' :
                  getStepStatus('repay') === 'active' ? 'bg-blue-500/20 border border-blue-400/30 animate-pulse' :
                  'bg-surface-tertiary border border-surface'
                }`}>
                  {getStepStatus('repay') === 'complete' ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span className="text-sm font-medium">Repay</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300/80">
                  <p className="mb-1">Two-step process:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Approve the vault to spend your USDC</li>
                    <li>Execute the repayment transaction</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!hasEnoughAllowance ? (
                <button
                  onClick={handleApprove}
                  disabled={!isValidAmount || !hasEnoughBalance || isApprovePending}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isApprovePending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      1. Approve USDC Spending
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleRepay}
                  disabled={!isValidAmount || !hasEnoughBalance || isRepayPending || isRepayConfirming}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-green-500/30 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isRepayPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Check Wallet...
                    </>
                  ) : isRepayConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Repayment...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      2. Repay Loan
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error Display */}
            {repayError && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                <p className="text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{repayError.message}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
