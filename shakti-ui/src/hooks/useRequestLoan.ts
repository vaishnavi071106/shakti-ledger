import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { shaktiVaultAbi } from '@/abi/shaktiVault';

export const useRequestLoan = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const requestLoan = (vaultAddress: `0x${string}`, amount: bigint) => {
    writeContract({
      address: vaultAddress,
      abi: shaktiVaultAbi,
      functionName: 'requestLoan',
      args: [amount],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  return {
    requestLoan,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};
