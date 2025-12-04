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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Memory Vault Summary
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
            <div className="space-y-4">
              <div className="flex items-start gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Summary</h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <MarkdownContent content={summary} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

