'use client';

import { useState } from 'react';
import { X, Twitter, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface TweetSaverProps {
  onClose: () => void;
  onSave: () => void;
}

export default function TweetSaver({ onClose, onSave }: TweetSaverProps) {
  const [tweetUrl, setTweetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const handleFetch = async () => {
    if (!tweetUrl.trim()) {
      setError('Please enter a tweet URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPreview(null);

    try {
      const response = await fetch('/api/tweets/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tweetUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch tweet');
        return;
      }

      setPreview(data.tweet);
    } catch (error: any) {
      console.error('Error fetching tweet:', error);
      setError('Failed to fetch tweet. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;

    setIsLoading(true);
    setError(null);

    try {
      // Format tweet as a note
      const title = `Tweet by ${preview.author}`;
      const content = `Tweet URL: ${preview.url}\n\n${preview.text}\n\nSaved on: ${new Date().toLocaleString()}`;
      const tags = ['tweet', 'social', preview.author.replace('@', '')];

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save tweet');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving tweet:', error);
      setError(error.message || 'Failed to save tweet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Twitter className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Save Tweet
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tweet URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleFetch();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://twitter.com/username/status/1234567890 or https://x.com/username/status/1234567890"
                disabled={isLoading}
              />
              <button
                onClick={handleFetch}
                disabled={isLoading || !tweetUrl.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Fetch'
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Paste a Twitter/X tweet URL and click Fetch to load the tweet details
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Tweet saved successfully!
              </p>
            </div>
          )}

          {preview && !success && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-start gap-3 mb-3">
                <Twitter className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {preview.author}
                    </span>
                    {preview.date && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        • {new Date(preview.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {preview.text}
                  </p>
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                  >
                    View original tweet →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          {preview && !success && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Tweet
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

