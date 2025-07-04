# Frontend Integration Guide

## 🔧 **Step 4: Frontend Integration**

Here's how to integrate the backend API with your existing vault creation flow:

### **1. Update CreateVaultForm.tsx**

Replace the localStorage metadata saving with backend API call:

```typescript
// Before (localStorage)
useEffect(() => {
  if (isConfirmed && hash && vaultName.trim()) {
    let vaultAddress: string;
    
    if (receipt && receipt.logs) {
      const extractedAddress = extractVaultAddressFromLogs(receipt.logs);
      vaultAddress = extractedAddress || `0x${hash.slice(2, 42)}`;
    } else {
      vaultAddress = `0x${hash.slice(2, 42)}`;
    }
    
    const validMembers = members.filter(member => member.name.trim() && member.walletAddress.trim());
    const vaultMembers = validMembers.map(member => ({
      address: member.walletAddress.trim(),
      name: member.name.trim(),
    }));

    addVaultMetadata({
      address: vaultAddress,
      name: vaultName.trim(),
      members: vaultMembers,
      createdAt: new Date().toISOString(),
      txHash: hash,
    });
  }
}, [isConfirmed, hash, receipt, vaultName, members, addVaultMetadata]);
```

```typescript
// After (Backend API)
import { useCreateBackendVault } from '@/hooks/useBackendApi';

const createVaultMutation = useCreateBackendVault();

useEffect(() => {
  if (isConfirmed && hash && vaultName.trim() && connectedAddress) {
    const saveToBackend = async () => {
      try {
        let vaultAddress: string;
        
        if (receipt && receipt.logs) {
          const extractedAddress = extractVaultAddressFromLogs(receipt.logs);
          vaultAddress = extractedAddress || `0x${hash.slice(2, 42)}`;
        } else {
          vaultAddress = `0x${hash.slice(2, 42)}`;
        }
        
        const validMembers = members.filter(member => member.name.trim() && member.walletAddress.trim());
        const vaultMembers = validMembers.map(member => ({
          address: member.walletAddress.trim(),
          name: member.name.trim(),
        }));

        await createVaultMutation.mutateAsync({
          contractAddress: vaultAddress,
          name: vaultName.trim(),
          creatorAddress: connectedAddress,
          network: 'sepolia',
          txHash: hash,
          members: vaultMembers,
        });

        console.log('Vault metadata saved to backend successfully');
        
        // Redirect to vault dashboard
        setRedirectCountdown(3);
        const countdownInterval = setInterval(() => {
          setRedirectCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              router.push(`/vault/${vaultAddress}`);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        
      } catch (error) {
        console.error('Failed to save vault metadata to backend:', error);
        // Could fall back to localStorage here if needed
      }
    };

    saveToBackend();
  }
}, [isConfirmed, hash, receipt, vaultName, members, connectedAddress, createVaultMutation, router]);
```

### **2. Update VaultDiscovery.tsx**

Replace localStorage-based vault discovery with backend API:

```typescript
// Before (localStorage)
import { useVaultMetadata } from '@/hooks/useVaultMetadata';

export const VaultDiscovery = () => {
  const { vaults, isPending, error } = useDeployedVaults();
  const { getVaultName, getVaultMembers } = useVaultMetadata();
  
  // ...rest of component
};
```

```typescript
// After (Backend API)
import { useBackendVaults, useVaultNameResolver } from '@/hooks/useBackendApi';

export const VaultDiscovery = () => {
  const { data: backendVaults, isLoading: backendLoading } = useBackendVaults();
  const { data: onChainVaults, isPending: onChainPending, error } = useDeployedVaults();
  const { getVaultName } = useVaultNameResolver();
  
  // Combine on-chain vaults with backend metadata
  const enrichedVaults = onChainVaults?.map(vaultAddress => {
    const backendData = backendVaults?.data?.find(vault => 
      vault.contractAddress.toLowerCase() === vaultAddress.toLowerCase()
    );
    
    return {
      address: vaultAddress,
      name: getVaultName(vaultAddress, { data: backendData }),
      members: backendData?.members || [],
      memberCount: backendData?._count?.members || 0,
    };
  }) || [];
  
  const isLoading = onChainPending || backendLoading;
  
  // ...rest of component with enrichedVaults
};
```

### **3. Update Voting Logic**

Replace localStorage voting status with backend API:

```typescript
// Before (localStorage only)
useEffect(() => {
  if (connectedAddress && isMounted) {
    const voteKey = `vote_${vaultAddress}_${loanId.toString()}_${connectedAddress}`;
    const hasVoted = localStorage.getItem(voteKey) === 'true';
    setHasUserVoted(hasVoted);
  }
}, [connectedAddress, isMounted, vaultAddress, loanId]);
```

```typescript
// After (Backend API with localStorage fallback)
import { useVoteStatus, useRecordVote } from '@/hooks/useBackendApi';

const { data: voteStatusData } = useVoteStatus(
  `${vaultAddress}_${loanId}`, 
  connectedAddress || ''
);
const recordVoteMutation = useRecordVote();

useEffect(() => {
  if (voteStatusData?.hasVoted !== undefined) {
    setHasUserVoted(voteStatusData.hasVoted);
  } else if (connectedAddress && isMounted) {
    // Fallback to localStorage if backend is unavailable
    const voteKey = `vote_${vaultAddress}_${loanId.toString()}_${connectedAddress}`;
    const hasVoted = localStorage.getItem(voteKey) === 'true';
    setHasUserVoted(hasVoted);
  }
}, [voteStatusData, connectedAddress, isMounted, vaultAddress, loanId]);

// When user votes successfully
useEffect(() => {
  if (isConfirmed && connectedAddress) {
    // Record vote in backend
    recordVoteMutation.mutate({
      proposalId: `${vaultAddress}_${loanId}`,
      voteData: {
        voterAddress: connectedAddress,
        voteType: 'approve',
        txHash: hash,
      },
    });
    
    // Also keep localStorage for immediate feedback
    const voteKey = `vote_${vaultAddress}_${loanId.toString()}_${connectedAddress}`;
    localStorage.setItem(voteKey, 'true');
    setHasUserVoted(true);
  }
}, [isConfirmed, connectedAddress, recordVoteMutation, vaultAddress, loanId, hash]);
```

### **4. Environment Configuration**

Add to your `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### **5. Testing the Integration**

1. Start the backend: `cd shakti-backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Visit `/backend-test` to test the API
4. Create a vault and verify it appears in the backend
5. Test voting with multiple wallets

### **6. Production Deployment**

For production, you'll need to:

1. Deploy the backend to a service like Railway, Vercel, or AWS
2. Use PostgreSQL instead of SQLite for better performance
3. Update `NEXT_PUBLIC_API_URL` to your production backend URL
4. Add proper authentication and rate limiting
5. Implement WebSocket for real-time updates

### **Benefits Achieved**

✅ **Multi-user vault discovery** - Users can find vaults across devices  
✅ **Cross-wallet voting verification** - Real vote status tracking  
✅ **Member name resolution** - Display names instead of addresses  
✅ **Persistent metadata** - Data survives browser restarts  
✅ **Scalable architecture** - Ready for production use  

This hybrid approach maintains on-chain data integrity while providing enhanced UX through off-chain metadata storage.
