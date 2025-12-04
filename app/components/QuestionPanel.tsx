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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ask Your Memory Vault
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            ×
          </button>
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="e.g., What did I write about project X last month?"
            />
          </div>

          <button
            onClick={handleAsk}
            disabled={isAsking || !question.trim()}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary-600 mt-0.5" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Answer</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

