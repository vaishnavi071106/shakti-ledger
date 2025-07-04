import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

// API functions
const api = {
  // Vault endpoints
  async getAllVaults() {
    const response = await fetch(`${API_BASE_URL}/api/vaults`);
    if (!response.ok) {
      throw new Error('Failed to fetch vaults');
    }
    return response.json();
  },

  async getVault(address: string) {
    const response = await fetch(`${API_BASE_URL}/api/vaults/${address}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vault');
    }
    return response.json();
  },

  async createVault(vaultData: {
    contractAddress: string;
    name: string;
    creatorAddress: string;
    network?: string;
    txHash?: string;
    members: Array<{ address: string; name: string }>;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/vaults`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vaultData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create vault');
    }
    
    return response.json();
  },

  async getUserVaults(walletAddress: string) {
    const response = await fetch(`${API_BASE_URL}/api/vaults/user/${walletAddress}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user vaults');
    }
    return response.json();
  },

  // Vote endpoints
  async checkVoteStatus(proposalId: string, voterAddress: string) {
    const response = await fetch(`${API_BASE_URL}/api/loans/${proposalId}/votes/${voterAddress}`);
    if (!response.ok) {
      throw new Error('Failed to check vote status');
    }
    return response.json();
  },

  async recordVote(proposalId: string, voteData: {
    voterAddress: string;
    voteType: string;
    txHash?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/loans/${proposalId}/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voteData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to record vote');
    }
    
    return response.json();
  },

  // Repayment endpoints
  async recordRepayment(proposalId: string, repaymentData: {
    amount: string;
    txHash: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/loans/${proposalId}/repayments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repaymentData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to record repayment');
    }
    
    return response.json();
  },

  async getLoanRepayments(proposalId: string) {
    const response = await fetch(`${API_BASE_URL}/api/loans/${proposalId}/repayments`);
    if (!response.ok) {
      throw new Error('Failed to fetch loan repayments');
    }
    return response.json();
  },

  async getLoanSummary(proposalId: string) {
    const response = await fetch(`${API_BASE_URL}/api/loans/${proposalId}/summary`);
    if (!response.ok) {
      throw new Error('Failed to fetch loan summary');
    }
    return response.json();
  },
};

// React hooks
export const useBackendVaults = () => {
  return useQuery({
    queryKey: ['vaults'],
    queryFn: api.getAllVaults,
    staleTime: 30000, // 30 seconds
  });
};

export const useBackendVault = (address: string) => {
  console.log('🔍 useBackendVault called with address:', address);
  console.log('🔍 Address is truthy:', !!address);
  console.log('🔍 API_BASE_URL:', API_BASE_URL);
  
  const result = useQuery({
    queryKey: ['vault', address],
    queryFn: async () => {
      console.log('🚀 Making API call to:', `${API_BASE_URL}/api/vaults/${address}`);
      try {
        const data = await api.getVault(address);
        console.log('✅ API call successful, data:', data);
        return data;
      } catch (error) {
        console.error('❌ API call failed:', error);
        throw error;
      }
    },
    enabled: !!address && address.length > 0, // More explicit check
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  console.log('🔄 useBackendVault result:', { 
    isLoading: result.isLoading, 
    error: result.error, 
    data: result.data,
    status: result.status
  });
  
  return result;
};

export const useCreateBackendVault = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createVault,
    onSuccess: () => {
      // Invalidate and refetch vaults list
      queryClient.invalidateQueries({ queryKey: ['vaults'] });
    },
  });
};

export const useUserVaults = (walletAddress: string) => {
  return useQuery({
    queryKey: ['user-vaults', walletAddress],
    queryFn: () => api.getUserVaults(walletAddress),
    enabled: !!walletAddress,
    staleTime: 30000,
  });
};

export const useUserBackendVaults = (walletAddress: string) => {
  return useQuery({
    queryKey: ['user-vaults', walletAddress],
    queryFn: () => api.getUserVaults(walletAddress),
    enabled: !!walletAddress,
    staleTime: 30000,
  });
};

export const useVoteStatus = (proposalId: string, voterAddress: string) => {
  return useQuery({
    queryKey: ['vote-status', proposalId, voterAddress],
    queryFn: () => api.checkVoteStatus(proposalId, voterAddress),
    enabled: !!proposalId && !!voterAddress,
    staleTime: 5000, // 5 seconds for vote status
  });
};

export const useRecordVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ proposalId, voteData }: { 
      proposalId: string; 
      voteData: { voterAddress: string; voteType: string; txHash?: string } 
    }) => api.recordVote(proposalId, voteData),
    onSuccess: (data, variables) => {
      // Invalidate vote status for this proposal and voter
      queryClient.invalidateQueries({ 
        queryKey: ['vote-status', variables.proposalId, variables.voteData.voterAddress] 
      });
    },
  });
};

// Repayment hooks
export const useRecordRepayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ proposalId, repaymentData }: { 
      proposalId: string; 
      repaymentData: { amount: string; txHash: string } 
    }) => api.recordRepayment(proposalId, repaymentData),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['loan-repayments', variables.proposalId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['loan-summary', variables.proposalId] 
      });
    },
  });
};

export const useLoanRepayments = (proposalId: string) => {
  return useQuery({
    queryKey: ['loan-repayments', proposalId],
    queryFn: () => api.getLoanRepayments(proposalId),
    enabled: !!proposalId,
    staleTime: 10000, // 10 seconds
  });
};

export const useLoanSummary = (proposalId: string) => {
  return useQuery({
    queryKey: ['loan-summary', proposalId],
    queryFn: () => api.getLoanSummary(proposalId),
    enabled: !!proposalId,
    staleTime: 10000, // 10 seconds
  });
};

// Helper function to get vault name with backend fallback
export const useVaultNameResolver = () => {
  return {
    getVaultName: (vaultAddress: string, backendData?: any) => {
      if (backendData?.data?.name) {
        return backendData.data.name;
      }
      // Fallback to formatted address
      return `Vault ${vaultAddress.slice(0, 6)}...${vaultAddress.slice(-4)}`;
    },
    
    getMemberName: (vaultAddress: string, memberAddress: string, backendData?: any) => {
      if (backendData?.data?.members) {
        const member = backendData.data.members.find((m: any) => 
          m.walletAddress.toLowerCase() === memberAddress.toLowerCase()
        );
        if (member?.displayName) {
          return member.displayName;
        }
      }
      // Fallback to formatted address
      return `${memberAddress.slice(0, 6)}...${memberAddress.slice(-4)}`;
    },
  };
};

// Legacy compatibility - wrapper for existing localStorage-based code
export const useBackendMetadata = () => {
  const { data: vaultsData } = useBackendVaults();
  const { getVaultName, getMemberName } = useVaultNameResolver();
  
  // Convert backend data to localStorage-like format for compatibility
  const vaultMetadata = vaultsData?.data || [];
  
  return {
    vaultMetadata,
    isLoaded: !!vaultsData,
    
    // Compatibility methods
    getVaultName: (vaultAddress: string) => {
      const vault = vaultMetadata.find((v: any) => 
        v.contractAddress.toLowerCase() === vaultAddress.toLowerCase()
      );
      return getVaultName(vaultAddress, { data: vault });
    },
    
    getMemberName: (vaultAddress: string, memberAddress: string) => {
      const vault = vaultMetadata.find((v: any) => 
        v.contractAddress.toLowerCase() === vaultAddress.toLowerCase()
      );
      return getMemberName(vaultAddress, memberAddress, { data: vault });
    },
    
    getVaultMetadata: (vaultAddress: string) => {
      return vaultMetadata.find((v: any) => 
        v.contractAddress.toLowerCase() === vaultAddress.toLowerCase()
      );
    },
    
    getVaultStats: () => ({
      totalVaults: vaultMetadata.length,
      totalMembers: vaultMetadata.reduce((sum: number, vault: any) => sum + vault.members.length, 0),
      recentVaults: vaultMetadata.slice(0, 5),
    }),
  };
};

export default api;
