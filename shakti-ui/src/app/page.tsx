'use client';

import dynamic from 'next/dynamic';
import { NavigationBar } from '@/components/NavigationBar';
import { ModernNavigationBar } from '@/components/ModernNavigationBar';
import { ModernHero, DemoNavigationSection, ImpactStats, ModernFeatures } from '@/components/ModernLandingPage';
import { useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

// Dynamically import the home content that uses wagmi hooks
const HomeContent = dynamic(
  () => import('@/components/EnhancedHomeContent').then((mod) => ({ default: mod.EnhancedHomeContent })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-pink-400 animate-ping mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Shakti Ledger...</h2>
          <p className="text-gray-600">Preparing your dashboard...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const searchParams = useSearchParams();
  const { isConnected } = useAccount();
  const [showModernPage, setShowModernPage] = useState(true);

  // Check if user is connected or came from a connected state
  useEffect(() => {
    const connected = searchParams?.get('connected');
    if (isConnected || connected === 'true') {
      setShowModernPage(false);
    }
  }, [isConnected, searchParams]);

  // Show the modern landing page by default
  if (showModernPage && !isConnected) {
    return (
      <div className="min-h-screen bg-white">
        {/* Modern Navigation integrated into hero */}
        <ModernNavigationBar />
        
        {/* Modern Hero Section */}
        <ModernHero />
        
        {/* Impact Stats */}
        <ImpactStats />
        
        {/* Demo Navigation Section */}
        <DemoNavigationSection />
        
        {/* Modern Features */}
        <ModernFeatures />
        
        {/* Footer */}
        <footer className="py-16 bg-gradient-to-br from-slate-900 to-purple-900">
          <div className="container mx-auto px-4 text-center">
            <p className="text-white/60">Built with Next.js, wagmi, and RainbowKit</p>
            <p className="text-white/40 text-sm mt-2">Empowering Self-Help Groups across Bharat</p>
          </div>
        </footer>
      </div>
    );
  }

  // Show the connected/old page when wallet is connected
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300 rounded-full filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10">
        <NavigationBar />
        
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Welcome Back! <span className="text-4xl">🎉</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Your wallet is connected. Explore the full potential of decentralized SHG management and start building financial independence for your community.
            </p>
            
            {/* Return to landing option */}
            <button
              onClick={() => setShowModernPage(true)}
              className="mb-8 group px-6 py-3 bg-white/80 hover:bg-white text-purple-700 rounded-xl font-medium hover:shadow-lg transition-all duration-300 border border-purple-200 hover:border-purple-300"
            >
              <span className="flex items-center gap-2">
                ← Back to Landing Page
                <span className="group-hover:translate-x-1 transition-transform">🏠</span>
              </span>
            </button>
          </header>
          
          <HomeContent />
          
          <footer className="mt-16 text-center text-gray-500">
            <p className="text-lg">Built with Next.js, wagmi, and RainbowKit</p>
            <p className="text-sm mt-2">Empowering Self-Help Groups across Bharat 🇮🇳</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
