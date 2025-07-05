import { useReadContract } from 'wagmi';
import { shgFactoryAbi } from '@/abi/shgFactory';

const SHG_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_SHG_FACTORY_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';

export const useDeployedVaults = () => {
  const { data: vaults, isPending, error, refetch } = useReadContract({
    address: SHG_FACTORY_ADDRESS,
    abi: shgFactoryAbi,
    functionName: 'getDeployedVaults',
  });

  return {
    vaults: vaults || [],
    isPending,
    error,
    refetch,
    factoryAddress: SHG_FACTORY_ADDRESS,
  };
};
