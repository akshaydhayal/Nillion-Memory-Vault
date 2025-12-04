'use client';

import { Note } from '@/types';
import { X, FileText, Twitter, Calendar, Tag, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface ViewNoteModalProps {
  note: Note;
  onClose: () => void;
}

export default function ViewNoteModal({ note, onClose }: ViewNoteModalProps) {
  // Check if this is a tweet
  const isTweet = note.tags?.includes('tweet') || note.content?.includes('Tweet URL:');
  
  // Extract tweet URL if it's a tweet
  const tweetUrlMatch = note.content?.match(/Tweet URL:\s*(https?:\/\/[^\s]+)/);
  const tweetUrl = tweetUrlMatch ? tweetUrlMatch[1] : null;
  
  // Extract tweet author from title (format: "Tweet by @username")
  const tweetAuthor = isTweet && note.title.includes('@') 
    ? note.title.replace('Tweet by ', '').trim()
    : null;
  
  // Extract tweet content (remove URL line and "Saved on" line)
  const getDisplayContent = () => {
    if (isTweet) {
      // For tweets, extract the actual tweet text
      // Format is usually: "Tweet URL: ...\n\n[actual tweet text]\n\nSaved on: ..."
      const lines = note.content.split('\n');
      const contentLines: string[] = [];
      let skipNext = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip metadata lines
        if (line.startsWith('Tweet URL:') || line.startsWith('Saved on:')) {
          skipNext = true;
          continue;
        }
        
        // Skip empty lines after metadata
        if (skipNext && !line) {
          continue;
        }
        
        skipNext = false;
        
        // Collect actual content
        if (line) {
          contentLines.push(line);
        }
      }
      
      return contentLines.join('\n').trim() || note.content;
    }
    return note.content;
  };

  const displayContent = getDisplayContent();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isTweet ? (
                <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl shadow-lg">
                  <Twitter className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="p-2.5 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 dark:from-white dark:via-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {note.title}
                </h2>
                {isTweet && (
                  <span className="inline-block mt-1.5 px-3 py-1 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 text-sky-700 dark:text-sky-300 rounded-full text-xs font-semibold">
                    Tweet
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all transform hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tweet Link */}
          {isTweet && tweetUrl && (
            <div className="mb-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200/50 dark:border-sky-800/50 rounded-xl shadow-sm">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-all group"
              >
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span className="text-sm font-semibold">View original tweet</span>
              </a>
            </div>
          )}

          {/* Main Content */}
          <div className="mb-6">
            {isTweet ? (
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-sky-200/50 dark:border-sky-800/50 shadow-xl">
                {/* Tweet Header */}
                {tweetAuthor && (
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-sky-200/50 dark:border-sky-800/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Twitter className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {tweetAuthor}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Twitter
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Tweet Content */}
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed whitespace-pre-wrap">
                    {displayContent}
                  </p>
                </div>
                
                {/* Tweet Footer */}
                {note.createdAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(note.createdAt), 'h:mm a • MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                  {displayContent}
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Created: {format(new Date(note.createdAt), 'MMM d, yyyy • h:mm a')}
              </span>
            </div>
            {note.updatedAt !== note.createdAt && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Updated: {format(new Date(note.updatedAt), 'MMM d, yyyy • h:mm a')}
                </span>
              </div>
            )}
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <div className="flex gap-1.5 flex-wrap">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

