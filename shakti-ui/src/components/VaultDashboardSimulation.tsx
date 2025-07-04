'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock vault data for simulation
const mockVaultData = {
  vaultAddress: '0xB0a099500562dDf6D2aace6Fcc5d219D8a288B97A',
  memberCount: 3,
  stablecoinAddress: '0xeB165CaF13A24e5e00fB5779f64A81aD47Ce6d58',
  totalSupply: '300000000000000000000', // 300 shares (18 decimals)
  vaultBalance: '1500000000', // 1500 USDC (6 decimals)
  userBalance: '100000000000000000000', // 100 shares
  isUserMember: true,
  members: [
    '0x1234567890123456789012345678901234567890',
    '0x2345678901234567890123456789012345678901',
    '0x3456789012345678901234567890123456789012'
  ]
};

export const VaultDashboardSimulation = () => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatBalance = (balance: string, decimals: number = 6) => {
    const value = Number(balance) / Math.pow(10, decimals);
    return value.toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Vault Dashboard - Simulation Mode
        </h1>
        <p className="text-gray-600">
          Testing the vault dashboard interface with mock data
        </p>
      </div>

      {/* Mock Vault Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">SHG Vault Dashboard</h2>
            <p className="text-sm text-gray-500 font-mono">
              Vault: {formatAddress(mockVaultData.vaultAddress)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Full address: {mockVaultData.vaultAddress}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
              🔗 Wallet Connected (Simulation)
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              ✓ Vault Member
            </div>
          </div>
        </div>
      </div>

      {/* Vault Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">👥 Members</h3>
          <p className="text-3xl font-bold text-blue-600">{mockVaultData.memberCount}</p>
          <p className="text-sm text-gray-500 mt-1">Active vault members</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 Vault Balance</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatBalance(mockVaultData.vaultBalance, 6)} USDC
          </p>
          <p className="text-sm text-gray-500 mt-1">Total funds in vault</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🪙 Total Shares</h3>
          <p className="text-3xl font-bold text-purple-600">
            {formatBalance(mockVaultData.totalSupply, 18)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total vault shares issued</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">📊 Your Shares</h3>
          <p className="text-3xl font-bold text-orange-600">
            {formatBalance(mockVaultData.userBalance, 18)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Your vault ownership (33.3%)</p>
        </div>
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Member Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">💼 Member Actions</h2>
          
          <div className="space-y-4">
            <button 
              onClick={() => setSelectedAction('contribute')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              💵 Contribute Funds
            </button>
            <button 
              onClick={() => setSelectedAction('loan')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              🏦 Request Loan
            </button>
            <button 
              onClick={() => setSelectedAction('vote')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              🗳️ Vote on Proposals
            </button>
          </div>

          {/* Action Feedback */}
          {selectedAction && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                {selectedAction === 'contribute' && '💵 Contribute Funds'}
                {selectedAction === 'loan' && '🏦 Request Loan'}
                {selectedAction === 'vote' && '🗳️ Vote on Proposals'}
              </h4>
              <p className="text-sm text-blue-700">
                {selectedAction === 'contribute' && 'This would open a form to deposit USDC tokens into the vault, increasing your shares proportionally.'}
                {selectedAction === 'loan' && 'This would create a loan proposal for other members to vote on. Requires 60% approval (2 out of 3 members).'}
                {selectedAction === 'vote' && 'This would show active proposals and allow you to vote on loan requests and governance decisions.'}
              </p>
            </div>
          )}
        </div>

        {/* Vault Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ℹ️ Vault Information</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Stablecoin Contract:</span>
              <span className="font-mono text-sm text-gray-800">
                {formatAddress(mockVaultData.stablecoinAddress)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Network:</span>
              <span className="text-gray-800">Sepolia Testnet</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Governance Threshold:</span>
              <span className="text-gray-800">60% approval required</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Vault Type:</span>
              <span className="text-gray-800">Self-Help Group Treasury</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">🔗 Quick Links (Simulated)</h4>
            <div className="space-y-2 text-sm">
              <div className="text-blue-600">📊 View on Etherscan</div>
              <div className="text-blue-600">🪙 View Stablecoin Contract</div>
            </div>
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Vault Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockVaultData.members.map((member, index) => (
            <div key={member} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800">Member #{index + 1}</h4>
              <p className="text-sm text-gray-600 font-mono">{formatAddress(member)}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">💵</div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Funds Contributed</p>
              <p className="text-sm text-gray-600">Member #1 contributed 500 USDC</p>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">🗳️</div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Loan Proposal Approved</p>
              <p className="text-sm text-gray-600">Loan request for 300 USDC approved (3/3 votes)</p>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">🏦</div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Vault Created</p>
              <p className="text-sm text-gray-600">SHG Treasury initialized with 3 members</p>
            </div>
            <span className="text-xs text-gray-500">3 days ago</span>
          </div>
        </div>
      </div>

      {/* Simulation Info */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Simulation Notes</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• This demonstrates the complete Vault Dashboard interface</li>
          <li>• All data is simulated - no actual blockchain interactions</li>
          <li>• Member actions show planned functionality for real vaults</li>
          <li>• Ready for integration with actual deployed vault contracts</li>
          <li>• Dashboard will automatically work with any vault address</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="text-center">
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors mr-4"
        >
          ← Back to Home
        </Link>
        <Link 
          href="/simulation"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          🧪 Create Vault Simulation
        </Link>
      </div>
    </div>
  );
};
