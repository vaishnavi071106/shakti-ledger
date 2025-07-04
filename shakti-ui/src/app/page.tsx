'use client';

import dynamic from 'next/dynamic';
import { NavigationBar } from '@/components/NavigationBar';

// Dynamically import the home content that uses wagmi hooks
const HomeContent = dynamic(
  () => import('@/components/HomeContent').then((mod) => ({ default: mod.HomeContent })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Shakti Ledger...</h2>
          <p className="text-gray-600">Initializing blockchain connection</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shakti Ledger
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Empowering Self-Help Groups with decentralized lending, 
            zero-knowledge credit verification, and transparent treasury management
          </p>
          
          {/* Demo Navigation Links - Always visible */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
              📍 Live Demo (connect wallet to unlock full features)
            </div>
            <a 
              href="/simulation" 
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 transition-colors"
            >
              🧪 Create Vault Simulation
            </a>
            <a 
              href="/vault-simulation" 
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium hover:bg-purple-200 transition-colors"
            >
              📊 Vault Dashboard Demo
            </a>
            <a 
              href="/backend-test" 
              className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium hover:bg-orange-200 transition-colors"
            >
              🔧 Backend API Test
            </a>
          </div>
        </header>
        
        <HomeContent />
        
        <footer className="mt-16 text-center text-gray-500">
          <p>Built with Next.js, wagmi, and RainbowKit</p>
        </footer>
      </div>
    </div>
  );
}
