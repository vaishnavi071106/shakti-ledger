# Shakti Ledger - Backend Infrastructure Requirements

## 🚨 **Critical Issue: localStorage Limitations**

You are **absolutely correct** that the current localStorage approach has severe limitations for a multi-user, multi-wallet dApp. Here's why you **need a backend database system**:

## 🔍 **Current localStorage Problems**

### **1. Single-Browser Limitation**
```typescript
// Current code in useVaultMetadata.ts
const STORAGE_KEY = 'shakti_vault_metadata';

// This only works in ONE browser on ONE device
localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
```

**Problem**: If User A creates a vault on Chrome, User B on Firefox **cannot see it**.

### **2. Voting Status Per Wallet**
```typescript
// Current voting logic in loan/[loanId]/page.tsx
const voteKey = `vote_${vaultAddress}_${loanId.toString()}_${connectedAddress}`;
localStorage.setItem(voteKey, 'true');
```

**Problem**: 
- Only tracks votes in the current browser
- Other members cannot see who voted
- Vote counts are inconsistent across users
- No way to verify actual on-chain voting status

### **3. Vault Discovery Failure**
```typescript
// Current vault discovery in VaultDiscovery.tsx
const { getVaultName, getVaultMembers } = useVaultMetadata();
```

**Problem**: 
- User A creates vault → stores metadata locally
- User B (vault member) → sees no vault metadata
- User B cannot find vaults they're supposed to be in

### **4. Member Name Resolution**
```typescript
// Current member name lookup
const getMemberName = (vaultAddress: string, memberAddress: string): string => {
  const metadata = getVaultMetadata(vaultAddress);
  const member = metadata?.members.find(m => 
    m.address.toLowerCase() === memberAddress.toLowerCase()
  );
  return member?.name || `${memberAddress.slice(0, 6)}...${memberAddress.slice(-4)}`;
};
```

**Problem**: Names only exist in creator's browser.

## 🏗️ **Required Backend Architecture**

### **Option 1: Traditional Database + API**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │────│  Backend API    │────│   Database      │
│   (Multiple     │    │  (Node.js/      │    │   (PostgreSQL/  │
│    Browsers)    │    │   Python)       │    │    MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Backend Database Schema:**
```sql
-- Vaults table
CREATE TABLE vaults (
  id UUID PRIMARY KEY,
  contract_address VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  creator_address VARCHAR(42) NOT NULL,
  created_at TIMESTAMP,
  tx_hash VARCHAR(66),
  network VARCHAR(50)
);

-- Members table
CREATE TABLE vault_members (
  id UUID PRIMARY KEY,
  vault_id UUID REFERENCES vaults(id),
  wallet_address VARCHAR(42) NOT NULL,
  display_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP,
  UNIQUE(vault_id, wallet_address)
);

-- Loan proposals table
CREATE TABLE loan_proposals (
  id UUID PRIMARY KEY,
  vault_id UUID REFERENCES vaults(id),
  loan_id BIGINT NOT NULL,
  borrower_address VARCHAR(42) NOT NULL,
  amount BIGINT NOT NULL,
  purpose TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP,
  UNIQUE(vault_id, loan_id)
);

-- Votes table
CREATE TABLE loan_votes (
  id UUID PRIMARY KEY,
  loan_proposal_id UUID REFERENCES loan_proposals(id),
  voter_address VARCHAR(42) NOT NULL,
  vote_type VARCHAR(20) NOT NULL, -- 'approve', 'reject'
  voted_at TIMESTAMP,
  tx_hash VARCHAR(66),
  UNIQUE(loan_proposal_id, voter_address)
);
```

**API Endpoints:**
```typescript
// Vault management
GET    /api/vaults                     // List all vaults
POST   /api/vaults                     // Create vault metadata
GET    /api/vaults/:address            // Get vault details
PUT    /api/vaults/:address            // Update vault metadata

// Member management
GET    /api/vaults/:address/members    // Get vault members
POST   /api/vaults/:address/members    // Add member
PUT    /api/vaults/:address/members/:wallet // Update member name

// Loan proposals
GET    /api/vaults/:address/loans      // Get all loan proposals
POST   /api/vaults/:address/loans      // Create loan metadata
GET    /api/vaults/:address/loans/:id  // Get loan details

// Voting
GET    /api/loans/:id/votes           // Get all votes for loan
POST   /api/loans/:id/votes           // Record vote
GET    /api/loans/:id/votes/:wallet   // Check if wallet voted

// User discovery
GET    /api/users/:wallet/vaults      // Get vaults for user
GET    /api/users/:wallet/votes       // Get voting history
```

### **Option 2: The Graph Protocol (Blockchain Indexer)**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │────│  The Graph      │────│   Blockchain    │
│   (Multiple     │    │  (Subgraph)     │    │   (Sepolia)     │
│    Browsers)    │    └─────────────────┘    └─────────────────┘
└─────────────────┘    
```

**Subgraph Schema (GraphQL):**
```graphql
type Vault @entity {
  id: ID!                          # Contract address
  name: String!
  creator: Bytes!                  # Creator address
  members: [VaultMember!]! @derivedFrom(field: "vault")
  loans: [LoanProposal!]! @derivedFrom(field: "vault")
  createdAt: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}

type VaultMember @entity {
  id: ID!                          # vault-address + member-address
  vault: Vault!
  memberAddress: Bytes!
  displayName: String
  role: String!
  joinedAt: BigInt!
}

type LoanProposal @entity {
  id: ID!                          # vault-address + loan-id
  vault: Vault!
  loanId: BigInt!
  borrower: Bytes!
  amount: BigInt!
  purpose: String
  approvals: BigInt!
  disbursed: Boolean!
  votes: [LoanVote!]! @derivedFrom(field: "proposal")
  createdAt: BigInt!
}

type LoanVote @entity {
  id: ID!                          # proposal-id + voter-address
  proposal: LoanProposal!
  voter: Bytes!
  voteType: String!               # "approve" | "reject"
  votedAt: BigInt!
  transactionHash: Bytes!
}
```

**GraphQL Queries:**
```graphql
# Get all vaults for a user
query GetUserVaults($userAddress: Bytes!) {
  vaultMembers(where: { memberAddress: $userAddress }) {
    vault {
      id
      name
      creator
      members {
        memberAddress
        displayName
      }
    }
  }
}

# Get loan proposals with voting status
query GetLoanProposals($vaultAddress: String!) {
  loanProposals(where: { vault: $vaultAddress }) {
    id
    loanId
    borrower
    amount
    approvals
    disbursed
    votes {
      voter
      voteType
      votedAt
    }
  }
}

# Check if user voted on loan
query GetUserVote($proposalId: String!, $voterAddress: Bytes!) {
  loanVotes(where: { 
    proposal: $proposalId, 
    voter: $voterAddress 
  }) {
    id
    voteType
    votedAt
  }
}
```

### **Option 3: Hybrid Approach (Recommended)**

**On-Chain Data**: Use blockchain for authoritative data
- Vault membership (via smart contract `isMember()`)
- Loan proposals (via smart contract `getLoanDetails()`)
- Vote counts (via smart contract events)

**Off-Chain Database**: Store metadata and UX enhancements
- Vault names and descriptions
- Member display names
- Loan purposes and notes
- UI preferences

**Frontend Integration**:
```typescript
// Enhanced hook combining on-chain + off-chain data
export const useVaultDataWithMetadata = (vaultAddress: string) => {
  // On-chain data (authoritative)
  const { memberCount, isUserMember, loans } = useVaultData(vaultAddress);
  
  // Off-chain metadata (UX enhancement)
  const { data: metadata } = useQuery({
    queryKey: ['vault-metadata', vaultAddress],
    queryFn: () => fetchVaultMetadata(vaultAddress),
  });
  
  return {
    // Combine on-chain truth with off-chain metadata
    memberCount,
    isUserMember,
    loans,
    vaultName: metadata?.name || `Vault ${vaultAddress.slice(0, 6)}...`,
    memberNames: metadata?.memberNames || {},
  };
};
```

## 🔧 **Implementation Priority**

### **Phase 1: Quick Backend (1-2 days)**
```bash
# Set up a simple Node.js + PostgreSQL backend
npm install express prisma postgres
npx prisma init
# Create database schema
# Deploy to Railway/Vercel/Heroku
```

### **Phase 2: Enhanced Integration (3-5 days)**
- Migrate localStorage logic to API calls
- Add real-time updates with WebSockets
- Implement proper error handling and caching

### **Phase 3: The Graph Integration (1-2 weeks)**
- Create subgraph for comprehensive blockchain indexing
- Replace manual contract calls with GraphQL queries
- Add advanced filtering and search capabilities

## 🚀 **Immediate Next Steps**

1. **Choose Architecture**: Backend API vs The Graph vs Hybrid
2. **Set Up Database**: PostgreSQL/MongoDB with basic schema
3. **Create API Endpoints**: Replace localStorage with HTTP calls
4. **Update Frontend Hooks**: Modify useVaultMetadata to use API
5. **Deploy Backend**: Use Railway, Vercel, or AWS for hosting

## 💡 **Code Changes Required**

### **Replace localStorage with API calls:**

```typescript
// Before (localStorage)
const { getVaultName, getMemberName } = useVaultMetadata();

// After (API)
const { data: vaultMetadata } = useQuery({
  queryKey: ['vault', vaultAddress],
  queryFn: () => api.getVault(vaultAddress),
});
```

### **Real voting status verification:**

```typescript
// Before (localStorage only)
const hasVoted = localStorage.getItem(voteKey) === 'true';

// After (verify on-chain + cache in database)
const { data: voteStatus } = useQuery({
  queryKey: ['vote-status', loanId, userAddress],
  queryFn: () => api.getUserVoteStatus(loanId, userAddress),
});
```

**You are absolutely right** - localStorage is not sufficient for a multi-user dApp. A proper backend database is essential for vault discovery, member management, and consistent voting status across users and devices.

Would you like me to help you implement any of these backend solutions?
