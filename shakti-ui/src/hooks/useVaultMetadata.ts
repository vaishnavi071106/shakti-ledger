import { useState, useEffect } from 'react';

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

const STORAGE_KEY = 'shakti_vault_metadata';

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

export const useVaultMetadata = () => {
  const [vaultMetadata, setVaultMetadata] = useState<VaultMetadata[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load metadata from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setVaultMetadata(Array.isArray(parsed) ? parsed : []);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading vault metadata:', error);
      setVaultMetadata([]);
      setIsLoaded(true);
    }
  }, []);

  // Save metadata to localStorage whenever it changes
  const saveMetadata = (metadata: VaultMetadata[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
      setVaultMetadata(metadata);
    } catch (error) {
      console.error('Error saving vault metadata:', error);
    }
  };

  // Add or update vault metadata
  const addVaultMetadata = (newVault: VaultMetadata) => {
    const updatedMetadata = vaultMetadata.filter(vault => 
      vault.address.toLowerCase() !== newVault.address.toLowerCase()
    );
    updatedMetadata.push(newVault);
    // Sort by creation date (newest first)
    updatedMetadata.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    saveMetadata(updatedMetadata);
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
    const member = metadata?.members.find(m => 
      m.address.toLowerCase() === memberAddress.toLowerCase()
    );
    if (member?.name) {
      return member.name;
    }
    // Create a more readable fallback name
    return `${memberAddress.slice(0, 6)}...${memberAddress.slice(-4)}`;
  };

  // Get all members for a vault
  const getVaultMembers = (vaultAddress: string): VaultMember[] => {
    const metadata = getVaultMetadata(vaultAddress);
    return metadata?.members || [];
  };

  // Update member name
  const updateMemberName = (vaultAddress: string, memberAddress: string, newName: string) => {
    const metadata = getVaultMetadata(vaultAddress);
    if (metadata) {
      const updatedMembers = metadata.members.map(member =>
        member.address.toLowerCase() === memberAddress.toLowerCase()
          ? { ...member, name: newName }
          : member
      );
      const updatedVault = { ...metadata, members: updatedMembers };
      addVaultMetadata(updatedVault);
    }
  };

  // Get vault statistics
  const getVaultStats = () => {
    return {
      totalVaults: vaultMetadata.length,
      totalMembers: vaultMetadata.reduce((sum, vault) => sum + vault.members.length, 0),
      recentVaults: vaultMetadata.slice(0, 5),
    };
  };

  // Search vaults by name or member name
  const searchVaults = (query: string): VaultMetadata[] => {
    const lowerQuery = query.toLowerCase();
    return vaultMetadata.filter(vault => 
      vault.name.toLowerCase().includes(lowerQuery) ||
      vault.members.some(member => member.name.toLowerCase().includes(lowerQuery))
    );
  };

  // Clear all metadata (for testing)
  const clearAllMetadata = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setVaultMetadata([]);
    } catch (error) {
      console.error('Error clearing vault metadata:', error);
    }
  };

  return {
    vaultMetadata,
    isLoaded,
    addVaultMetadata,
    getVaultMetadata,
    getVaultName,
    getMemberName,
    getVaultMembers,
    updateMemberName,
    getVaultStats,
    searchVaults,
    clearAllMetadata,
  };
};
