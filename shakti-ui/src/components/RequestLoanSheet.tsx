'use client';

import { useState } from 'react';
import { useRequestLoan } from '@/hooks/useRequestLoan';
import { parseUnits } from 'viem';

interface RequestLoanSheetProps {
  vaultAddress: `0x${string}`;
  onClose: () => void;
}

export const RequestLoanSheet = ({ vaultAddress, onClose }: RequestLoanSheetProps) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const { requestLoan, isPending, isConfirming, isConfirmed, error } = useRequestLoan();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    // Convert USDC amount to proper units (6 decimals for USDC)
    const amountBigInt = parseUnits(amount, 6);
    requestLoan(vaultAddress, amountBigInt);
  };

  // Close the sheet after successful confirmation
  if (isConfirmed) {
    setTimeout(() => {
      onClose();
    }, 2000); // Give user time to see success message
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">💰 Request a Loan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isPending || isConfirming}
          >
            ×
          </button>
        </div>

        {isConfirmed ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Loan Request Submitted!</h3>
            <p className="text-gray-600 mb-4">
              Your loan request has been submitted to the vault for member voting.
            </p>
            <p className="text-sm text-gray-500">
              This window will close automatically...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (USDC)
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 500.00"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isPending || isConfirming}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">USDC</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the amount you wish to borrow from the vault
              </p>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                Purpose of Loan (Optional)
              </label>
              <textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Business expansion, equipment purchase, emergency expenses..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={isPending || isConfirming}
              />
              <p className="mt-1 text-xs text-gray-500">
                Help other members understand your loan request
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">📋 Loan Process</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your request will be submitted to the blockchain</li>
                <li>• Other vault members will vote on your proposal</li>
                <li>• If approved, funds will be transferred to your wallet</li>
                <li>• Repayment terms will be tracked on-chain</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isPending || isConfirming}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isConfirming || !amount}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending 
                  ? '📱 Check Wallet...' 
                  : isConfirming 
                    ? '⏳ Submitting...' 
                    : '🚀 Submit Request'
                }
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-1">Transaction Failed</h4>
            <p className="text-sm text-red-600">
              {error.message || 'An unknown error occurred'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
