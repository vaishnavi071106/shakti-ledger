import { useReadContracts } from 'wagmi';
import { shaktiVaultAbi } from '@/abi/shaktiVault';
import { useEffect, useState } from 'react';

export const useVaultMembers = (vaultAddress: `0x${string}`) => {
  const [memberAddresses, setMemberAddresses] = useState<string[]>([]);
  
  // First, get the member count
  const { data: memberCountData, isPending: isPendingCount } = useReadContracts({
    contracts: [
      {
        address: vaultAddress,
        abi: shaktiVaultAbi,
        functionName: 'memberCount',
      },
    ],
  });

  const memberCount = memberCountData?.[0]?.result as bigint | undefined;

  // Then get each member's address
  const memberIndices = memberCount ? Array.from({ length: Number(memberCount) }, (_, i) => i) : [];
  
  const { data: membersData, isPending: isPendingMembers } = useReadContracts({
    contracts: memberIndices.map(index => ({
      address: vaultAddress,
      abi: shaktiVaultAbi,
      functionName: 'members',
      args: [BigInt(index)],
    })),
  });

  useEffect(() => {
    if (membersData && memberCount) {
      const addresses = membersData
        .map(result => result.result as string)
        .filter(Boolean);
      setMemberAddresses(addresses);
    }
  }, [membersData, memberCount]);

  return {
    memberAddresses,
    memberCount: memberCount ? Number(memberCount) : 0,
    isPending: isPendingCount || isPendingMembers,
  };
};
