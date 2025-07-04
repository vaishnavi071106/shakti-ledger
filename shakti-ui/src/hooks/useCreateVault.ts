import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { shgFactoryAbi } from '@/abi/shgFactory';

// TODO: Replace with your deployed SHGFactory contract address
// For now, using a placeholder - this will be updated after deployment
const SHG_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_SHG_FACTORY_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';

export const useCreateVault = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const createVault = (members: `0x${string}`[]) => {
    if (!SHG_FACTORY_ADDRESS || SHG_FACTORY_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('SHG Factory contract address not configured. Please set NEXT_PUBLIC_SHG_FACTORY_ADDRESS in your environment variables.');
    }

    writeContract({
      address: SHG_FACTORY_ADDRESS,
      abi: shgFactoryAbi,
      functionName: 'createVault',
      args: [members],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  return {
    createVault,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    receipt,
    factoryAddress: SHG_FACTORY_ADDRESS,
  };
};
