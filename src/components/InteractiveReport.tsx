// src/components/InteractiveReport.tsx
'use client';

import { useEffect, useState } from 'react';
import { TattvaOutput } from '@/app/types/outputModels';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot, { ExpressionType } from './Mascot';

interface Step {
  id: string;
  title: string;
  content: React.ReactNode;
  delay: number;
}

interface InteractiveReportProps {
  report: TattvaOutput;
}

const MascotMessage = ({ message, isTyping }: { message: string; isTyping: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-3 mb-6"
  >
    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
      <span className="text-2xl">🦉</span>
    </div>
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-[80%]">
      <p className="text-gray-800">
        {message}
        {isTyping && <span className="ml-1 animate-pulse">|</span>}
      </p>
    </div>
  </motion.div>
);

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="mb-8"
  >
    {children}
  </motion.div>
);

const ClaimCard = ({ claim, index }: { claim: any; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-3 hover:shadow-md transition-shadow"
  >
    <p className="text-gray-700">{claim.text}</p>
  </motion.div>
);

export default function InteractiveReport({ report }: InteractiveReportProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [mascotExpression, setMascotExpression] = useState<ExpressionType>('thinking');

  const isPositiveReport = report.tattva_score > 70;

  useEffect(() => {
    if (isPositiveReport) {
      setMascotExpression('happy');
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPositiveReport]);

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return 'bg-green-100 text-green-800';
      case 'MOSTLY_TRUE': return 'bg-green-50 text-green-700';
      case 'MIXED': return 'bg-yellow-50 text-yellow-800';
      case 'MOSTLY_FALSE': return 'bg-orange-50 text-orange-800';
      case 'FALSE': return 'bg-red-50 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const steps: Step[] = [
    {
      id: 'overview',
      title: 'Analysis Overview',
      content: (
        <AnimatedSection>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Content Analysis</h2>
                <p className="opacity-90">Here's what we found in your content</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{Math.round(report.tattva_score)}</div>
                <div className="text-sm opacity-90">Tattva Score</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Claims Analyzed</div>
              <div className="text-2xl font-bold text-indigo-600">{report.claims.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Overall Verdict</div>
              <div className="text-xl font-semibold text-gray-800">
                {report.claims[0]?.verdict?.label || 'N/A'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Confidence</div>
              <div className="text-2xl font-bold text-green-500">
                {Math.round((report.claims[0]?.verdict?.truth_prob || 0) * 100)}%
              </div>
            </div>
          </div>
        </AnimatedSection>
      ),
      delay: 2000,
    },
    {
      id: 'claims',
      title: 'Detailed Analysis',
      content: (
        <AnimatedSection delay={0.2}>
          <h3 className="font-semibold text-xl text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3">
              🔍
            </span>
            Claims Analysis
          </h3>
          <div className="space-y-4">
            {report.claims.map((claim, i) => (
              <motion.div
                key={`claim-${claim.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-800">Claim: {claim.text}</h4>
                  <span className={`px-3 py-1 text-sm rounded-full ${getVerdictColor(claim.verdict.label)}`}>
                    {claim.verdict.label.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Confidence</span>
                    <span>{Math.round(claim.verdict.truth_prob * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      className={`h-full rounded-full ${
                        claim.verdict.truth_prob > 0.7 ? 'bg-green-500' : 
                        claim.verdict.truth_prob > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${claim.verdict.truth_prob * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </div>
                </div>
                {claim.verdict.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                    {claim.verdict.explanation}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      ),
      delay: 3000,
    },
    {
      id: 'summary',
      title: 'Final Report',
      content: (
        <AnimatedSection delay={0.4}>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white mb-6">
            <h3 className="text-2xl font-bold mb-2">Final Report</h3>
            <p className="opacity-90">Here's our comprehensive analysis</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-lg text-gray-800 mb-3">Summary</h4>
              <p className="text-gray-700 mb-4">{report.summary}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-700 mb-2">Reality Distance</h4>
                <div className="flex items-center">
                  <div className="w-3/4">
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <motion.div
                        className={`h-full rounded-full ${
                          report.reality_distance.value > 70 ? 'bg-green-500' : 
                          report.reality_distance.value > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${report.reality_distance.value}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-lg font-semibold">
                    {report.reality_distance.value}/100
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-lg text-gray-800 mb-3">Bias Analysis</h4>
              
              {report.bias_context && (
                <>
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Bias Signals</h5>
                    <div className="flex flex-wrap gap-2">
                      {report.bias_context.bias_signals.map((signal, i) => (
                        <span key={i} className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm rounded-full">
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Rhetoric</h5>
                    <div className="flex flex-wrap gap-2">
                      {report.bias_context.rhetoric.map((r, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {report.bias_context.missing_context && report.bias_context.missing_context.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Missing Context</h5>
                      <ul className="space-y-2">
                        {report.bias_context.missing_context.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {isPositiveReport && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-100 text-center"
            >
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Great Job!</h3>
              <p className="text-green-700">Your content shows strong alignment with factual information!</p>
            </motion.div>
          )}
        </AnimatedSection>
      ),
      delay: 2000,
    },
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      
      // Show typing indicator
      setIsTyping(true);
      
      // After delay, show the content
      const typingTimer = setTimeout(() => {
        setIsTyping(false);
        setVisibleSections(prev => ({ ...prev, [step.id]: true }));
        
        // Move to next step after showing content
        const nextStepTimer = setTimeout(() => {
          if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
          }
        }, step.delay);
        
        return () => clearTimeout(nextStepTimer);
      }, 1000); // Typing duration
      
      return () => clearTimeout(typingTimer);
    }
  }, [currentStep, steps.length]);

  const messages = [
    "🔍 Analyzing your content...",
    "🧠 Processing claims and evidence...",
    "📊 Generating insights...",
    "✨ Almost there...",
    isPositiveReport 
      ? "🎉 Great news! Your content looks solid!" 
      : "🔍 Found some areas that might need attention..."
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 relative min-h-screen">
      <Mascot expression={mascotExpression} isActive={true} />
      
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="text-6xl"
          >
            🎉
          </motion.div>
        </div>
      )}
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          {steps.map((step, index) => (
            <div key={step.id} className={index > 0 ? 'mt-12' : ''}>
              {visibleSections[step.id] && step.content}
            </div>
          ))}
          
          {isTyping && (
            <MascotMessage 
              message={messages[Math.min(currentStep, messages.length - 1)]} 
              isTyping={isTyping} 
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}