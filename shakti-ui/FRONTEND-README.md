# Shakti Ledger Frontend

A modern, responsive frontend for the Shakti Ledger decentralized lending system, built with Next.js, wagmi, and RainbowKit.

## Features

- 🔐 **Wallet Connection**: Connect with MetaMask, WalletConnect, and other popular wallets
- 💼 **Account Management**: View connected wallet address and balance
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast Performance**: Built on Next.js 15 with optimized builds
- 🔗 **Web3 Integration**: Ready for smart contract interactions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your WalletConnect Project ID:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get your Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
shakti-ui/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   └── providers/           # Context providers (Web3, etc.)
├── public/                  # Static assets
└── package.json
```

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Web3**: wagmi v2 + RainbowKit
- **TypeScript**: Full type safety
- **State Management**: TanStack Query for server state

## Next Steps

Once the basic wallet connection is working, you can:

1. Add contract interaction hooks using wagmi
2. Create components for SHG management
3. Implement loan request/approval flows
4. Add ZK proof submission interfaces
5. Build analytics dashboards

## Development Notes

- The app is configured for Sepolia testnet by default
- RainbowKit provides pre-built wallet connection UI
- All Web3 functionality is wrapped in the `Web3Provider`
- Components can access wallet state using wagmi hooks

## Troubleshooting

- **Build errors**: Clear `.next` folder and rebuild
- **Wallet connection issues**: Check WalletConnect Project ID
- **TypeScript errors**: Ensure all dependencies are up to date

## Smart Contract Integration

### Create Vault Feature

The application includes a "Create Vault" wizard that allows users to deploy new SHG vaults on-chain. This feature:

- ✅ Validates wallet connection
- ✅ Validates member addresses (minimum 3 required)
- ✅ Provides transaction feedback and error handling
- ✅ Shows transaction hash and success confirmation
- ✅ Handles different transaction states (pending, confirming, confirmed)

### Contract Deployment Setup

Before using the Create Vault feature, you need to:

1. **Deploy the SHGFactory contract** to your target network (Sepolia recommended for testing)
2. **Update environment variables** with the deployed contract address:

```env
NEXT_PUBLIC_SHG_FACTORY_ADDRESS=0x...your_deployed_factory_address
NEXT_PUBLIC_STABLECOIN_ADDRESS=0x...your_stablecoin_address
```

3. **Configure network settings** in `src/providers/WagmiProvider.tsx` if using a different network

The Create Vault form will automatically validate that the contract address is configured before allowing transactions.
