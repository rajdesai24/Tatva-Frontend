'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase/client';
import InteractiveReport from '@/components/InteractiveReport';
import { useRealtime } from '@/providers/RealtimeProvider';
import { report } from 'process';

export default function Home() {
  const { user } = useUser();
  const { mediaUrl, setMediaUrl, clearMediaUrl } = useRealtime();
  const [inputUrl, setInputUrl] = useState(mediaUrl || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');


  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAnalyzing(true);

    try {
      // Set the media URL in the context (will be saved to localStorage)
      setMediaUrl(inputUrl);

      // Call the fact-check API
    const response = await fetch('https://8f85c42d9c81.ngrok-free.app/api/v1/fact-check-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: inputUrl,
        clerk_user_id: user?.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    } catch (err) {
      console.error('Error creating report:', err);
      setError('Failed to start analysis. Please try again.');
      setIsAnalyzing(false);
      clearMediaUrl();
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Tattva Analysis</h1>

        {!mediaUrl ? (
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Media URL
              </label>
              <input
                type="url"
                id="mediaUrl"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${isAnalyzing
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Analysis Results</h2>
              <button
                onClick={() => {
                  clearMediaUrl();
                  setInputUrl('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                New Analysis
              </button>
            </div>
            <InteractiveReport />
          </div>
        )}
      </div>
    </main>
  );
}