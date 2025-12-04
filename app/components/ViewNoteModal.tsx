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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {isTweet ? (
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Twitter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            ) : (
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {note.title}
              </h2>
              {isTweet && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                  Tweet
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tweet Link */}
          {isTweet && tweetUrl && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">View original tweet</span>
              </a>
            </div>
          )}

          {/* Main Content */}
          <div className="mb-6">
            {isTweet ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                {/* Tweet Header */}
                {tweetAuthor && (
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
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
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Created: {format(new Date(note.createdAt), 'MMM d, yyyy • h:mm a')}
              </span>
            </div>
            {note.updatedAt !== note.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Updated: {format(new Date(note.updatedAt), 'MMM d, yyyy • h:mm a')}
                </span>
              </div>
            )}
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4" />
                <div className="flex gap-1 flex-wrap">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
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

