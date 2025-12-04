'use client';

import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SummaryPanelProps {
  onClose: () => void;
}

// Component to render markdown-like content with proper formatting
function MarkdownContent({ content }: { content: string }) {
  // Split content by markdown headings (##)
  const parts = content.split(/(##\s+[^\n]+)/g);
  
  if (parts.length === 1) {
    // No headings found, render as plain text
    return <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="space-y-6">
      {parts.map((part, index) => {
        // Check if this part is a heading
        if (part.startsWith('##')) {
          const headingText = part.replace(/^##\s+/, '').trim();
          return (
            <div key={index} className="border-t border-gray-200 dark:border-gray-700 pt-6 first:border-t-0 first:pt-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-1.5 h-7 bg-primary-600 rounded-full"></span>
                <span>{headingText}</span>
              </h3>
            </div>
          );
        } else if (part.trim()) {
          // This is content following a heading
          const lines = part.split('\n').filter(line => line.trim());
          return (
            <div key={index} className="ml-6 space-y-3">
              {lines.map((line, lineIndex) => {
                const trimmedLine = line.trim();
                // Check for bullet points
                if (trimmedLine.match(/^[\*\-\•]\s+/)) {
                  const bulletText = trimmedLine.replace(/^[\*\-\•]\s+/, '').trim();
                  // Parse bold text in bullet
                  const textParts = bulletText.split(/(\*\*[^\*]+\*\*)/g);
                  return (
                    <div key={lineIndex} className="flex items-start gap-3">
                      <span className="text-primary-600 mt-1.5 flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {textParts.map((textPart, textIndex) => {
                          if (textPart.startsWith('**') && textPart.endsWith('**') && textPart.length > 4) {
                            const boldText = textPart.slice(2, -2);
                            return <strong key={textIndex} className="font-semibold text-gray-900 dark:text-white">{boldText}</strong>;
                          }
                          return <span key={textIndex}>{textPart}</span>;
                        })}
                      </span>
                    </div>
                  );
                }
                // Regular paragraph - parse bold and italic
                const textParts = trimmedLine.split(/(\*\*[^\*]+\*\*|\*[^\*]+\*)/g);
                return (
                  <p key={lineIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {textParts.map((textPart, textIndex) => {
                      if (textPart.startsWith('**') && textPart.endsWith('**') && textPart.length > 4) {
                        const boldText = textPart.slice(2, -2);
                        return <strong key={textIndex} className="font-semibold text-gray-900 dark:text-white">{boldText}</strong>;
                      } else if (textPart.startsWith('*') && textPart.endsWith('*') && textPart.length > 2 && !textPart.startsWith('**')) {
                        const italicText = textPart.slice(1, -1);
                        return <em key={textIndex} className="italic text-gray-800 dark:text-gray-200">{italicText}</em>;
                      }
                      return <span key={textIndex}>{textPart}</span>;
                    })}
                  </p>
                );
              })}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="relative bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 dark:from-white dark:via-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                Memory Vault Summary
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

        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Generating summary of your memories...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Summary</h3>
              </div>
              <div className="bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-primary-200/50 dark:border-primary-800/50 shadow-lg">
                <MarkdownContent content={summary} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

