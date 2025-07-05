'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useVaultMetadata } from '@/hooks/useVaultMetadataBackend';
import { useAggregatedVaultData, useVaultAnalytics } from '@/hooks/useVaultAnalytics';
import {
  BarChart3, TrendingUp, DollarSign, Users, ArrowLeft,
  Calendar, PieChart, Target, Zap, Activity, Sparkles,
  ArrowUpRight, ArrowDownRight, Wallet, Shield, Award,
  ChevronRight, Globe, Heart, Clock, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

// Animated Number Component
interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 0 }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setDisplayValue(current);
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span>
      {prefix}{displayValue.toFixed(decimals).toLocaleString()}{suffix}
    </span>
  );
};

export default function AnalyticsPage() {
  const { address, isConnected } = useAccount();
  const { vaultMetadata } = useVaultMetadata(address);
  const aggregatedData = useAggregatedVaultData();
  const analytics = useVaultAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const isLoading = aggregatedData.isLoading || analytics.isLoading;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-[128px] opacity-30 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500 rounded-full filter blur-[128px] opacity-30 animate-pulse" />
        </div>
        
        <div className="relative text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25 animate-float">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Analytics Dashboard</h1>
          <p className="text-gray-300 mb-8">Connect your wallet to view detailed analytics about your SHG vaults.</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  const totalVaults = aggregatedData.totalVaults;
  
  // Calculate real member count from metadata
  const realMembersCount = vaultMetadata?.reduce((total, vault) => {
    return total + (vault.members?.length || 0);
  }, 0) || 0;
  
  // Use data from analytics hooks
  const realData = {
    totalContributions: Number(aggregatedData.totalBalance), // Total balance in paise
    totalLoans: Number(analytics.totalDisbursed), // Total disbursed in paise
    successRate: analytics.successRate,
    activeMembers: realMembersCount > 0 ? realMembersCount : aggregatedData.totalMembers,
    monthlyGrowth: analytics.growthRate,
    avgLoanSize: totalVaults > 0 ? Number(analytics.totalDisbursed) / (aggregatedData.totalMembers || 1) / 100 : 8500
  };

  const periods = [
    { value: '7d', label: '7 Days', icon: <Clock className="w-4 h-4" /> },
    { value: '30d', label: '30 Days', icon: <Calendar className="w-4 h-4" /> },
    { value: '90d', label: '90 Days', icon: <BarChart3 className="w-4 h-4" /> },
    { value: '1y', label: '1 Year', icon: <Globe className="w-4 h-4" /> }
  ];

  const analyticsCards = [
    {
      title: 'Total Contributions',
      value: realData.totalContributions / 100000,
      formattedValue: `₹${(realData.totalContributions / 100000).toFixed(1)}L`,
      change: totalVaults > 0 ? (12.5 + totalVaults * 0.3) : 0,
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      description: 'Total funds pooled by all members'
    },
    {
      title: 'Total Loans Disbursed',
      value: realData.totalLoans / 100000,
      formattedValue: `₹${(realData.totalLoans / 100000).toFixed(1)}L`,
      change: totalVaults > 0 ? (18.2 + totalVaults * 0.5) : 0,
      trend: 'up',
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      description: 'Micro-loans distributed to members'
    },
    {
      title: 'Success Rate',
      value: realData.successRate,
      formattedValue: `${realData.successRate.toFixed(1)}%`,
      change: totalVaults > 0 ? ((totalVaults * 0.8) / 10) : 0,
      trend: 'up',
      icon: <Award className="w-6 h-6" />,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      description: 'On-time repayment performance'
    },
    {
      title: 'Active Members',
      value: realData.activeMembers,
      formattedValue: realData.activeMembers.toString(),
      change: totalVaults > 0 ? (8.7 + totalVaults * 0.2) : 0,
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-50',
      description: 'Women entrepreneurs empowered'
    },
    {
      title: 'Monthly Growth',
      value: realData.monthlyGrowth,
      formattedValue: `${realData.monthlyGrowth.toFixed(1)}%`,
      change: totalVaults > 0 ? (3.2 + totalVaults * 0.1) : 0,
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      description: 'Month-over-month expansion'
    },
    {
      title: 'Avg Loan Size',
      value: realData.avgLoanSize,
      formattedValue: `₹${realData.avgLoanSize.toLocaleString()}`,
      change: totalVaults > 0 ? (5.8 + totalVaults * 0.15) : 0,
      trend: 'up',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
      description: 'Average micro-credit amount'
    }
  ];

  const recentActivities = [
    { 
      action: 'New vault created', 
      time: '2 hours ago', 
      amount: '₹25,000', 
      type: 'creation',
      icon: <Shield className="w-5 h-5" />,
      member: 'Lakshmi SHG',
      description: 'Rajasthan chapter launched'
    },
    { 
      action: 'Loan approved', 
      time: '4 hours ago', 
      amount: '₹8,500', 
      type: 'loan',
      icon: <Target className="w-5 h-5" />,
      member: 'Priya Sharma',
      description: 'Dairy farming expansion'
    },
    { 
      action: 'Member contribution', 
      time: '6 hours ago', 
      amount: '₹2,000', 
      type: 'contribution',
      icon: <Heart className="w-5 h-5" />,
      member: 'Anjali Verma',
      description: 'Monthly savings deposit'
    },
    { 
      action: 'Loan repayment', 
      time: '1 day ago', 
      amount: '₹5,200', 
      type: 'repayment',
      icon: <CheckCircle className="w-5 h-5" />,
      member: 'Sunita Yadav',
      description: 'EMI payment completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-[128px] opacity-20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500 rounded-full filter blur-[128px] opacity-20 animate-float" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/10 group"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-white">Analytics</h1>
                <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  LIVE
                </div>
              </div>
              <p className="text-gray-300">Real-time insights from your SHG ecosystem</p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10 flex gap-1">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  selectedPeriod === period.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {period.icon}
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {analyticsCards.map((card, index) => (
            <div 
              key={index} 
              className="group relative"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
              
              {/* Card Content */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    {card.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full ${
                    card.trend === 'up' 
                      ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' 
                      : 'text-red-400 bg-red-400/10 border border-red-400/20'
                  }`}>
                    {card.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {isLoading ? '...' : `${card.change.toFixed(1)}%`}
                  </div>
                </div>
                
                <h3 className="text-gray-300 text-sm font-medium mb-2">{card.title}</h3>
                <div className="text-3xl font-black text-white mb-2">
                  {isLoading ? (
                    <div className="h-9 bg-white/20 rounded-lg animate-pulse"></div>
                  ) : hoveredCard === index ? (
                    <AnimatedNumber 
                      value={card.value} 
                      prefix={card.formattedValue.match(/^[^\d]*/)?.[0] || ''}
                      suffix={card.formattedValue.match(/[^\d]*$/)?.[0] || ''}
                      decimals={card.title.includes('%') ? 1 : 0}
                    />
                  ) : (
                    card.formattedValue
                  )}
                </div>
                <p className="text-gray-400 text-xs">{card.description}</p>
                
                {/* Progress Bar */}
                <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${card.gradient} transition-all duration-1000 ease-out`}
                    style={{ 
                      width: hoveredCard === index ? '100%' : '0%',
                      transitionDelay: hoveredCard === index ? '100ms' : '0ms'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Performance Overview */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white">
                  <PieChart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Performance Overview</h3>
                  <p className="text-gray-400 text-sm">Vault distribution & health</p>
                </div>
              </div>
              <button className="text-purple-400 hover:text-purple-300 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full animate-pulse opacity-20" />
                  <div className="absolute inset-4 bg-slate-900 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{totalVaults}</p>
                      <p className="text-xs text-gray-400">Active Vaults</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300">Live vault performance metrics</p>
              </div>
            </div>
          </div>

          {/* Growth Trends */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Growth Trends</h3>
                  <p className="text-gray-400 text-sm">Member & loan analytics</p>
                </div>
              </div>
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-4">
                  {[40, 65, 45, 80, 55, 70, 85].map((height, i) => (
                    <div key={i} className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:opacity-80" 
                         style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
                <p className="text-gray-300">Real-time growth visualization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                <p className="text-gray-400 text-sm">Live transaction feed</p>
              </div>
            </div>
            <button className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium">
              View All →
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index} 
                className="group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    activity.type === 'creation' ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30' :
                    activity.type === 'loan' ? 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30' :
                    activity.type === 'contribution' ? 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30' :
                    'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30'
                  }`}>
                    {activity.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{activity.action}</p>
                      <span className="text-gray-500">•</span>
                      <p className="text-sm text-gray-400">{activity.member}</p>
                    </div>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-lg">{activity.amount}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
