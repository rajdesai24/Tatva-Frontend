// src/components/EnhancedDashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from './Mascot';
import { TattvaOutput } from '@/app/types/outputModels';
import { FiSearch, FiPlus, FiAward, FiZap, FiClock, FiHome, FiList, FiFileText } from 'react-icons/fi';

interface UserProgress {
  level: number;
  xp: number;
  nextLevelXp: number;
  streak: number;
  lastActive: string;
  totalAnalyses: number;
  badges: string[];
}

interface MascotMessage {
  id: string;
  text: string;
  isActive: boolean;
}

interface EnhancedDashboardProps {
  reports: TattvaOutput[];
  onNewAnalysis: () => void;
  onSelectReport: (report: TattvaOutput) => void;
  selectedReport: TattvaOutput | null;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  reports = [],
  onNewAnalysis,
  onSelectReport,
  selectedReport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    streak: 1,
    lastActive: new Date().toISOString(),
    totalAnalyses: reports.length,
    badges: reports.length > 0 ? ['first_analysis'] : []
  });
  const [mascotMessages, setMascotMessages] = useState<MascotMessage[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useUser();

  // Add mascot message
  const addMascotMessage = useCallback((text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      isActive: true
    };
    
    // Set previous messages to inactive
    setMascotMessages(prev => 
      prev.map(msg => ({ ...msg, isActive: false }))
    );
    
    // Add new active message
    setMascotMessages(prev => [...prev, newMessage]);
    
    // Auto-remove message after delay
    setTimeout(() => {
      setMascotMessages(prev => 
        prev.filter(msg => msg.id !== newMessage.id)
      );
    }, 5000);
  }, []);

  // Update streak
  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = new Date(userProgress.lastActive).toISOString().split('T')[0];
    
    if (lastActive === today) return;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    setUserProgress(prev => {
      let newStreak = prev.streak;
      let showMessage = false;
      
      if (lastActive === yesterdayStr) {
        newStreak = prev.streak + 1;
        showMessage = true;
        
        // Award badges for streaks
        if (newStreak === 3) {
          setUserProgress(p => ({
            ...p,
            badges: [...new Set([...p.badges, '3_day_streak'])]
          }));
          addMascotMessage('🏆 New Badge: 3-Day Streak!');
        } else if (newStreak === 7) {
          setUserProgress(p => ({
            ...p,
            badges: [...new Set([...p.badges, 'weekly_champion'])]
          }));
          addMascotMessage('🏆 New Badge: Weekly Champion!');
        }
      } else if (lastActive < yesterdayStr) {
        newStreak = 1;
      }
      
      if (showMessage) {
        addMascotMessage(`🔥 ${newStreak} day streak! Keep it up!`);
      }
      
      return {
        ...prev,
        streak: newStreak,
        lastActive: today
      };
    });
  }, [userProgress.lastActive, userProgress.streak, addMascotMessage]);

  // Add XP
  const addXp = useCallback((amount: number) => {
    setUserProgress(prev => {
      const newXp = prev.xp + amount;
      const xpForNextLevel = prev.nextLevelXp;
      
      if (newXp >= xpForNextLevel) {
        const newLevel = prev.level + 1;
        const newNextLevelXp = Math.floor(xpForNextLevel * 1.5);
        
        addMascotMessage(`🎉 Level Up! You're now level ${newLevel}`);
        
        // Award badges for levels
        if (newLevel === 5) {
          setUserProgress(p => ({
            ...p,
            badges: [...new Set([...p.badges, 'apprentice'])]
          }));
          addMascotMessage('🏆 New Badge: Apprentice!');
        } else if (newLevel === 10) {
          setUserProgress(p => ({
            ...p,
            badges: [...new Set([...p.badges, 'expert'])]
          }));
          addMascotMessage('🏆 New Badge: Expert!');
        }
        
        return {
          ...prev,
          level: newLevel,
          xp: newXp - xpForNextLevel,
          nextLevelXp: newNextLevelXp
        };
      }
      
      return {
        ...prev,
        xp: newXp
      };
    });
  }, [addMascotMessage]);

  // Initial setup
  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('tattvaProgress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setUserProgress(parsed);
      } catch (e) {
        console.error('Failed to parse saved progress', e);
      }
    }
    
    // Add welcome message
    addMascotMessage(`Welcome back, ${user?.firstName || 'Fact Finder'}! Ready to uncover some truths?`);
    
    // Check and update streak
    updateStreak();
    
    // Add some initial XP if this is the first visit
    if (!savedProgress) {
      addXp(10);
    }
    
    // Check for first analysis badge
    if (reports.length > 0 && !userProgress.badges.includes('first_analysis')) {
      setUserProgress(prev => ({
        ...prev,
        badges: [...prev.badges, 'first_analysis']
      }));
      addMascotMessage('🏆 New Badge: First Analysis!');
    }
  }, []);

  // Save progress when it changes
  useEffect(() => {
    localStorage.setItem('tattvaProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Handle new analysis
  const handleNewAnalysis = () => {
    if (searchQuery.trim()) {
      addXp(5);
      addMascotMessage(`Analyzing "${searchQuery.substring(0, 30)}${searchQuery.length > 30 ? '...' : ''}"`);
      onNewAnalysis();
    }
  };

  // Render progress bar
  const renderProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <motion.div 
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ 
          width: `${(userProgress.xp / userProgress.nextLevelXp) * 100}%`,
          transition: { duration: 0.5 }
        }}
      />
    </div>
  );

  // Render the appropriate content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName || 'Fact Finder'}!
              </h1>
              <p className="text-gray-600">What would you like to analyze today?</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Paste a YouTube, Twitter, or article link..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNewAnalysis()}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiSearch className="w-5 h-5" />
              </div>
              <button
                onClick={handleNewAnalysis}
                disabled={!searchQuery.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 rounded-full text-sm font-medium ${
                  searchQuery.trim() 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                Analyze
              </button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Level Card */}
              <motion.div 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Level</h3>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <span className="text-xl font-bold text-indigo-600">{userProgress.level}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{userProgress.xp} XP</span>
                    <span>{userProgress.nextLevelXp} XP</span>
                  </div>
                  {renderProgressBar()}
                  <p className="text-xs text-gray-500 text-right">
                    {userProgress.nextLevelXp - userProgress.xp} XP to next level
                  </p>
                </div>
              </motion.div>
              
              {/* Streak Card */}
              <motion.div 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Current Streak</h3>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FiZap className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-center py-2">
                  <span className="text-4xl font-bold text-orange-600">{userProgress.streak}</span>
                  <p className="text-sm text-gray-500 mt-1">days in a row</p>
                </div>
              </motion.div>
              
              {/* Analyses Card */}
              <motion.div 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Analyses</h3>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiFileText className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="text-center py-2">
                  <span className="text-4xl font-bold text-green-600">{reports.length}</span>
                  <p className="text-sm text-gray-500 mt-1">total analyses</p>
                </div>
              </motion.div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <button 
                  onClick={() => setActiveTab('analyses')}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View All
                </button>
              </div>
              
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.slice(0, 3).map((report, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onSelectReport(report)}
                      className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {report.summary.substring(0, 60)}...
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date().toLocaleDateString()} • {report.claims.length} claims
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {report.claims[0]?.verdict?.label === 'true' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Verified
                            </span>
                          ) : report.claims[0]?.verdict?.label === 'false' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Debunked
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <FiFileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">No analyses yet</h4>
                  <p className="text-gray-500 mb-4">Start by analyzing your first piece of content</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiPlus className="mr-2" />
                    New Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'analyses':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Analyses</h1>
                <p className="text-gray-600">View and manage your fact-checking analyses</p>
              </div>
              <div className="w-full md:w-96">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search analyses..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiSearch className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
            
            {reports.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {reports
                  .filter(report => 
                    report.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    report.claims.some(claim => 
                      claim.text.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  )
                  .map((report, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      onClick={() => onSelectReport(report)}
                      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
                            {report.summary || 'Untitled Analysis'}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">
                            {report.claims.length} claims • {new Date().toLocaleDateString()}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {report.claims.slice(0, 3).map((claim, i) => (
                              <span 
                                key={i}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  claim.verdict?.label === 'true' 
                                    ? 'bg-green-100 text-green-800' 
                                    : claim.verdict?.label === 'false'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {claim.verdict?.label === 'true' ? 'True' : 
                                 claim.verdict?.label === 'false' ? 'False' : 'Unverified'}
                              </span>
                            ))}
                            {report.claims.length > 3 && (
                              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                                +{report.claims.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <FiFileText className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get started by analyzing your first piece of content to see it appear here.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiPlus className="mr-2" />
                  New Analysis
                </button>
              </div>
            )}
          </div>
        );
      
      case 'achievements':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
              <p className="text-gray-600">Track your progress and unlock new badges</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Badges</h3>
                  
                  {userProgress.badges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'first_analysis', name: 'First Analysis', icon: '🔍', description: 'Complete your first analysis' },
                        { id: '3_day_streak', name: '3-Day Streak', icon: '🔥', description: 'Use Tattva for 3 consecutive days' },
                        { id: 'weekly_champion', name: 'Weekly Champion', icon: '🏆', description: 'Use Tattva for 7 consecutive days' },
                        { id: 'apprentice', name: 'Apprentice', icon: '🎓', description: 'Reach level 5' },
                        { id: 'expert', name: 'Expert', icon: '🔬', description: 'Reach level 10' },
                        { id: 'fact_finder', name: 'Fact Finder', icon: '📊', description: 'Complete 10 analyses' }
                      ].map((badge, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`text-center p-4 rounded-lg border ${
                            userProgress.badges.includes(badge.id)
                              ? 'bg-white border-indigo-100 shadow-sm'
                              : 'bg-gray-50 border-gray-200 opacity-50'
                          }`}
                        >
                          <div className={`w-12 h-12 mx-auto mb-2 flex items-center justify-center text-2xl ${
                            !userProgress.badges.includes(badge.id) && 'grayscale'
                          }`}>
                            {badge.icon}
                          </div>
                          <h4 className={`font-medium ${
                            userProgress.badges.includes(badge.id) ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {badge.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <FiAward className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h4>
                      <p className="text-gray-500">Complete analyses to earn your first badge!</p>
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          addMascotMessage("Let's analyze something to earn your first badge! 🎯");
                        }}
                        className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Start Analyzing →
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Level {userProgress.level}</span>
                        <span className="text-sm text-gray-500">{userProgress.xp}/{userProgress.nextLevelXp} XP</span>
                      </div>
                      {renderProgressBar()}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-indigo-600">{userProgress.streak}</p>
                        <p className="text-sm text-gray-500">Day Streak</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-indigo-600">{reports.length}</p>
                        <p className="text-sm text-gray-500">Analyses</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Next Milestones</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'level_5', name: 'Level 5', progress: Math.min((userProgress.level / 5) * 100, 100), required: 5 },
                          { id: 'analyze_10', name: '10 Analyses', progress: Math.min((reports.length / 10) * 100, 100), required: 10 },
                          { id: 'streak_7', name: '7-Day Streak', progress: Math.min((userProgress.streak / 7) * 100, 100), required: 7 }
                        ].map((milestone, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">{milestone.name}</span>
                              <span className="text-gray-500">
                                {milestone.id === 'level_5' ? userProgress.level : 
                                 milestone.id === 'analyze_10' ? reports.length : 
                                 userProgress.streak} / {milestone.required}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${milestone.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <h3 className="text-lg font-medium text-indigo-900 mb-2">Tips to Earn More</h3>
                  <ul className="space-y-2 text-sm text-indigo-800">
                    <li className="flex items-start">
                      <FiClock className="w-4 h-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Analyze content daily to maintain your streak</span>
                    </li>
                    <li className="flex items-start">
                      <FiAward className="w-4 h-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Complete the tutorial to earn your first badge</span>
                    </li>
                    <li className="flex items-start">
                      <FiZap className="w-4 h-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Reach level 5 to unlock the Apprentice badge</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSearchQuery('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                        addMascotMessage('Analyzing example video...');
                      }}
                      className="w-full flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                        <FiZap className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Try Example</p>
                        <p className="text-xs text-gray-500">Analyze a sample video</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        // Show tutorial
                        addMascotMessage("Let me show you how to use Tattva...");
                      }}
                      className="w-full flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                        <FiAward className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Take Tutorial</p>
                        <p className="text-xs text-gray-500">Learn how to use Tattva</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        className={`bg-gray-900 text-white flex flex-col h-full ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {isSidebarOpen && <h1 className="text-xl font-bold text-white">Tattva</h1>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <div className="p-4 flex items-center space-x-3 border-b border-gray-800">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            {userProgress.streak > 1 && (
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {userProgress.streak}
              </div>
            )}
          </div>
          
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-400">Level {userProgress.level}</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeTab === 'dashboard' ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <FiHome className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Dashboard</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('analyses')}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeTab === 'analyses' ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <FiList className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">My Analyses</span>}
                {isSidebarOpen && reports.length > 0 && (
                  <span className="ml-auto bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {reports.length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('achievements')}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeTab === 'achievements' ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {isSidebarOpen && <span className="ml-3">Achievements</span>}
                {isSidebarOpen && userProgress.badges.length > 0 && (
                  <span className="ml-auto bg-yellow-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {userProgress.badges.length}
                  </span>
                )}
              </button>
            </li>
          </ul>
          
          {isSidebarOpen && (
            <div className="mt-8 px-3">
              <div className="text-xs font-medium text-gray-400 mb-2">LEVEL {userProgress.level}</div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-white">{userProgress.xp} / {userProgress.nextLevelXp} XP</span>
                <span className="text-xs text-gray-400">({Math.round((userProgress.xp / userProgress.nextLevelXp) * 100)}%)</span>
              </div>
              {renderProgressBar()}
            </div>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => {
              setActiveTab('dashboard');
              setSearchQuery('');
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <FiPlus className="mr-2" />
            {isSidebarOpen && 'New Analysis'}
          </button>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'analyses' && 'My Analyses'}
                {activeTab === 'achievements' && 'Achievements'}
              </h2>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiSearch className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  {isSidebarOpen && (
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName} {user?.lastName?.charAt(0)}.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Mascot Chat */}
          <AnimatePresence>
            {mascotMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 mb-4"
              >
                <div className="flex-shrink-0">
                  <Mascot 
                    isActive={message.isActive}
                  />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-3xl">
                  <p className="text-gray-800">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Main Content */}
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedDashboard;