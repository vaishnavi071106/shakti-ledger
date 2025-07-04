import { useReadContracts, useAccount } from 'wagmi';
import { shaktiVaultAbi } from '@/abi/shaktiVault';

export const useVaultData = (vaultAddress: `0x${string}`) => {
  const { address: connectedAddress } = useAccount();
  
  const vaultContract = {
    address: vaultAddress,
    abi: shaktiVaultAbi,
  } as const;

  const { data, isPending, error, refetch } = useReadContracts({
    contracts: [
      {
        ...vaultContract,
        functionName: 'memberCount',
      },
      {
        ...vaultContract,
        functionName: 'stablecoin',
      },
      {
        ...vaultContract,
        functionName: 'totalSupply',
      },
      // Check if connected user is a member
      ...(connectedAddress ? [{
        ...vaultContract,
        functionName: 'isMember',
        args: [connectedAddress],
      }] : []),
      // Get user's balance if connected
      ...(connectedAddress ? [{
        ...vaultContract,
        functionName: 'balanceOf',
        args: [connectedAddress],
      }] : []),
    ],
  });

  const memberCount = data?.[0]?.result;
  const stablecoinAddress = data?.[1]?.result;
  const totalSupply = data?.[2]?.result;
  const isUserMember = connectedAddress ? data?.[3]?.result : false;
  const userBalance = connectedAddress ? data?.[4]?.result : undefined;

  return { 
    memberCount, 
    stablecoinAddress, 
    totalSupply,
    isUserMember,
    userBalance,
    isPending, 
    error,
    refetch
  };
};
