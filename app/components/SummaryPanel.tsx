'use client';

import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SummaryPanelProps {
  onClose: () => void;
}

export default function SummaryPanel({ onClose }: SummaryPanelProps) {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    setIsGenerating(true);
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
      });

      const data = await response.json();
      setSummary(data.summary || data.error || 'Unable to generate summary.');
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Vault Summary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Generating summary of your memories...
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary-600 mt-0.5" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Summary</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

