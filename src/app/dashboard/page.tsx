// Update dashboard/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TattvaOutput } from '../types/outputModels';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [reports, setReports] = useState<TattvaOutput[]>([]);
  const [selectedReport, setSelectedReport] = useState<TattvaOutput | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleNewAnalysis = () => {
    // This would navigate to a new analysis page in a real app
    console.log('Starting new analysis...');
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Dashboard 
      reports={reports}
      onNewAnalysis={handleNewAnalysis}
      onSelectReport={setSelectedReport}
      selectedReport={selectedReport}
    />
  );
}