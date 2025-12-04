'use client';

import { Shield, Lock, Sparkles, Database, Search, MessageCircle, ArrowRight, Check, FileText, Twitter, Plus } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Lock,
      title: 'Encrypted Storage',
      description: 'nilDB encryption',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: 'Private AI',
      description: 'TEE processing',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Search,
      title: 'AI Search',
      description: 'Private queries',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageCircle,
      title: 'Ask Questions',
      description: 'Smart Q&A',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const privacyPoints = [
    'All data encrypted at rest (nilDB)',
    'All computation in TEE (nilAI)',
    'No plaintext visible to operators',
    'User-owned data with selective sharing',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 dark:bg-primary-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 dark:from-white dark:via-primary-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Nillion MemoryVault
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-5 max-w-xl mx-auto font-medium">
            Privacy-first encrypted knowledge vault for notes
          </p>
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl font-semibold"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Grid - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className={`inline-flex p-2 rounded-lg mb-2.5 bg-gradient-to-br ${feature.gradient} shadow-md`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* What You Can Save - Compact Infographics */}
        <div className="mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Text Notes */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Text Notes</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Create & store encrypted notes</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Thoughts</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Research</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Memories</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tweets */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl shadow-lg">
                  <Twitter className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Save Tweets</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Paste URL to archive tweets</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full">Auto-fetch</span>
                    <span className="text-xs px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full">Full context</span>
                    <span className="text-xs px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full">Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security - Single Combined Section */}
        <div className="bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-primary-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-2xl p-5 border border-primary-200/50 dark:border-primary-800/50 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg shadow-md">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
              Privacy & Security
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                <Check className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Encrypted at rest (nilDB)
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                <Check className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                AI in TEE (nilAI)
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                <Check className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Zero-knowledge privacy
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
