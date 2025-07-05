'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Menu, X, Wallet, Sparkles, ChevronDown, Globe, 
  Shield, Zap, Users, ArrowRight, Activity, BarChart3,
  Heart, Star, Crown
} from 'lucide-react';

// Dynamically import ConnectButton to avoid SSR issues
const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => ({ default: mod.ConnectButton })),
  { ssr: false }
);

export const ModernNavigationBar = () => {
  const isMounted = useIsMounted();
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect to old page when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      // Small delay to ensure connection is fully established
      setTimeout(() => {
        router.push('/?connected=true');
      }, 1000);
    }
  }, [isConnected, address, router]);

  if (!isMounted) {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl py-4' : 'bg-transparent py-6'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-white">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🏛️</span>
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
                  Shakti Ledger
                </span>
                <span className="text-xs text-purple-300 font-normal">Loading...</span>
              </div>
            </Link>
            <div className="bg-white/10 animate-pulse h-12 w-36 rounded-full"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-xl py-4 shadow-lg shadow-purple-500/10' 
          : 'bg-transparent py-6'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo with animation */}
            <Link 
              href="/" 
              className="flex items-center gap-3 text-2xl font-bold text-white group"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                  <span className="text-xl">🏛️</span>
                </div>
                {isHovering && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl blur-xl opacity-50 animate-pulse -z-10"></div>
                )}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Crown className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
                  Shakti Ledger
                </span>
                <span className="text-xs text-purple-300 font-normal">Empowering Women</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              {/* Enhanced Wallet Connection */}
              <div className="flex items-center">
                {isConnected && address ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                        <span className="text-xs text-green-400 font-bold">LIVE</span>
                      </div>
                      <div className="w-px h-4 bg-white/20"></div>
                      <span className="text-sm font-mono text-white">
                        {`${address.slice(0, 6)}...${address.slice(-4)}`}
                      </span>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <Star key={i} className="w-2 h-2 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Activity className="w-4 h-4 animate-pulse" />
                      <span>Redirecting...</span>
                    </div>
                  </div>
                ) : (
                  <div className="modern-connect-wrapper">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 blur transition-all duration-300"></div>
                      <div className="relative">
                        <ConnectButton />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative text-white p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="relative w-6 h-6">
                  <div className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'rotate-45 scale-0' : 'rotate-0 scale-100'}`}>
                    <Menu className="w-6 h-6" />
                  </div>
                  <div className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'rotate-0 scale-100' : '-rotate-45 scale-0'}`}>
                    <X className="w-6 h-6" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="mt-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                <div className="p-6">
                  {/* Mobile Wallet Connection */}
                  <div>
                    {isConnected && address ? (
                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400 font-bold">CONNECTED</span>
                        </div>
                        <div className="w-px h-4 bg-white/20"></div>
                        <span className="text-sm font-mono text-white">
                          {`${address.slice(0, 6)}...${address.slice(-4)}`}
                        </span>
                        <div className="flex gap-1 ml-auto">
                          {[...Array(3)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-300"></div>
                        <div className="relative">
                          <ConnectButton />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Global Styles */}
      <style jsx global>{`
        .modern-connect-wrapper button {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8)) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3) !important;
        }
        
        .modern-connect-wrapper button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 30px rgba(168, 85, 247, 0.4) !important;
        }
        
        .modern-connect-wrapper [data-testid="rk-connect-button"] {
          color: white !important;
        }
      `}</style>
    </>
  );
};
