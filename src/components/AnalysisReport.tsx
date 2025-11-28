'use client';

import { VerdictLabel, ClaimType, TattvaOutput, Verdict, Claim } from '@/app/types/outputModels';
import { useState } from 'react';

// Helper component for the verdict badge
const VerdictBadge = ({ label }: { label: VerdictLabel }) => {
  const getVerdictStyle = () => {
    switch (label) {
      case 'true':
        return 'bg-green-100 text-green-800';
      case 'mostly_true':
        return 'bg-green-50 text-green-700';
      case 'mixed':
        return 'bg-yellow-50 text-yellow-800';
      case 'mostly_false':
        return 'bg-orange-50 text-orange-700';
      case 'false':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerdictText = () => {
    return label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerdictStyle()}`}>
      {getVerdictText()}
    </span>
  );
};

// Helper component for the progress bar
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
}

const ProgressBar = ({ value, max = 100, color = 'indigo', className = '' }: ProgressBarProps) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div 
      className={`h-2.5 rounded-full ${
        color === 'green' ? 'bg-green-600' :
        color === 'red' ? 'bg-red-600' :
        color === 'yellow' ? 'bg-yellow-500' :
        color === 'blue' ? 'bg-blue-600' :
        color === 'purple' ? 'bg-purple-600' :
        'bg-indigo-600'
      }`} 
      style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
    ></div>
  </div>
);

// Main Analysis Report Component
export const AnalysisReport = ({ report }: { report: TattvaOutput }) => {
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);

  const toggleClaim = (claimId: string) => {
    setExpandedClaim(expandedClaim === claimId ? null : claimId);
  };

  // Calculate statistics
  const totalClaims = report.claims.length;
  const trueClaims = report.claims.filter(c => 
    ['true', 'mostly_true'].includes(c.verdict.label)
  ).length;
  const falseClaims = report.claims.filter(c => 
    ['false', 'mostly_false'].includes(c.verdict.label)
  ).length;
  const mixedClaims = report.claims.filter(c => 
    c.verdict.label === 'mixed'
  ).length;

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Summary</h2>
        <p className="text-gray-600 mb-6">{report.summary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{report.tattva_score.toFixed(1)}</div>
            <div className="text-sm text-blue-800">Tattva Score</div>
            <ProgressBar value={report.tattva_score} color="blue" className="mt-2" />
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {Math.round((trueClaims / totalClaims) * 100)}%
            </div>
            <div className="text-sm text-green-800">Verified Claims</div>
            <ProgressBar value={(trueClaims / totalClaims) * 100} color="green" className="mt-2" />
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {report.reality_distance.value.toFixed(1)}/100
            </div>
            <div className="text-sm text-purple-800">Reality Distance</div>
            <ProgressBar value={report.reality_distance.value} color="purple" className="mt-2" />
          </div>
        </div>
      </div>

      {/* Claims Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Claims Analysis</h2>
        
        {report.claims.map((claim) => (
          <div key={claim.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div 
              className="flex justify-between items-start cursor-pointer"
              onClick={() => toggleClaim(claim.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <VerdictBadge label={claim.verdict.label} />
                  <span className="text-sm text-gray-500">
                    {claim.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">{claim.text}</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                {expandedClaim === claim.id ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
            
            {expandedClaim === claim.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Explanation</h4>
                    <p className="text-gray-600 text-sm">{claim.verdict.explanation}</p>
                    
                    {claim.verdict.citations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Sources</h4>
                        <div className="space-y-2">
                          {claim.verdict.citations.map((citation, idx) => (
                            <a
                              key={idx}
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:underline"
                            >
                              {citation.title} - {citation.publisher}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Confidence</span>
                        <span>{(claim.verdict.truth_prob * 100).toFixed(0)}%</span>
                      </div>
                      <ProgressBar value={claim.verdict.truth_prob * 100} />
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Evidence Strength</span>
                        <span>{(claim.evidence_strength * 100).toFixed(0)}%</span>
                      </div>
                      <ProgressBar 
                        value={claim.evidence_strength * 100} 
                        color={claim.evidence_strength > 0.7 ? 'green' : claim.evidence_strength > 0.4 ? 'yellow' : 'red'} 
                      />
                    </div>
                    
                    {claim.verdict.gaps.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Information Gaps</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                          {claim.verdict.gaps.map((gap, idx) => (
                            <li key={idx}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Bias Context */}
      {report.bias_context && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Context & Bias Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Bias Signals</h3>
              <div className="flex flex-wrap gap-2">
                {report.bias_context.bias_signals.map((signal, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {signal}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Rhetorical Devices</h3>
              <div className="flex flex-wrap gap-2">
                {report.bias_context.rhetoric.map((rhetoric, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {rhetoric}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {report.bias_context.missing_context.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Missing Context</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                {report.bias_context.missing_context.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {report.bias_context.notes && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Analysis Notes</h4>
              <p className="text-blue-700 text-sm">{report.bias_context.notes}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Limitations */}
      {report.limitations && report.limitations.length > 0 && (
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
          <h3 className="font-medium text-yellow-800 mb-2">Analysis Limitations</h3>
          <ul className="list-disc pl-5 text-yellow-700 space-y-1 text-sm">
            {report.limitations.map((limitation, idx) => (
              <li key={idx}>{limitation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisReport;
