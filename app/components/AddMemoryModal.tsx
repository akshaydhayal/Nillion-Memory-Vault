'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Twitter, Loader2, CheckCircle, AlertCircle, Code, Bookmark } from 'lucide-react';
import { Note } from '@/types';

interface AddMemoryModalProps {
  note?: Note | null;
  onClose: () => void;
  onSave: () => void;
}

type TabType = 'note' | 'tweet' | 'code' | 'bookmark';

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

  // Code snippet tab state
  const [codeTitle, setCodeTitle] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeContent, setCodeContent] = useState('');
  const [codeTags, setCodeTags] = useState('');
  const [isSavingCode, setIsSavingCode] = useState(false);

  // Bookmark tab state
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [bookmarkDescription, setBookmarkDescription] = useState('');
  const [bookmarkTags, setBookmarkTags] = useState('');
  const [isSavingBookmark, setIsSavingBookmark] = useState(false);

  useEffect(() => {
    if (note) {
      // Detect note type from tags or content
      const isCode = note.tags?.includes('code') || note.content?.includes('```');
      const isBookmark = note.tags?.includes('bookmark') || note.content?.includes('Bookmark URL:');
      
      if (isCode) {
        // Parse code snippet
        const codeMatch = note.content.match(/Language: (.+)\n\n```[\w]*\n([\s\S]*?)```/);
        if (codeMatch) {
          setCodeTitle(note.title);
          setCodeLanguage(codeMatch[1] || 'javascript');
          setCodeContent(codeMatch[2] || '');
          setCodeTags(note.tags?.filter(t => t !== 'code').join(', ') || '');
          setActiveTab('code');
        } else {
          setTitle(note.title);
          setContent(note.content);
          setTags(note.tags?.join(', ') || '');
          setActiveTab('note');
        }
      } else if (isBookmark) {
        // Parse bookmark
        const urlMatch = note.content.match(/Bookmark URL: (.+)/);
        const descMatch = note.content.match(/Bookmark URL: .+\n\n([\s\S]*?)(?:\n\nTags:|$)/);
        if (urlMatch) {
          setBookmarkTitle(note.title);
          setBookmarkUrl(urlMatch[1] || '');
          setBookmarkDescription(descMatch ? descMatch[1].trim() : '');
          setBookmarkTags(note.tags?.filter(t => t !== 'bookmark').join(', ') || '');
          setActiveTab('bookmark');
        } else {
          setTitle(note.title);
          setContent(note.content);
          setTags(note.tags?.join(', ') || '');
          setActiveTab('note');
        }
      } else {
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags?.join(', ') || '');
        setActiveTab('note');
      }
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setTweetUrl('');
      setTweetPreview(null);
      setTweetError(null);
      setTweetSuccess(false);
      setCodeTitle('');
      setCodeLanguage('javascript');
      setCodeContent('');
      setCodeTags('');
      setBookmarkTitle('');
      setBookmarkUrl('');
      setBookmarkDescription('');
      setBookmarkTags('');
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

  // Handle code snippet save
  const handleSaveCode = async () => {
    if (!codeTitle.trim() || !codeContent.trim()) {
      alert('Title and code are required');
      return;
    }

    setIsSavingCode(true);
    try {
      const tagArray = ['code', codeLanguage, ...codeTags.split(',').map(t => t.trim()).filter(t => t.length > 0)];
      const content = `Language: ${codeLanguage}\n\n\`\`\`${codeLanguage}\n${codeContent}\n\`\`\``;

      if (note) {
        await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            noteId: note._id,
            title: codeTitle,
            content,
            tags: tagArray,
          }),
        });
      } else {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: codeTitle,
            content,
            tags: tagArray,
          }),
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving code snippet:', error);
      alert('Failed to save code snippet');
    } finally {
      setIsSavingCode(false);
    }
  };

  // Handle bookmark save
  const handleSaveBookmark = async () => {
    if (!bookmarkTitle.trim() || !bookmarkUrl.trim()) {
      alert('Title and URL are required');
      return;
    }

    setIsSavingBookmark(true);
    try {
      const tagArray = ['bookmark', ...bookmarkTags.split(',').map(t => t.trim()).filter(t => t.length > 0)];
      const content = `Bookmark URL: ${bookmarkUrl}\n\n${bookmarkDescription || 'No description provided.'}\n\nTags: ${tagArray.filter(t => t !== 'bookmark').join(', ')}`;

      if (note) {
        await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            noteId: note._id,
            title: bookmarkTitle,
            content,
            tags: tagArray,
          }),
        });
      } else {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: bookmarkTitle,
            content,
            tags: tagArray,
          }),
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving bookmark:', error);
      alert('Failed to save bookmark');
    } finally {
      setIsSavingBookmark(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="relative bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 dark:from-white dark:via-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
              {note ? 'Edit Memory' : 'Add New Memory'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all transform hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {!note && (
          <div className="grid grid-cols-4 gap-2 px-6 pt-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => setActiveTab('note')}
              className={`px-3 py-2.5 font-semibold text-xs transition-all rounded-t-xl ${
                activeTab === 'note'
                  ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Text Note</span>
                <span className="sm:hidden">Note</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tweet')}
              className={`px-3 py-2.5 font-semibold text-xs transition-all rounded-t-xl ${
                activeTab === 'tweet'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Twitter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Tweet</span>
                <span className="sm:hidden">Tweet</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-2.5 font-semibold text-xs transition-all rounded-t-xl ${
                activeTab === 'code'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Code</span>
                <span className="sm:hidden">Code</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bookmark')}
              className={`px-3 py-2.5 font-semibold text-xs transition-all rounded-t-xl ${
                activeTab === 'bookmark'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bookmark</span>
                <span className="sm:hidden">Link</span>
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
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white resize-none shadow-sm transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm transition-all"
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
                    className="flex-1 px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm transition-all"
                    placeholder="https://twitter.com/username/status/1234567890 or https://x.com/username/status/1234567890"
                    disabled={isLoadingTweet}
                  />
                  <button
                    onClick={handleFetchTweet}
                    disabled={isLoadingTweet || !tweetUrl.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl hover:from-sky-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-semibold"
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
                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                  <div className="p-1.5 bg-red-500 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-800 dark:text-red-200">
                      Error
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      {tweetError}
                    </p>
                  </div>
                </div>
              )}

              {tweetSuccess && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                  <div className="p-1.5 bg-green-500 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
                  </div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    Tweet saved successfully!
                  </p>
                </div>
              )}

              {tweetPreview && !tweetSuccess && (
                <div className="border border-sky-200/50 dark:border-sky-800/50 rounded-xl p-5 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 shadow-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-500 rounded-lg shadow-md">
                      <Twitter className="w-5 h-5 text-white flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {tweetPreview.author}
                        </span>
                        {tweetPreview.date && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            • {new Date(tweetPreview.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {tweetPreview.text}
                      </p>
                      <a
                        href={tweetPreview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline mt-2 inline-flex items-center gap-1 font-semibold transition-colors"
                      >
                        View original tweet →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Code Snippet Tab */}
          {activeTab === 'code' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={codeTitle}
                  onChange={(e) => setCodeTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm transition-all"
                  placeholder="e.g., React Hook Example"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm transition-all"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="csharp">C#</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                  <option value="swift">Swift</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="bash">Bash</option>
                  <option value="json">JSON</option>
                  <option value="yaml">YAML</option>
                  <option value="markdown">Markdown</option>
                  <option value="text">Plain Text</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code
                </label>
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-900 text-gray-100 font-mono text-sm resize-none shadow-sm transition-all"
                  placeholder="Paste your code here..."
                  style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={codeTags}
                  onChange={(e) => setCodeTags(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm transition-all"
                  placeholder="react, hooks, example"
                />
              </div>
            </>
          )}

          {/* Bookmark Tab */}
          {activeTab === 'bookmark' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={bookmarkTitle}
                  onChange={(e) => setBookmarkTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm transition-all"
                  placeholder="e.g., Awesome Article Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={bookmarkUrl}
                  onChange={(e) => setBookmarkUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm transition-all"
                  placeholder="https://example.com/article"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={bookmarkDescription}
                  onChange={(e) => setBookmarkDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white resize-none shadow-sm transition-all"
                  placeholder="Add notes or description about this bookmark..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={bookmarkTags}
                  onChange={(e) => setBookmarkTags(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm transition-all"
                  placeholder="article, tutorial, web-dev"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-xl transition-all border border-gray-300/50 dark:border-gray-600/50 font-medium"
            disabled={isSavingNote || isLoadingTweet}
          >
            Cancel
          </button>
          {activeTab === 'note' && (
            <button
              onClick={handleSaveNote}
              disabled={isSavingNote}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-semibold"
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
              className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl hover:from-sky-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-semibold"
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
          {activeTab === 'code' && (
            <button
              onClick={handleSaveCode}
              disabled={isSavingCode}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-semibold"
            >
              {isSavingCode ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {note ? 'Update' : 'Save'} Code
                </>
              )}
            </button>
          )}
          {activeTab === 'bookmark' && (
            <button
              onClick={handleSaveBookmark}
              disabled={isSavingBookmark}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-semibold"
            >
              {isSavingBookmark ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {note ? 'Update' : 'Save'} Bookmark
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

