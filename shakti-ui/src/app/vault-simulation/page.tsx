'use client';

import dynamic from 'next/dynamic';
import { NavigationBar } from '@/components/NavigationBar';

// Dynamically import the simulation component
const VaultDashboardSimulation = dynamic(
  () => import('@/components/VaultDashboardSimulation').then((mod) => ({ default: mod.VaultDashboardSimulation })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Vault Dashboard...</h2>
          <p className="text-gray-600">Preparing simulation environment</p>
        </div>
      </div>
    ),
  }
);

export default function VaultSimulationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <VaultDashboardSimulation />
      </div>
    </div>
  );
}
