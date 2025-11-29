// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { TattvaOutput, VerdictLabel, ClaimType } from './types/outputModels';
import InteractiveReport from '@/components/InteractiveReport';

const sampleReport: TattvaOutput = {
  limitations: [],
  summary: "The analyzed content makes several claims about climate change impacts, with varying degrees of accuracy. While some statements are well-supported by scientific consensus, others contain exaggerations or oversimplifications.",
  tattva_score: 78.5,
  claims: [
    {
      id: 'claim-1',
      text: "Global temperatures have risen by 2°C since the pre-industrial era.",
      type: ClaimType.FACT,
      prominence: 0.9,
      time_refs: [],
      named_entities: ["global temperatures", "pre-industrial era"],
      query_plan: [
        { query: "global temperature rise since pre-industrial era", evidence_type: "scientific_studies" },
        { query: "IPCC reports on global warming", evidence_type: "reports" }
      ],
      verdict: {
        label: VerdictLabel.MOSTLY_TRUE,
        truth_prob: 0.85,
        truth_prob_cal: 0.87,
        explanation: "While global temperatures have risen significantly, the actual increase is closer to 1.1-1.2°C as of 2023, not 2°C.",
        citations: [
          {
            title: "IPCC Sixth Assessment Report",
            url: "https://www.ipcc.ch/report/ar6/wg1/",
            publisher: "Intergovernmental Panel on Climate Change",
            date: "2021-2023"
          }
        ],
        gaps: ["The exact time period for the temperature increase is not specified"],
        modalities_check: {
          ooc_risk: false,
          notes: "The claim is verifiable against climate data"
        }
      },
      evidence_strength: 0.9
    }
  ],
  reality_distance: {
    status: "ok",
    value: 82,
    notes: "The content shows a clear environmentalist perspective, which may lead to selective presentation of facts."
  },
  bias_context: {
    bias_signals: ["alarmist language", "oversimplification of complex issues"],
    rhetoric: ["appeal to authority", "slippery slope"],
    missing_context: [
      "Does not mention technological advancements in carbon capture",
      "Ignores regional variations in climate impacts"
    ],
    notes: "The content shows a clear environmentalist perspective, which may lead to selective presentation of facts."
  }
};

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [mediaUrl, setMediaUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<TattvaOutput | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setReport(sampleReport);
      setShowReport(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (showReport && report) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => setShowReport(false)} 
            className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to analysis
          </button>
          <InteractiveReport report={report} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-600">Tattva</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Informed Opinions</h2>
          <p className="text-gray-600 mb-8">Get insights and analysis on any media content</p>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Paste a YouTube, Twitter, or article link..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required
            />
            <button
              type="submit"
              disabled={isAnalyzing}
              className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${
                isAnalyzing
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Try with any YouTube, Instagram, Twitter, or news article link
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}