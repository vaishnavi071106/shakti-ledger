import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { shaktiVaultAbi } from '@/abi/shaktiVault';

export const useRepayLoan = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const repayLoan = (vaultAddress: `0x${string}`, loanId: bigint, amount: bigint) => {
    writeContract({
      address: vaultAddress,
      abi: shaktiVaultAbi,
      functionName: 'repay',
      args: [loanId, amount],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  return {
    repayLoan,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};
