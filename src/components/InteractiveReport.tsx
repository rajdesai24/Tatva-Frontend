// src/components/InteractiveReport.tsx
'use client';

import { useEffect, useState } from 'react';
import { TattvaOutput } from '@/app/types/outputModels';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from './Mascot';

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

  const steps: Step[] = [
    {
      id: 'claims',
      title: 'Extracting Claims',
      content: (
        <AnimatedSection>
          <h3 className="font-semibold text-xl text-gray-800 mb-4 flex items-center">
            <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-2">
              1
            </span>
            Claims Found
          </h3>
          <div className="space-y-3">
            {report.claims.map((claim, i) => (
              <ClaimCard key={claim.id} claim={claim} index={i} />
            ))}
          </div>
        </AnimatedSection>
      ),
      delay: 2000,
    },
    {
      id: 'analysis',
      title: 'Analyzing Evidence',
      content: (
        <AnimatedSection delay={0.2}>
          <h3 className="font-semibold text-xl text-gray-800 mb-4 flex items-center">
            <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-2">
              2
            </span>
            Evidence Analysis
          </h3>
          <div className="space-y-4">
            {report.claims.map((claim, i) => (
              <motion.div
                key={`evidence-${claim.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="p-4 bg-white rounded-xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{claim.text}</span>
                  <span className="text-sm px-2 py-1 bg-green-50 text-green-700 rounded-full">
                    {claim.verdict.label}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${claim.verdict.truth_prob * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  />
                </div>
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
          <h3 className="font-semibold text-xl text-gray-800 mb-4 flex items-center">
            <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-2">
              3
            </span>
            Summary
          </h3>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-700 mb-4">{report.summary}</p>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Tattva Score</span>
              <motion.span
                className="text-3xl font-bold text-indigo-600"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(report.tattva_score)}/100
              </motion.span>
            </div>
          </div>
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
      }, 1500); // Typing duration
      
      return () => clearTimeout(typingTimer);
    }
  }, [currentStep, steps.length]);

  const messages = [
    "Let's analyze this content together! 🚀",
    "First, I'm identifying the key claims...",
    "Now, I'm checking the evidence for each claim...",
    "Analyzing the overall context and bias...",
    "Putting it all together for you...",
    "Here's what I found! 🎉"
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 relative min-h-screen">
      <Mascot isActive={true} />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis in Progress</h2>
          <p className="text-gray-600">We're carefully examining the content...</p>
        </motion.div>
      </AnimatePresence>

      <div className="space-y-12">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: visibleSections[step.id] ? 1 : 0.5,
              y: visibleSections[step.id] ? 0 : 20,
              scale: visibleSections[step.id] ? 1 : 0.98
            }}
            transition={{ 
              duration: 0.5,
              delay: visibleSections[step.id] ? i * 0.15 : 0
            }}
            className={`transition-all duration-300 ${
              visibleSections[step.id] ? 'opacity-100' : 'opacity-50'
            }`}
          >
            {step.content}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {currentStep < steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center px-6 py-3 bg-indigo-50 text-indigo-600 rounded-full">
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mr-2"
              >
                ↓
              </motion.div>
              <span>Analyzing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-700">Progress</h3>
            <p className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <div className="w-48 bg-gray-100 rounded-full h-2">
            <motion.div
              className="h-full bg-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentStep + 1) / steps.length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}