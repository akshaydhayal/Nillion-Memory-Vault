'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Twitter, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Note } from '@/types';

interface AddMemoryModalProps {
  note?: Note | null;
  onClose: () => void;
  onSave: () => void;
}

type TabType = 'note' | 'tweet';

export default function AddMemoryModal({ note, onClose, onSave }: AddMemoryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(note ? 'note' : 'note');
  
  // Note tab state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Tweet tab state
  const [tweetUrl, setTweetUrl] = useState('');
  const [isLoadingTweet, setIsLoadingTweet] = useState(false);
  const [tweetError, setTweetError] = useState<string | null>(null);
  const [tweetSuccess, setTweetSuccess] = useState(false);
  const [tweetPreview, setTweetPreview] = useState<any>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags?.join(', ') || '');
      setActiveTab('note');
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setTweetUrl('');
      setTweetPreview(null);
      setTweetError(null);
      setTweetSuccess(false);
    }
  }, [note]);

  // Handle note save
  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required');
      return;
    }

    setIsSavingNote(true);
    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (note) {
        // Update existing note
        await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            noteId: note._id,
            title,
            content,
            tags: tagArray,
          }),
        });
      } else {
        // Create new note
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            tags: tagArray,
          }),
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Handle tweet fetch
  const handleFetchTweet = async () => {
    if (!tweetUrl.trim()) {
      setTweetError('Please enter a tweet URL');
      return;
    }

    setIsLoadingTweet(true);
    setTweetError(null);
    setTweetSuccess(false);
    setTweetPreview(null);

    try {
      const response = await fetch('/api/tweets/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tweetUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTweetError(data.error || 'Failed to fetch tweet');
        return;
      }

      setTweetPreview(data.tweet);
    } catch (error: any) {
      console.error('Error fetching tweet:', error);
      setTweetError('Failed to fetch tweet. Please check your connection and try again.');
    } finally {
      setIsLoadingTweet(false);
    }
  };

  // Handle tweet save
  const handleSaveTweet = async () => {
    if (!tweetPreview) return;

    setIsLoadingTweet(true);
    setTweetError(null);

    try {
      const title = `Tweet by ${tweetPreview.author}`;
      const content = `Tweet URL: ${tweetPreview.url}\n\n${tweetPreview.text}\n\nSaved on: ${new Date().toLocaleString()}`;
      const tagArray = ['tweet', 'social', tweetPreview.author.replace('@', '')];

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags: tagArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save tweet');
      }

      setTweetSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving tweet:', error);
      setTweetError(error.message || 'Failed to save tweet');
    } finally {
      setIsLoadingTweet(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {note ? 'Edit Memory' : 'Add New Memory'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {!note && (
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
            <button
              onClick={() => setActiveTab('note')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'note'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Text Note
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tweet')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'tweet'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Save Tweet
              </div>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Note Tab */}
          {activeTab === 'note' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter note title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Write your note content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </>
          )}

          {/* Tweet Tab */}
          {activeTab === 'tweet' && (
            <>
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
                      if (e.key === 'Enter' && !isLoadingTweet) {
                        handleFetchTweet();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://twitter.com/username/status/1234567890 or https://x.com/username/status/1234567890"
                    disabled={isLoadingTweet}
                  />
                  <button
                    onClick={handleFetchTweet}
                    disabled={isLoadingTweet || !tweetUrl.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoadingTweet ? (
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

              {tweetError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      {tweetError}
                    </p>
                  </div>
                </div>
              )}

              {tweetSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Tweet saved successfully!
                  </p>
                </div>
              )}

              {tweetPreview && !tweetSuccess && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-start gap-3 mb-3">
                    <Twitter className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {tweetPreview.author}
                        </span>
                        {tweetPreview.date && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            • {new Date(tweetPreview.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {tweetPreview.text}
                      </p>
                      <a
                        href={tweetPreview.url}
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
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSavingNote || isLoadingTweet}
          >
            Cancel
          </button>
          {activeTab === 'note' && (
            <button
              onClick={handleSaveNote}
              disabled={isSavingNote}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSavingNote ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {note ? 'Update' : 'Save'} Note
                </>
              )}
            </button>
          )}
          {activeTab === 'tweet' && tweetPreview && !tweetSuccess && (
            <button
              onClick={handleSaveTweet}
              disabled={isLoadingTweet}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingTweet ? (
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

