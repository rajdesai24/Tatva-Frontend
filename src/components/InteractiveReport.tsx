// components/InteractiveReport.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot, { ExpressionType } from './Mascot';
import { useRealtime } from '@/providers/RealtimeProvider';
import { TattvaOutput, Claim, Verdict, Scores, BiasContext } from '@/app/types/outputModels';

export default function InteractiveReport() {
  const { report } = useRealtime();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<{status: string; message: string} | null>(null);

  useEffect(() => {
    if (report) {
      setLoading(false);
      if (report.logs) {
        try {
          setLogs(typeof report.logs === 'string' ? JSON.parse(report.logs) : report.logs);
        } catch {
          setLogs({ status: 'info', message: 'Analysis in progress...' });
        }
      }
    } else {
      setLoading(true);
    }
  }, [report]);

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis...</p>
          {logs && <p className="text-sm text-gray-500 mt-2">{logs.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Status Bar */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-800">Analysis Status</h3>
            <p className="text-sm text-blue-600">
              {report.status === 'completed' ? 'Analysis Complete' : 'Analyzing...'}
            </p>
          </div>
        </div>
      </div>

      {/* Claims Section */}
      <Section title="Claims Analysis">
        <div className="space-y-6">
          {report.claims?.map((claim: Claim) => (
            <div key={claim.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{claim.text}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {claim.type}
                    </span>
                    {claim.named_entities.map((entity, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
                <VerdictBadge verdict={claim.verdict} />
              </div>
              
              {/* Verdict Details */}
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-700">{claim.verdict.explanation}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Confidence</span>
                    <span>{Math.round(claim.verdict.truth_prob * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${claim.verdict.truth_prob * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Verdict Overview */}
      {report.scores && (
        <Section title="Overall Verdict">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard 
              label="Tattva Score" 
              value={report.scores.tattva_score.toFixed(1)} 
              color={getScoreColor(report.scores.tattva_score)}
            />
            <StatCard 
              label="Reality Distance" 
              value={report.scores.reality_distance.value.toFixed(1)}
              description={report.scores.reality_distance.notes}
            />
          </div>
        </Section>
      )}

      {/* Bias Analysis */}
      {report.bias_context && (
        <Section title="Bias Analysis">
          <div className="space-y-4">
            <p className="text-gray-700">{report.bias_context.notes}</p>
            
            {report.bias_context.rhetoric?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Rhetorical Devices</h4>
                <div className="flex flex-wrap gap-2">
                  {report.bias_context.rhetoric.map((device, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      {device}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {report.bias_context.bias_signals?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Bias Signals</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {report.bias_context.bias_signals.map((signal, i) => (
                    <li key={i}>{signal}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.bias_context.missing_context?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Missing Context</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {report.bias_context.missing_context.map((context, i) => (
                    <li key={i}>{context}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Summary */}
      {report.summary && (
        <Section title="Summary">
          <p className="text-gray-700 whitespace-pre-line">{report.summary}</p>
        </Section>
      )}

      {/* Mascot */}
      <div className="fixed bottom-8 right-8">
        <Mascot 
          isActive={true}
        />
      </div>
    </div>
  );
}

// Helper Components
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-xl shadow-sm"
  >
    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  color?: string;
}

const StatCard = ({ label, value, description, color = 'indigo' }: StatCardProps) => (
  <div className="bg-gray-50 p-4 rounded-lg h-full">
    <div className="text-sm font-medium text-gray-500">{label}</div>
    <div className={`mt-1 text-2xl font-semibold text-${color}-600`}>
      {value}
    </div>
    {description && (
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    )}
  </div>
);

const VerdictBadge = ({ verdict }: { verdict: Verdict }) => {
  const getVerdictStyle = (label: string) => {
    switch (label.toLowerCase()) {
      case 'true':
        return 'bg-green-100 text-green-800';
      case 'false':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getVerdictStyle(verdict.label)}`}>
      {verdict.label}
    </span>
  );
};

const getScoreColor = (score: number) => {
  if (score >= 7) return 'green';
  if (score >= 4) return 'yellow';
  return 'red';
};