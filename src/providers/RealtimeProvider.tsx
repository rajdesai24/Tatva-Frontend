// src/providers/RealtimeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase/client';
import { TattvaOutput } from '@/app/types/outputModels';

interface RealtimeContextType {
  report: Partial<TattvaOutput> | null;
  setReport: (report: Partial<TattvaOutput> | null) => void;
  mediaUrl: string | null;
  setMediaUrl: (url: string | null) => void;
  clearMediaUrl: () => void;  // Add this line
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [report, setReport] = useState<Partial<TattvaOutput> | null>(null);
  const [mediaUrl, setMediaUrlState] = useState<string | null>(() => {
    // Load mediaUrl from localStorage on initial render
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tattva_media_url');
    }
    return null;
  });

  // Update localStorage when mediaUrl changes
  useEffect(() => {
    if (mediaUrl) {
      localStorage.setItem('tattva_media_url', mediaUrl);
    } else {
      localStorage.removeItem('tattva_media_url');
    }
  }, [mediaUrl]);

   // Set up realtime subscription
  useEffect(() => {
    if (!user?.id || !mediaUrl) return;

    console.log('Setting up realtime subscription for user:', user.id, 'media:', mediaUrl);

    const channel = supabase
      .channel('report_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports',
          filter: `and(clerk_user_id.eq.${user.id},media_url.eq.${mediaUrl})`
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          const updatedReport = payload.new as Partial<TattvaOutput>;
          const parsedReport = parseReportData(updatedReport);
          console.log('Parsed report data:', parsedReport);
          setReport(prev => ({
            ...prev,
            ...parsedReport,
            updated_at: new Date().toISOString()
          }));
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, mediaUrl]);

  const setMediaUrl = (url: string | null) => {
    console.log('Updating mediaUrl to:', url);
    setMediaUrlState(url);
    // Reset report when mediaUrl changes
    if (url === null) {
      setReport(null);
    }
  };

  const clearMediaUrl = () => {
    console.log('Clearing media URL from localStorage');
    localStorage.removeItem('tattva_media_url');
    setMediaUrlState(null);
  };

  return (
    <RealtimeContext.Provider value={{ report, setReport, mediaUrl, setMediaUrl, clearMediaUrl }}>
      {children}
    </RealtimeContext.Provider>
  );
}

// Helper function to parse report data
function parseReportData(report: any): Partial<TattvaOutput> {
  return Object.entries(report).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      try {
        acc[key] = JSON.parse(value);
      } catch {
        acc[key] = value;
      }
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
}

// Custom hook to use the realtime context
export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}