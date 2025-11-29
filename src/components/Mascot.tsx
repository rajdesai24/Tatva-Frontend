// src/components/Mascot.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// In src/components/Mascot.tsx
export type ExpressionType = 'idle' | 'thinking' | 'happy' | 'excited';

interface MascotProps {
  expression?: ExpressionType;
  isActive: boolean;
}


export default function Mascot({ expression, isActive }: MascotProps) {
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [showThoughtBubble, setShowThoughtBubble] = useState(false);
  const [thoughtText, setThoughtText] = useState('');

  const expressions = {
    idle: (
      <g id="face">
        <circle cx="30" cy="25" r="3" fill="#2D3748" />
        <circle cx="50" cy="25" r="3" fill="#2D3748" />
        <path d="M30 35 Q40 45 50 35" stroke="#2D3748" strokeWidth="2" fill="none" />
      </g>
    ),
    thinking: (
      <g id="face">
        <circle cx="28" cy="25" r="3" fill="#2D3748" />
        <circle cx="52" cy="25" r="3" fill="#2D3748" />
        <path d="M35 38 Q40 33 45 38" stroke="#2D3748" strokeWidth="2" fill="none" />
      </g>
    ),
    happy: (
      <g id="face">
        <circle cx="30" cy="25" r="3" fill="#2D3748" />
        <circle cx="50" cy="25" r="3" fill="#2D3748" />
        <path d="M30 35 Q40 45 50 35" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ),
    excited: (
      <g id="face">
        <circle cx="28" cy="25" r="3" fill="#2D3748" />
        <circle cx="52" cy="25" r="3" fill="#2D3748" />
        <path d="M30 40 Q40 50 50 40" stroke="#2D3748" strokeWidth="2" fill="none" />
      </g>
    )
  };

  const thoughts = [
    "Let me check that...",
    "Interesting finding!",
    "Analyzing...",
    "Almost there!",
    "Great progress!",
    "Fascinating!",
    "One moment...",
    "Checking sources..."
  ];

  useEffect(() => {
    if (!isActive) return;

    // Change expression every 3-7 seconds
    const expressionTimer = setInterval(() => {
      const keys = Object.keys(expressions);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setCurrentAnimation(randomKey);
    }, 3000 + Math.random() * 4000);

    // Show thought bubble randomly
    const thoughtTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        setShowThoughtBubble(true);
        setThoughtText(thoughts[Math.floor(Math.random() * thoughts.length)]);
        setTimeout(() => {
          setShowThoughtBubble(false);
        }, 2000);
      }
    }, 5000);

    return () => {
      clearInterval(expressionTimer);
      clearInterval(thoughtTimer);
    };
  }, [isActive]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
    }`}>
      <AnimatePresence>
        {showThoughtBubble && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
            className="absolute bottom-full right-0 mb-4 w-48 bg-white rounded-lg shadow-lg p-3 text-sm text-gray-800"
          >
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white transform rotate-45"></div>
            {thoughtText}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-20 h-20 bg-indigo-500 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden"
          animate={{
            y: [0, -5, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
        >
          {/* Owl Body */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Body */}
            <circle cx="40" cy="40" r="35" fill="#4F46E5" />
            
            {/* Wings */}
            <motion.path
              d="M20 40 Q10 35 20 30 Q25 25 20 15"
              stroke="#4338CA"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.path
              d="M60 40 Q70 35 60 30 Q55 25 60 15"
              stroke="#4338CA"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            
            {/* Face */}
            <circle cx="30" cy="30" r="15" fill="white" />
            <circle cx="50" cy="30" r="15" fill="white" />
            
            {/* Eyes */}
            <motion.circle 
              cx="30" 
              cy="30" 
              r="8" 
              fill="#1F2937"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.circle 
              cx="50" 
              cy="30" 
              r="8" 
              fill="#1F2937"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.3
              }}
            />
            
            {/* Expression */}
            {expressions[currentAnimation as keyof typeof expressions] || expressions.idle}
            
            {/* Beak */}
            <path d="M35 45 L45 45 L40 35 Z" fill="#F59E0B" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}