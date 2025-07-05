import { useBackendVaults, useBackendVault, useCreateBackendVault, useUserBackendVaults } from './useBackendApi';

export interface VaultMember {
  address: string;
  name: string;
}

export interface VaultMetadata {
  address: string;
  name: string;
  members: VaultMember[];
  createdAt: string;
  txHash?: string; // Optional transaction hash for reference
}

// Helper function to extract vault address from transaction logs
export const extractVaultAddressFromLogs = (logs: any[]): string | null => {
  try {
    // Look for VaultCreated event (this would need to match your contract's event signature)
    // For now, we'll use a simple approach - in a real implementation, you'd decode the logs properly
    for (const log of logs) {
      if (log.topics && log.topics.length > 0) {
        // Look for the VaultCreated event topic (you'd need the actual event signature)
        // For demo purposes, we'll extract from log data or use the contract address
        if (log.address && log.address !== '0x0000000000000000000000000000000000000000') {
          return log.address;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting vault address from logs:', error);
    return null;
  }
};

export const useVaultMetadata = (userAddress?: string) => {
  const createVaultMutation = useCreateBackendVault();
  
  // Get all vaults if no user address, or user-specific vaults if provided
  const { 
    data: allVaultsData, 
    isLoading: allVaultsLoading, 
    error: allVaultsError,
    refetch: refetchAllVaults
  } = useBackendVaults();
  
  const { 
    data: userVaultsData, 
    isLoading: userVaultsLoading, 
    error: userVaultsError,
    refetch: refetchUserVaults
  } = useUserBackendVaults(userAddress || '');

  // Convert backend data to frontend format
  const convertBackendVault = (backendVault: any): VaultMetadata => ({
    address: backendVault.contractAddress,
    name: backendVault.name,
    members: backendVault.members?.map((member: any) => ({
      address: member.walletAddress,
      name: member.displayName,
    })) || [],
    createdAt: backendVault.createdAt,
    txHash: backendVault.txHash,
  });

  // Get vault metadata based on whether we're fetching all or user-specific
  const vaultMetadata: VaultMetadata[] = userAddress 
    ? (userVaultsData?.data?.vaults || []).map(convertBackendVault)
    : (allVaultsData?.data || []).map(convertBackendVault);

  const isLoaded = userAddress ? !userVaultsLoading : !allVaultsLoading;
  const error = userAddress ? userVaultsError : allVaultsError;

  // Refetch function
  const refetch = async () => {
    if (userAddress) {
      await refetchUserVaults();
    } else {
      await refetchAllVaults();
    }
  };

  // Add or update vault metadata
  const addVaultMetadata = async (newVault: VaultMetadata) => {
    try {
      await createVaultMutation.mutateAsync({
        contractAddress: newVault.address,
        name: newVault.name,
        creatorAddress: userAddress || '', // This should be passed from the component
        network: 'localhost', // This should be dynamic based on current network
        txHash: newVault.txHash,
        members: newVault.members,
      });
    } catch (error) {
      console.error('Error creating vault in backend:', error);
      throw error;
    }
  };

  // Get metadata for a specific vault
  const getVaultMetadata = (vaultAddress: string): VaultMetadata | undefined => {
    return vaultMetadata.find(vault => 
      vault.address.toLowerCase() === vaultAddress.toLowerCase()
    );
  };

  // Get vault name by address with better fallback
  const getVaultName = (vaultAddress: string): string => {
    const metadata = getVaultMetadata(vaultAddress);
    if (metadata?.name) {
      return metadata.name;
    }
    // Create a more readable fallback name
    const shortAddress = `${vaultAddress.slice(0, 6)}...${vaultAddress.slice(-4)}`;
    return `Vault ${shortAddress}`;
  };

  // Get member name by address within a vault
  const getMemberName = (vaultAddress: string, memberAddress: string): string => {
    const metadata = getVaultMetadata(vaultAddress);
    if (metadata?.members) {
      const member = metadata.members.find(m => 
        m.address.toLowerCase() === memberAddress.toLowerCase()
      );
      if (member?.name) {
        return member.name;
      }
    }
    // Fallback to shortened address
    return `${memberAddress.slice(0, 6)}...${memberAddress.slice(-4)}`;
  };

  // Get members for a vault
  const getVaultMembers = (vaultAddress: string): VaultMember[] => {
    const metadata = getVaultMetadata(vaultAddress);
    return metadata?.members || [];
  };

  return {
    vaultMetadata,
    isLoaded,
    error,
    refetch,
    addVaultMetadata,
    getVaultMetadata,
    getVaultName,
    getMemberName,
    getVaultMembers,
    isCreating: createVaultMutation.isPending,
  };
};

// Hook for getting a specific vault by address
export const useVaultByAddress = (vaultAddress: string) => {
  const { data, isLoading, error } = useBackendVault(vaultAddress);
  
  const vaultMetadata: VaultMetadata | null = data?.vault ? {
    address: data.vault.contractAddress,
    name: data.vault.name,
    members: data.vault.members?.map((member: any) => ({
      address: member.walletAddress,
      name: member.name,
    })) || [],
    createdAt: data.vault.createdAt,
    txHash: data.vault.txHash,
  } : null;

  return {
    vaultMetadata,
    isLoading,
    error,
  };
};
