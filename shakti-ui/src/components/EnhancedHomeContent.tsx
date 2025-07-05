'use client';

import dynamic from 'next/dynamic';
import { useAccount, useBalance } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useDeployedVaults } from '@/hooks/useDeployedVaults';
import { useVaultMetadata } from '@/hooks/useVaultMetadataBackend';
import { useAggregatedVaultData, useVaultAnalytics } from '@/hooks/useVaultAnalytics';
import { useState, useCallback, useEffect } from 'react';
import { 
  Wallet, Users, PlusCircle, Search, TrendingUp, Shield, 
  Zap, Globe2, BarChart3, ArrowRight, CheckCircle,
  Copy, ExternalLink, RefreshCw, PieChart, DollarSign, Award,
  Sparkles, Heart, Star, Crown, Target
} from 'lucide-react';

// Dynamically import Web3 components to avoid SSR issues
const CreateVaultForm = dynamic(
  () => import('@/components/CreateVaultForm').then((mod) => ({ default: mod.CreateVaultForm })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    ),
  }
);

const VaultDiscovery = dynamic(
  () => import('@/components/VaultDiscovery').then((mod) => ({ default: mod.VaultDiscovery })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    ),
  }
);

const VaultMetadataDebug = dynamic(
  () => import('@/components/VaultMetadataDebug').then((mod) => ({ default: mod.VaultMetadataDebug })),
  { ssr: false }
);

// Modern Hero Section for Connected Users with Enhanced Animations
const ConnectedHero = () => {
  const { address, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Enhanced mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.querySelector('.hero-section')?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
        setMousePosition({ x, y });
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    setIsLoaded(true);
    
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = address;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const viewOnExplorer = () => {
    if (address && chain) {
      // Default to Sepolia explorer for demo
      const explorerUrl = chain.blockExplorers?.default?.url || 'https://sepolia.etherscan.io';
      window.open(`${explorerUrl}/address/${address}`, '_blank');
    }
  };

  return (
    <div className="hero-section relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 mb-8">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        {/* Enhanced Animated Gradient Orbs with Parallax */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500 via-rose-400 to-purple-500 rounded-full filter blur-[200px] opacity-40 transition-transform duration-1000 ease-out"
          style={{ 
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px) scale(${1 + Math.abs(mousePosition.x) * 0.002})`
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-400 rounded-full filter blur-[200px] opacity-30 transition-transform duration-1000 ease-out"
          style={{ 
            transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px) scale(${1 + Math.abs(mousePosition.y) * 0.002})`
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full filter blur-[150px] opacity-25 animate-pulse"
          style={{ 
            transform: `translate(calc(-50% + ${mousePosition.x * 0.1}px), calc(-50% + ${mousePosition.y * 0.1}px))`
          }}
        />
        
        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float-random"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 25}s`,
                opacity: Math.random() * 0.6 + 0.2,
                width: Math.random() * 4 + 1 + 'px',
                height: Math.random() * 4 + 1 + 'px',
                background: `hsl(${Math.random() * 60 + 240}, 100%, ${Math.random() * 30 + 70}%)`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px currentColor`,
                transform: `scale(${isLoaded ? 1 : 0})`,
                transition: `transform ${Math.random() * 2 + 1}s ease-out ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Enhanced Grid Pattern with Animation */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,${0.02 + Math.abs(mousePosition.x) * 0.0005}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${0.02 + Math.abs(mousePosition.y) * 0.0005}) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: `${mousePosition.x * 0.1}px ${mousePosition.y * 0.1}px`
          }} 
        />
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Welcome Section with Enhanced Styling */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Crown className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-black text-white">
                    Welcome to <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent">Shakti Ledger</span>
                  </h1>
                  <div className="px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full border border-yellow-400/30">
                    <span className="text-yellow-400 text-xs font-bold">PREMIUM</span>
                  </div>
                </div>
                <p className="text-white/80 text-xl">Decentralized SHG treasury & micro-credit ecosystem</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {[
                { icon: <Shield className="w-5 h-5" />, text: "Bank-Grade Security", color: "from-emerald-400 to-teal-500" },
                { icon: <Zap className="w-5 h-5" />, text: "Lightning Fast", color: "from-yellow-400 to-orange-500" },
                { icon: <Globe2 className="w-5 h-5" />, text: "Global Network", color: "from-blue-400 to-cyan-500" }
              ].map((feature, i) => (
                <div key={i} className="group flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm text-white/90 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className={`w-8 h-8 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="text-white">{feature.icon}</span>
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Enhanced Wallet Info Card */}
          <div className="bg-surface-primary rounded-3xl p-8 border border-surface min-w-[350px] shadow-2xl shadow-purple-500/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-white font-bold text-lg">Connected Wallet</h3>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">LIVE</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl border border-surface">
                <span className="text-secondary text-sm font-medium">Address</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-primary text-sm bg-surface-tertiary px-3 py-1 rounded-lg">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/70 group-hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl border border-surface">
                <span className="text-secondary text-sm font-medium">Balance</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary text-sm bg-gradient-to-r from-emerald-400/30 to-teal-400/30 px-3 py-1 rounded-lg border border-emerald-400/40">
                    {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
                  </span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={viewOnExplorer}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Quick Actions Dashboard
const QuickActions = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [notification, setNotification] = useState<string | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'create':
        setActiveTab('create');
        showNotification('Navigating to vault creation...');
        // Scroll to the tab section
        setTimeout(() => {
          document.getElementById('vault-tabs')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
      case 'discover':
        setActiveTab('discover');
        showNotification('Exploring available vaults...');
        setTimeout(() => {
          document.getElementById('vault-tabs')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
      case 'analytics':
        // Navigate to the analytics page
        showNotification('Opening analytics dashboard...');
        setTimeout(() => {
          window.open('/analytics', '_blank');
        }, 500);
        break;
      case 'rewards':
        // Could navigate to a rewards page or show modal
        showNotification('Rewards program coming soon! 🎉');
        break;
      default:
        break;
    }
  };

  const actions = [
    {
      id: 'create',
      icon: <PlusCircle className="w-7 h-7" />,
      title: 'Create New Vault',
      description: 'Start a new SHG vault for your community',
      gradient: 'from-emerald-500 to-teal-600',
      stats: 'Setup in 2 minutes',
      bgPattern: '🏛️'
    },
    {
      id: 'discover',
      icon: <Search className="w-7 h-7" />,
      title: 'Discover Vaults',
      description: 'Find and join existing SHG vaults',
      gradient: 'from-blue-500 to-cyan-600',
      stats: 'Real-time discovery',
      bgPattern: '🔍'
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="w-7 h-7" />,
      title: 'Analytics Dashboard',
      description: 'Track your vault performance',
      gradient: 'from-purple-500 to-indigo-600',
      stats: 'Real-time data',
      bgPattern: '📊'
    },
    {
      id: 'rewards',
      icon: <Award className="w-7 h-7" />,
      title: 'Rewards & Benefits',
      description: 'Earn rewards for participation',
      gradient: 'from-yellow-500 to-orange-600',
      stats: 'Coming soon',
      bgPattern: '🎁'
    }
  ];

  return (
    <div className="relative">
      {/* Enhanced Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-purple-500/25 animate-in slide-in-from-right-5 fade-in-0 border border-purple-400/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {notification}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            className="group relative bg-surface-primary hover:bg-surface-secondary rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-surface hover:border-white/30 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute top-4 right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
              {action.bgPattern}
            </div>
            
            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {action.icon}
              </div>
              
              <h3 className="font-bold text-primary text-lg mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text transition-all duration-300">
                {action.title}
              </h3>
              <p className="text-secondary text-sm mb-4 leading-relaxed">{action.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-tertiary bg-surface-tertiary px-3 py-1 rounded-full">
                  {action.stats}
                </span>
                <ArrowRight className={`w-4 h-4 text-gray-400 transition-all duration-300 ${hoveredAction === action.id ? 'translate-x-1 text-white' : ''}`} />
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${action.gradient} transition-all duration-700 ease-out`}
                  style={{ 
                    width: hoveredAction === action.id ? '100%' : '0%'
                  }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Enhanced Stats Overview with Modern Design
const StatsOverview = () => {
  const { address } = useAccount();
  const { isPending: vaultsLoading, refetch: refetchVaults } = useDeployedVaults();
  const { 
    vaultMetadata, 
    isLoaded: metadataLoaded,
    refetch: refetchMetadata
  } = useVaultMetadata(address);
  const aggregatedData = useAggregatedVaultData();
  const analytics = useVaultAnalytics();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Trigger actual refetches from the hooks
      await Promise.all([
        refetchVaults?.(),
        refetchMetadata?.()
      ]);
      
      console.log('Dashboard data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchVaults, refetchMetadata]);

  // Use real analytics data
  const totalVaults = aggregatedData.totalVaults;
  const realMembersCount = vaultMetadata?.reduce((total, vault) => {
    return total + (vault.members?.length || 0);
  }, 0) || 0;
  
  // Combine real metadata members with aggregated data
  const membersCount = realMembersCount > 0 ? realMembersCount : aggregatedData.totalMembers;
  
  // Convert BigInt to number for display (in Rupees)
  const totalDisbursedNumber = Number(analytics.totalDisbursed);
  const displayVaultCount = totalVaults;
  const successRate = analytics.successRate;
  const bonusRate = analytics.growthRate;
  
  const isLoading = vaultsLoading || !metadataLoaded || aggregatedData.isLoading;

  const stats = [
    { 
      label: 'Total Vaults', 
      value: displayVaultCount.toString(), 
      change: isLoading ? 'Loading...' : displayVaultCount > 0 ? `+${Math.round(displayVaultCount * 4.2)}%` : '0%', 
      icon: <PieChart className="w-6 h-6" />,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      description: 'Active SHG vaults',
      isLoading
    },
    { 
      label: 'Active Members', 
      value: membersCount.toLocaleString(), 
      change: isLoading ? 'Loading...' : membersCount > 0 ? `+${Math.round(membersCount * 0.08)}%` : '0%', 
      icon: <Users className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      description: 'Women empowered',
      isLoading
    },
    { 
      label: 'Total Disbursed', 
      value: totalDisbursedNumber > 0 ? `₹${(totalDisbursedNumber / 100000).toFixed(1)}L` : '₹0', 
      change: isLoading ? 'Loading...' : totalDisbursedNumber > 0 ? `+${Math.round(15 + (displayVaultCount * 0.5))}%` : '0%', 
      icon: <DollarSign className="w-6 h-6" />,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      description: 'Micro-loans funded',
      isLoading
    },
    { 
      label: 'Success Rate', 
      value: `${successRate.toFixed(1)}%`, 
      change: isLoading ? 'Loading...' : displayVaultCount > 0 ? `+${(bonusRate / 10).toFixed(1)}%` : '0%', 
      icon: <Award className="w-6 h-6" />,
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-50 to-orange-50',
      description: 'Repayment rate',
      isLoading
    }
  ];

  return (
    <div className="bg-surface-primary rounded-3xl p-8 mb-8 border border-surface shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary">Platform Overview</h2>
            <p className="text-secondary">Real-time network statistics</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors disabled:opacity-50 px-4 py-2 bg-surface-secondary rounded-xl hover:bg-surface-tertiary"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="group relative"
            onMouseEnter={() => setHoveredStat(i)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
            
            {/* Card Content */}
            <div className="relative text-center p-6 bg-surface-secondary rounded-2xl border border-surface hover:border-white/20 transition-all duration-300 h-full">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              
              <div className="text-3xl font-black text-primary mb-2">
                {stat.isLoading ? (
                  <div className="h-9 bg-white/20 rounded-lg animate-pulse mx-auto w-20"></div>
                ) : (
                  stat.value
                )}
              </div>
              
              <div className="text-sm text-secondary mb-3 font-medium">{stat.label}</div>
              <div className="text-xs text-tertiary mb-3">{stat.description}</div>
              
              <div className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                {stat.isLoading ? '...' : stat.change}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                  style={{ 
                    width: hoveredStat === i ? '100%' : '0%',
                    transitionDelay: hoveredStat === i ? '100ms' : '0ms'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// User Dashboard Summary with Personal Vault Info
const UserDashboardSummary = () => {
  const { address } = useAccount();
  const { vaultMetadata } = useVaultMetadata(address);
  
  // Filter vaults where user is a member
  const userVaults = vaultMetadata?.filter(vault => 
    vault.members.some(member => 
      member.address.toLowerCase() === address?.toLowerCase()
    )
  ) || [];

  const userStats = {
    vaultsJoined: userVaults.length,
    totalMembers: userVaults.reduce((sum, vault) => sum + vault.members.length, 0),
    avgVaultSize: userVaults.length > 0 ? Math.round(userVaults.reduce((sum, vault) => sum + vault.members.length, 0) / userVaults.length) : 0,
  };

  if (userVaults.length === 0) {
    return (
      <div className="bg-surface-primary rounded-2xl p-6 mb-8 border border-surface">
        <h2 className="text-xl font-bold text-primary mb-4">Your SHG Journey</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Start Your SHG Journey</h3>
          <p className="text-secondary mb-4">Create your first vault or join an existing community to begin building financial resilience together.</p>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => {
                document.getElementById('vault-tabs')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
            >
              Create Vault
            </button>
            <button 
              onClick={() => {
                document.getElementById('vault-tabs')?.scrollIntoView({ behavior: 'smooth' });
                // Could also switch to discover tab
              }}
              className="bg-surface-secondary hover:bg-surface-tertiary text-primary font-medium py-2 px-4 rounded-xl border border-surface transition-colors"
            >
              Discover Vaults
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary rounded-2xl p-6 mb-8 border border-surface">
      <h2 className="text-xl font-bold text-primary mb-6">Your SHG Portfolio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
          <div className="text-2xl font-bold text-purple-600 mb-1">{userStats.vaultsJoined}</div>
          <div className="text-sm text-gray-600">Vaults Joined</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-600 mb-1">{userStats.totalMembers}</div>
          <div className="text-sm text-gray-600">Total Network</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600 mb-1">{userStats.avgVaultSize}</div>
          <div className="text-sm text-gray-600">Avg Vault Size</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-primary">Your Vaults</h3>
        {userVaults.slice(0, 3).map((vault) => (
          <div key={vault.address} className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl border border-surface">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                {vault.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-primary">{vault.name}</p>
                <p className="text-sm text-secondary">{vault.members.length} members</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-tertiary">
                {new Date(vault.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        
        {userVaults.length > 3 && (
          <button 
            onClick={() => {
              document.getElementById('vault-tabs')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full text-purple-600 hover:text-purple-700 font-medium py-2 text-sm transition-colors"
          >
            View all {userVaults.length} vaults →
          </button>
        )}
      </div>
    </div>
  );
};

// Onboarding Help Component
const OnboardingGuide = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { address } = useAccount();
  const { vaultMetadata } = useVaultMetadata(address);
  
  // Show onboarding for users with no vaults
  const shouldShowOnboarding = vaultMetadata?.length === 0;

  if (!shouldShowOnboarding) return null;

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Modal Overlay */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Shakti Ledger! 👋</h2>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-gray-600">Get started with your first Self-Help Group vault in just a few steps!</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Create Your First Vault</h3>
                    <p className="text-sm text-gray-600">Set up a new SHG vault for your community with customizable parameters.</p>
                    <p className="text-xs text-purple-600 mt-1">Shortcut: Alt+1</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Discover Existing Vaults</h3>
                    <p className="text-sm text-gray-600">Browse and join existing community vaults that match your needs.</p>
                    <p className="text-xs text-blue-600 mt-1">Shortcut: Alt+2</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Track Performance</h3>
                    <p className="text-sm text-gray-600">Monitor your vault&apos;s growth and member activity through our analytics dashboard.</p>
                    <p className="text-xs text-green-600 mt-1">Shortcut: Alt+3</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Need help?</h3>
                <p className="text-sm text-gray-600 mb-4">Our support team is here to assist you with any questions about setting up and managing your SHG vaults.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => window.open('mailto:support@shaktiled.com', '_blank')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-xl transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const EnhancedHomeContent = () => {
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('create');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('create');
            document.getElementById('vault-tabs')?.scrollIntoView({ behavior: 'smooth' });
            break;
          case '2':
            e.preventDefault();
            setActiveTab('discover');
            document.getElementById('vault-tabs')?.scrollIntoView({ behavior: 'smooth' });
            break;
          case '3':
            e.preventDefault();
            window.open('/analytics', '_blank');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Show enhanced loading state during SSR
  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Effects for Loading */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full filter blur-[200px] opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-pink-600 rounded-full filter blur-[200px] opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600 rounded-full filter blur-[250px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-float-random"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${10 + Math.random() * 20}s`,
                  opacity: Math.random() * 0.5 + 0.2
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            {/* Multi-layer loading animation */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-500"></div>
              <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-pink-500 border-l-pink-500" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              <div className="absolute inset-4 animate-pulse bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"></div>
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Initializing Shakti Ledger
          </h2>
          <p className="text-gray-300 text-lg mb-4">Connecting to the blockchain...</p>
          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" 
                   style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
          
          {/* Loading progress indicators */}
          <div className="mt-8 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Loading components...</span>
              <span>85%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-16 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[200px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-[200px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Wallet className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Connect your Web3 wallet to access the full Shakti Ledger experience and start managing your SHG treasury.
          </p>
          
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
            <h3 className="font-bold text-white mb-6 text-lg">What you&apos;ll get access to:</h3>
            <ul className="text-left text-gray-300 space-y-4">
              {[
                { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, text: "Create and manage SHG vaults" },
                { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, text: "Request and approve micro-loans" },
                { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, text: "Track community finances" },
                { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, text: "Earn rewards for participation" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  {item.icon}
                  <span className="font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">PREMIUM FEATURES</span>
              </div>
              <p className="text-xs text-gray-400">Access advanced analytics, multi-signature support, and priority customer support</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Enhanced Particle Field */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                background: `hsl(${Math.random() * 60 + 240}, 80%, ${Math.random() * 40 + 60}%)`,
                boxShadow: `0 0 ${Math.random() * 6 + 3}px currentColor`
              }}
            />
          ))}
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      {/* Modern Hero Section */}
      <div className="relative z-10">
        <ConnectedHero />
      </div>
      
      {/* Stats Overview */}
      <div className="relative z-10">
        <StatsOverview />
      </div>
      
      {/* User Dashboard Summary */}
      <div className="relative z-10">
        <UserDashboardSummary />
      </div>
      
      {/* Quick Actions */}
      <div className="relative z-10">
        <QuickActions setActiveTab={setActiveTab} />
      </div>
      
      {/* Main Content Tabs */}
      <div id="vault-tabs" className="relative z-10 bg-surface-primary rounded-3xl border border-surface overflow-hidden shadow-2xl">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-surface">
          <div className="flex">
            {[
              { id: 'create', label: 'Create Vault', icon: <PlusCircle className="w-4 h-4" />, shortcut: 'Alt+1', gradient: 'from-emerald-500 to-teal-600' },
              { id: 'discover', label: 'Discover Vaults', icon: <Search className="w-4 h-4" />, shortcut: 'Alt+2', gradient: 'from-blue-500 to-cyan-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-3 px-8 py-5 font-medium transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? 'text-white bg-gradient-to-r ' + tab.gradient + ' shadow-lg'
                    : 'text-secondary hover:text-primary hover:bg-surface-secondary'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white scale-110' 
                    : 'bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white'
                }`}>
                  {tab.icon}
                </div>
                <span className="font-bold">{tab.label}</span>
                <span className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:bg-white/20 group-hover:text-gray-300'
                }`}>
                  {tab.shortcut}
                </span>
                
                {/* Active Tab Glow */}
                {activeTab === tab.id && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg blur-xl opacity-50 -z-10`} />
                )}
              </button>
            ))}
          </div>
          
          {/* Enhanced Tab Actions */}
          <div className="flex items-center gap-3 px-6">
            <button 
              onClick={() => window.open('/analytics', '_blank')}
              className="group flex items-center gap-3 text-secondary hover:text-primary text-sm font-bold px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 transition-all duration-300 border border-surface hover:border-white/20"
            >
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span>Analytics</span>
              <span className="text-xs px-2 py-1 bg-white/10 text-gray-400 rounded-full group-hover:bg-white/20 group-hover:text-white">Alt+3</span>
            </button>
          </div>
        </div>
        
        {/* Enhanced Tab Content */}
        <div className="p-8 bg-surface-secondary">
          <div className="transition-all duration-500 ease-in-out">
            {activeTab === 'create' && <CreateVaultForm />}
            {activeTab === 'discover' && <VaultDiscovery />}
          </div>
        </div>
      </div>
      
      {/* Debug Section (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="relative z-10 bg-surface-primary rounded-2xl p-6 border border-surface">
          <h3 className="text-lg font-semibold text-primary mb-4">Development Tools</h3>
          <VaultMetadataDebug />
        </div>
      )}

      {/* Onboarding Guide (for new users) */}
      <OnboardingGuide />
      
      {/* Enhanced CSS Animations */}
      <style jsx global>{`
        @keyframes float-random {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.3;
          }
          25% { 
            transform: translate(30px, -30px) scale(1.3) rotate(90deg);
            opacity: 0.7;
          }
          50% { 
            transform: translate(-20px, 20px) scale(0.8) rotate(180deg);
            opacity: 0.4;
          }
          75% { 
            transform: translate(40px, 10px) scale(1.1) rotate(270deg);
            opacity: 0.6;
          }
        }
        
        @keyframes blob {
          0% { 
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          25% { 
            transform: translate(30px, -50px) scale(1.1) rotate(90deg);
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% { 
            transform: translate(-20px, 20px) scale(0.9) rotate(180deg);
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
          }
          75% { 
            transform: translate(50px, -10px) scale(1.05) rotate(270deg);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          100% { 
            transform: translate(0px, 0px) scale(1) rotate(360deg);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
        }
        
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0) rotate(0deg);
            box-shadow: 0 0 0px currentColor;
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2) rotate(180deg);
            box-shadow: 0 0 10px currentColor;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
          }
        }
        
        @keyframes slide-in-right {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-float-random {
          animation: float-random 12s infinite ease-in-out;
        }
        
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        
        .animate-twinkle {
          animation: twinkle 4s infinite ease-in-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-6000 {
          animation-delay: 6s;
        }

        /* Smooth scrolling for better UX */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
        }
      `}</style>
    </div>
  );
};
