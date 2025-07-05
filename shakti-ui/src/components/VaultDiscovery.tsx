'use client';

import { useDeployedVaults } from '@/hooks/useDeployedVaults';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useVaultMetadata } from '@/hooks/useVaultMetadataBackend';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Search, Users, Calendar, TrendingUp, Shield, 
  ChevronRight, Sparkles, Filter, Grid, List,
  Copy, CheckCircle, ExternalLink, Star, Clock
} from 'lucide-react';

export const VaultDiscovery = () => {
  const isMounted = useIsMounted();
  const { address: connectedAddress } = useAccount();
  const { vaults, isPending, error, factoryAddress } = useDeployedVaults();
  const { getVaultName, getVaultMembers, vaultMetadata, isLoaded } = useVaultMetadata();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'members' | 'name'>('newest');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [hoveredVault, setHoveredVault] = useState<string | null>(null);

  // Filter and sort vaults
  const filteredVaults = vaults.filter(vaultAddress => {
    const vaultName = getVaultName(vaultAddress).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return vaultName.includes(searchLower) || vaultAddress.toLowerCase().includes(searchLower);
  });

  const sortedVaults = [...filteredVaults].sort((a, b) => {
    switch (sortBy) {
      case 'members':
        return getVaultMembers(b).length - getVaultMembers(a).length;
      case 'name':
        return getVaultName(a).localeCompare(getVaultName(b));
      case 'newest':
      default:
        return vaults.indexOf(b) - vaults.indexOf(a);
    }
  });

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded-xl w-1/3 mb-4"></div>
            <div className="h-4 bg-white/20 rounded-lg w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-white/20 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!factoryAddress || factoryAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-400">Configuration Required</h2>
          </div>
          <p className="text-yellow-300/80">
            Factory contract address not configured. Please deploy contracts first.
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-surface-primary rounded-3xl p-8 border border-surface">
          <h2 className="text-3xl font-bold text-white mb-6">Discover Vaults</h2>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-secondary mt-6">Loading deployed vaults...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-8 border border-red-400/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-400">Error Loading Vaults</h2>
          </div>
          <p className="text-red-300/80 mb-2">Unable to fetch deployed vaults from factory.</p>
          <p className="text-sm text-red-300/60 font-mono">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-surface-primary rounded-3xl border border-surface overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-surface">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                Discover Vaults
              </h2>
              <p className="text-secondary">
                Browse and join existing SHG vaults in the network
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{vaults.length}</div>
                <div className="text-sm text-tertiary">Total Vaults</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {vaultMetadata?.reduce((sum, vault) => sum + vault.members.length, 0) || 0}
                </div>
                <div className="text-sm text-tertiary">Total Members</div>
              </div>
            </div>
          </div>

          {/* Factory Address */}
          <div className="mt-6 p-4 bg-surface-secondary rounded-xl border border-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-tertiary mb-1">Factory Contract</p>
                <p className="text-sm text-secondary font-mono">{factoryAddress}</p>
              </div>
              <button
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${factoryAddress}`, '_blank')}
                className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors group"
              >
                <ExternalLink className="w-4 h-4 text-tertiary group-hover:text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        {vaults.length > 0 && (
          <div className="p-6 border-b border-surface bg-surface-secondary">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                <input
                  type="text"
                  placeholder="Search by vault name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-tertiary border border-surface rounded-xl text-primary placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-surface-secondary transition-all"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-surface-tertiary border border-surface rounded-xl text-primary focus:outline-none focus:border-purple-400 focus:bg-surface-secondary transition-all cursor-pointer"
              >
                <option value="newest" className="bg-gray-800">Newest First</option>
                <option value="members" className="bg-gray-800">Most Members</option>
                <option value="name" className="bg-gray-800">Name (A-Z)</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-surface-tertiary rounded-xl border border-surface p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-tertiary hover:text-primary'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-tertiary hover:text-primary'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vaults Display */}
        <div className="p-8">
          {vaults.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">No Vaults Deployed Yet</h3>
              <p className="text-secondary mb-6 max-w-md mx-auto">
                Be the first to create a vault for your Self-Help Group and start building financial independence!
              </p>
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-tertiary">Use the Create Vault tab to deploy your first SHG treasury</p>
              </div>
            </div>
          ) : sortedVaults.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">No vaults found</h3>
              <p className="text-tertiary">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-tertiary">
                  Showing {sortedVaults.length} of {vaults.length} vaults
                </p>
              </div>

              {/* Vaults Grid/List */}
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {sortedVaults.map((vaultAddress, index) => {
                  const vaultName = getVaultName(vaultAddress);
                  const members = getVaultMembers(vaultAddress);
                  const metadata = vaultMetadata?.find(v => v.address.toLowerCase() === vaultAddress.toLowerCase());
                  const createdDate = metadata?.createdAt ? new Date(metadata.createdAt) : null;
                  
                  return (
                    <Link
                      key={vaultAddress}
                      href={`/vault/${vaultAddress}`}
                      onMouseEnter={() => setHoveredVault(vaultAddress)}
                      onMouseLeave={() => setHoveredVault(null)}
                      className={`
                        group relative block
                        ${viewMode === 'grid' ? '' : 'w-full'}
                      `}
                    >
                      <div className={`
                        relative bg-surface-secondary rounded-2xl border border-surface
                        hover:bg-surface-tertiary hover:border-purple-400/50 transition-all duration-300
                        hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02]
                        ${viewMode === 'grid' ? 'p-6' : 'p-6 flex items-center justify-between'}
                      `}>
                        {/* Hover Glow Effect */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 
                          rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        `} />

                        {/* Content */}
                        <div className={`relative z-10 ${viewMode === 'list' ? 'flex items-center justify-between w-full' : ''}`}>
                          <div className={viewMode === 'list' ? 'flex items-center gap-6' : ''}>
                            {/* Vault Icon */}
                            <div className={`
                              w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 
                              rounded-xl flex items-center justify-center text-white font-bold text-xl
                              group-hover:scale-110 transition-transform duration-300 shadow-lg
                              ${viewMode === 'list' ? '' : 'mb-4'}
                            `}>
                              {vaultName.charAt(0).toUpperCase()}
                            </div>

                            <div className={viewMode === 'list' ? 'flex-1' : ''}>
                              {/* Vault Name */}
                              <h3 className="font-bold text-primary text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-400 group-hover:bg-clip-text transition-all duration-300">
                                {vaultName}
                              </h3>

                              {/* Address with Copy */}
                              <div className="flex items-center gap-2 mb-3">
                                <p className="text-sm text-tertiary font-mono">
                                  {formatAddress(vaultAddress)}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    copyAddress(vaultAddress);
                                  }}
                                  className="p-1 hover:bg-surface-tertiary rounded transition-colors"
                                >
                                  {copiedAddress === vaultAddress ? (
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-tertiary" />
                                  )}
                                </button>
                              </div>

                              {/* Stats */}
                              <div className={`flex items-center gap-4 text-sm ${viewMode === 'list' ? '' : 'mb-4'}`}>
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-4 h-4 text-blue-400" />
                                  <span className="text-secondary">{members.length} members</span>
                                </div>
                                {createdDate && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-green-400" />
                                    <span className="text-secondary">
                                      {createdDate.toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Members Preview (Grid View Only) */}
                              {viewMode === 'grid' && members.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs text-tertiary font-medium">Members:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {members.slice(0, 3).map((member, idx) => (
                                      <span 
                                        key={idx} 
                                        className="px-2 py-1 bg-surface-tertiary text-secondary text-xs rounded-lg border border-surface"
                                      >
                                        {member.name}
                                      </span>
                                    ))}
                                    {members.length > 3 && (
                                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg border border-purple-400/30">
                                        +{members.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Arrow Icon */}
                          <div className={`
                            flex items-center justify-center
                            ${viewMode === 'grid' ? 'absolute top-6 right-6' : ''}
                          `}>
                            <div className="w-8 h-8 bg-surface-tertiary rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-all duration-300">
                              <ChevronRight className={`
                                w-4 h-4 text-tertiary group-hover:text-purple-400
                                transition-all duration-300
                                ${hoveredVault === vaultAddress ? 'translate-x-0.5' : ''}
                              `} />
                            </div>
                          </div>
                        </div>

                        {/* Hover Badge */}
                        {hoveredVault === vaultAddress && (
                          <div className="absolute -top-2 -right-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-medium animate-in fade-in-0 zoom-in-95">
                            View Dashboard
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Success Message */}
              <div className="mt-8 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-400/30">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">
                      {vaults.length} Active Vault{vaults.length !== 1 ? 's' : ''} Ready!
                    </h4>
                    <p className="text-sm text-green-300/80">
                      Click any vault to view its dashboard, manage members, and handle loan requests. 
                      Each vault operates independently with its own treasury and governance.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultDiscovery;
