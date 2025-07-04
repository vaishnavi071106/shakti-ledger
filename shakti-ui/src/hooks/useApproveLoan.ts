import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { shaktiVaultAbi } from '@/abi/shaktiVault';

export const useApproveLoan = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const approveLoan = (vaultAddress: `0x${string}`, loanId: bigint) => {
    writeContract({
      address: vaultAddress,
      abi: shaktiVaultAbi,
      functionName: 'approveLoan',
      args: [loanId],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  return {
    approveLoan,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};
