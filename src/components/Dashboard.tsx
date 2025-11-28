'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { TattvaOutput } from '@/app/types/outputModels';
import InteractiveReport from './InteractiveReport';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiSearch, FiPlusCircle, FiFileText } from 'react-icons/fi';

interface DashboardProps {
    reports: TattvaOutput[];
    onNewAnalysis: () => void;
    onSelectReport: (report: TattvaOutput) => void;
    selectedReport: TattvaOutput | null;
}

const Dashboard = ({ reports, onNewAnalysis, onSelectReport, selectedReport }: DashboardProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user } = useUser();

    const filteredReports = reports.filter(report =>
        report.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.claims.some(claim => claim.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'true': return 'bg-emerald-100 text-emerald-800';
            case 'mostly_true': return 'bg-green-100 text-green-800';
            case 'mixed': return 'bg-amber-100 text-amber-800';
            case 'mostly_false': return 'bg-orange-100 text-orange-800';
            case 'false': return 'bg-rose-100 text-rose-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getVerdictText = (verdict: string) => {
        return verdict.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const getVerdictIcon = (verdict: string) => {
        switch (verdict) {
            case 'true':
            case 'mostly_true':
                return <FiCheckCircle className="mr-2" />;
            case 'false':
            case 'mostly_false':
                return <FiAlertTriangle className="mr-2" />;
            default:
                return <FiClock className="mr-2" />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <motion.div
                className={`bg-white shadow-lg flex flex-col ${isSidebarOpen ? 'w-80' : 'w-20'} transition-all duration-300`}
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="p-4 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-indigo-600">Tattva</h1>
                    <p className="text-sm text-gray-500">Fact-checking at your fingertips</p>
                </div>

                <div className="p-4">
                    <button
                        onClick={onNewAnalysis}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FiPlusCircle className="text-lg" />
                        {isSidebarOpen && 'New Analysis'}
                    </button>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search reports..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Recent Reports
                    </h3>
                    <div className="space-y-1 px-2">
                        {filteredReports.length > 0 ? (
                            filteredReports.map((report, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => onSelectReport(report)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedReport === report ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-gray-900 truncate">
                                            {report.summary.substring(0, 50)}...
                                        </h4>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getVerdictColor(report.claims[0]?.verdict?.label || '')}`}>
                                            {getVerdictText(report.claims[0]?.verdict?.label || '')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {report.claims.length} claims • {new Date().toLocaleDateString()}
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                {searchQuery ? 'No matching reports found' : 'No reports yet'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                            {user?.firstName?.[0] || 'U'}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                                {user?.fullName || 'User'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {selectedReport ? 'Analysis Report' : 'Dashboard'}
                        </h2>
                        <div className="w-6"></div> {/* Spacer for alignment */}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">ß
                    <AnimatePresence mode="wait">
                        {selectedReport ? (
                            <motion.div
                                key="report"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-4xl mx-auto"
                            >
                                <InteractiveReport report={selectedReport} />
                            </motion.div>
                        ) : reports.length === 0 ? (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center p-8"
                            >
                                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <div className="p-8 text-center">
                                        <h1 className="text-3xl font-bold text-indigo-600">Tattva</h1>
                                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Start Analyzing</h2>
                                        <p className="text-gray-600 mb-8">Get insights and analysis on any media content</p>

                                        <div className="space-y-6">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Paste a YouTube, Twitter, or article link..."
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition pr-12"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (searchQuery) {
                                                            onNewAnalysis();
                                                        }
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                                                    disabled={!searchQuery}
                                                >
                                                    <FiSearch className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={onNewAnalysis}
                                                disabled={!searchQuery}
                                                className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${!searchQuery
                                                        ? 'bg-indigo-400 cursor-not-allowed'
                                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                                    }`}
                                            >
                                                Generate Analysis
                                            </button>

                                            <p className="text-sm text-gray-500 mt-4">
                                                Try with any YouTube, Instagram, Twitter, or news article link
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            // Show this when there are reports but none selected
                            <motion.div
                                key="select-prompt"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-8"
                            >
                                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                                    <FiFileText className="text-indigo-600 text-3xl" />
                                </div>
                                <h3 className="text-2xl font-medium text-gray-900 mb-2">Select a Report</h3>
                                <p className="text-gray-500 mb-6 max-w-md">
                                    Choose a report from the sidebar to view its details or start a new analysis.
                                </p>
                                <button
                                    onClick={onNewAnalysis}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <FiPlusCircle className="mr-2" />
                                    New Analysis
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
