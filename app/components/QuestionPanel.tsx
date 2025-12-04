'use client';

import { MessageCircle, Sparkles, Loader2, Send } from 'lucide-react';
import { useState } from 'react';

interface QuestionPanelProps {
  onClose: () => void;
}

export default function QuestionPanel({ onClose }: QuestionPanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsAsking(true);
    setAnswer('');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      setAnswer(data.answer || data.error || 'Unable to generate answer.');
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('Failed to get answer. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="relative bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 dark:from-white dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Ask Your Memory Vault
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all transform hover:scale-110"
            >
              <span className="text-2xl text-gray-600 dark:text-gray-400">×</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ask a question about your stored memories
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white resize-none shadow-sm transition-all"
              placeholder="e.g., What did I write about project X last month?"
            />
          </div>

          <button
            onClick={handleAsk}
            disabled={isAsking || !question.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none font-semibold"
          >
            {isAsking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Ask Question
              </>
            )}
          </button>

          {answer && (
            <div className="mt-4 p-5 bg-gradient-to-br from-purple-50 via-pink-50 to-primary-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-primary-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
              <div className="flex items-start gap-2 mb-3">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Answer</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

