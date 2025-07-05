'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, ArrowRight, ChevronDown, Users, MapPin, Heart, TrendingUp, 
  Star, Shield, Zap, Globe, Award, Sparkles, CheckCircle, 
  CircleDollarSign, Clock, BarChart3, Play, X
} from 'lucide-react';

// Animated Counter Component
const CountUp = ({ end, duration = 2, prefix = '', suffix = '', decimals = 0 }: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * end * Math.pow(10, decimals)) / Math.pow(10, decimals);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, decimals, isVisible]);
  
  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
};

// Modern Hero Section
const ModernHero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs with Parallax */}
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-pink-500 rounded-full filter blur-[128px] opacity-30 animate-pulse"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-purple-600 rounded-full filter blur-[128px] opacity-30 animate-pulse"
          style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`, animationDelay: '2s' }}
        />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 grid-pattern" />
        
        {/* Floating Tech Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-slow opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${20 + i * 2}s`
              }}
            >
              <div className="w-px h-20 bg-gradient-to-b from-transparent via-white to-transparent" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen py-20 flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              {/* Badge */}
              <div 
                className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm text-white/90 mb-8 transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>J3D.ai × Women in Ethereum</span>
              </div>
              
              {/* Main Heading */}
              <h1
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Empowering
                </span>
                <br />
                <span className="text-white">100 Million</span>
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Indian Women</span>
              </h1>
              
              {/* Tagline */}
              <p
                className={`text-lg sm:text-xl md:text-2xl text-white/80 mb-2 transition-all duration-1000 delay-200 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                Finance <span className="text-yellow-400 font-bold">मोहताज</span> नहीं,
                Shakti <span className="text-yellow-400 font-bold">मोहताज</span> है
              </p>
              
              <p
                className={`text-base sm:text-lg text-white/60 mb-8 transition-all duration-1000 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                Transform your Self-Help Group with blockchain in 60 seconds
              </p>
              
              {/* Feature Pills */}
              <div 
                className={`flex flex-wrap gap-3 mb-8 transition-all duration-1000 delay-400 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                {[
                  { icon: <Zap className="w-4 h-4" />, text: "Gasless Transactions" },
                  { icon: <Shield className="w-4 h-4" />, text: "ZK Privacy" },
                  { icon: <Globe className="w-4 h-4" />, text: "Multi-lingual" }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm text-white/90">
                    <span className="text-yellow-400">{feature.icon}</span>
                    {feature.text}
                  </div>
                ))}
              </div>
              
              {/* CTA Buttons */}
              <div 
                className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <button 
                  onClick={() => window.location.href = '/simulation'}
                  className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center gap-3">
                    <Wallet className="w-5 h-5" />
                    Launch Your Vault
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button 
                  onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group px-6 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </span>
                </button>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className={`relative order-1 lg:order-2 transition-all duration-1000 delay-600 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              {/* 3D Card Stack */}
              <div className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center">
                {/* Background Cards */}
                <div className="absolute w-72 sm:w-80 h-44 sm:h-48 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl transform rotate-6 translate-x-4 translate-y-4 opacity-60" />
                <div className="absolute w-72 sm:w-80 h-44 sm:h-48 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl transform -rotate-6 -translate-x-4 -translate-y-4 opacity-60" />
                
                {/* Main Card */}
                <div className="relative w-72 sm:w-80 h-44 sm:h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">Mahila Pragati SHG</h3>
                        <p className="text-white/60 text-sm">12 Members • Rajasthan</p>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/60 text-xs">Pool Balance</p>
                        <p className="text-white font-bold text-lg">₹45,600</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Credit Score</p>
                        <p className="text-green-400 font-bold text-lg">A+ (92)</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated Accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x" />
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-pink-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
        <ChevronDown className="w-8 h-8" />
      </div>
    </section>
  );
};

// Demo Navigation Section
const DemoNavigationSection = () => {
  return (
    <section id="demo-section" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Try <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Live Demo</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the power of decentralized SHG management
          </p>
        </div>

        {/* Demo Navigation Links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              href: "/simulation",
              title: "Create Vault Simulation",
              description: "Experience vault creation flow",
              icon: "🧪",
              color: "from-green-500 to-emerald-600"
            },
            {
              href: "/vault-simulation", 
              title: "Vault Dashboard Demo",
              description: "Explore member management",
              icon: "📊",
              color: "from-purple-500 to-indigo-600"
            },
            {
              href: "/backend-test",
              title: "Backend API Test", 
              description: "Test infrastructure APIs",
              icon: "🔧",
              color: "from-orange-500 to-red-600"
            },
            {
              href: "#connect",
              title: "Connect Wallet",
              description: "Access full features",
              icon: "🔗",
              color: "from-blue-500 to-cyan-600"
            }
          ].map((demo, i) => (
            <a
              key={i}
              href={demo.href}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${demo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className="text-4xl mb-4">{demo.icon}</div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{demo.title}</h3>
              <p className="text-gray-600 mb-4">{demo.description}</p>
              
              {/* Hover Arrow */}
              <div className="flex items-center text-gray-400 group-hover:text-gray-600 transition-all duration-300">
                <span className="text-sm font-medium mr-2">Try Now</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// Impact Stats Section
const ImpactStats = () => {
  const stats = [
    { 
      icon: <Users className="w-8 h-8" />, 
      value: 12847, 
      label: "Women Empowered",
      color: "from-pink-500 to-rose-600",
      suffix: "+"
    },
    { 
      icon: <CircleDollarSign className="w-8 h-8" />, 
      value: 2.5, 
      label: "Crore Disbursed",
      color: "from-purple-500 to-indigo-600",
      prefix: "₹",
      suffix: "Cr",
      decimals: 1
    },
    { 
      icon: <TrendingUp className="w-8 h-8" />, 
      value: 98.5, 
      label: "Repayment Rate",
      color: "from-emerald-500 to-teal-600",
      suffix: "%",
      decimals: 1
    },
    { 
      icon: <MapPin className="w-8 h-8" />, 
      value: 12, 
      label: "States Active",
      color: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <section className="py-20 relative z-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className="bg-white rounded-2xl shadow-xl p-6 transform hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
                <CountUp 
                  end={stat.value} 
                  duration={2.5}
                  prefix={stat.prefix || ''}
                  suffix={stat.suffix || ''}
                  decimals={stat.decimals || 0}
                />
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Modern Features Section
const ModernFeatures = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Gasless Transactions",
      description: "Zero fees for SHG members with Account Abstraction",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "ZK Privacy Protection",
      description: "Financial data secured with zero-knowledge proofs",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "30-Second Loans",
      description: "Instant micro-credit through smart contracts",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-lingual Support",
      description: "Available in Hindi, Telugu, Tamil and more",
      gradient: "from-green-400 to-teal-500"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "AI Credit Scoring",
      description: "J3D.ai powered alternative data analysis",
      gradient: "from-pink-400 to-red-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Track impact and growth transparently",
      gradient: "from-indigo-400 to-purple-500"
    }
  ];

  return (
    <section id="features-section" className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Built for <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Bharat</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Modern fintech infrastructure designed specifically for India's Self-Help Groups
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              
              {/* Hover Arrow */}
              <div className="absolute bottom-6 right-6 text-gray-400 group-hover:text-gray-600 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { ModernHero, DemoNavigationSection, ImpactStats, ModernFeatures };
