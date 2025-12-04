'use client';

import { Note } from '@/types';
import { X, FileText, Twitter, Calendar, Tag, ExternalLink, Code, Bookmark, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface ViewNoteModalProps {
  note: Note;
  onClose: () => void;
}

export default function ViewNoteModal({ note, onClose }: ViewNoteModalProps) {
  const [copied, setCopied] = useState(false);

  // Check note type
  const isTweet = note.tags?.includes('tweet') || note.content?.includes('Tweet URL:');
  const isCode = note.tags?.includes('code') || note.content?.includes('```');
  const isBookmark = note.tags?.includes('bookmark') || note.content?.includes('Bookmark URL:');
  
  // Extract tweet URL if it's a tweet
  const tweetUrlMatch = note.content?.match(/Tweet URL:\s*(https?:\/\/[^\s]+)/);
  const tweetUrl = tweetUrlMatch ? tweetUrlMatch[1] : null;
  
  // Extract bookmark URL
  const bookmarkUrlMatch = note.content?.match(/Bookmark URL:\s*(https?:\/\/[^\s]+)/);
  const bookmarkUrl = bookmarkUrlMatch ? bookmarkUrlMatch[1] : null;
  
  // Extract code snippet
  const codeMatch = note.content?.match(/Language: (.+)\n\n```[\w]*\n([\s\S]*?)```/);
  const codeLanguage = codeMatch ? codeMatch[1] : 'text';
  const codeContent = codeMatch ? codeMatch[2] : null;
  
  // Extract tweet author from title (format: "Tweet by @username")
  const tweetAuthor = isTweet && note.title.includes('@') 
    ? note.title.replace('Tweet by ', '').trim()
    : null;
  
  // Extract tweet content (remove URL line and "Saved on" line)
  const getDisplayContent = () => {
    if (isTweet) {
      // For tweets, extract the actual tweet text
      const lines = note.content.split('\n');
      const contentLines: string[] = [];
      let skipNext = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('Tweet URL:') || line.startsWith('Saved on:')) {
          skipNext = true;
          continue;
        }
        
        if (skipNext && !line) {
          continue;
        }
        
        skipNext = false;
        
        if (line) {
          contentLines.push(line);
        }
      }
      
      return contentLines.join('\n').trim() || note.content;
    } else if (isBookmark) {
      // For bookmarks, extract description
      const parts = note.content.split('\n\n');
      return parts.length > 1 ? parts[1] : note.content;
    }
    return note.content;
  };

  const displayContent = getDisplayContent();

  const handleCopyCode = async () => {
    if (codeContent) {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              ) : isCode ? (
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Code className="w-6 h-6 text-white" />
                </div>
              ) : isBookmark ? (
                <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <Bookmark className="w-6 h-6 text-white" />
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
                <div className="flex gap-1.5 mt-1.5">
                  {isTweet && (
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 text-sky-700 dark:text-sky-300 rounded-full text-xs font-semibold">
                      Tweet
                    </span>
                  )}
                  {isCode && (
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                      {codeLanguage}
                    </span>
                  )}
                  {isBookmark && (
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold">
                      Bookmark
                    </span>
                  )}
                </div>
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
          {/* Bookmark Link */}
          {isBookmark && bookmarkUrl && (
            <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-800/50 rounded-xl shadow-sm">
              <a
                href={bookmarkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-all group"
              >
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span className="text-sm font-semibold truncate flex-1">{bookmarkUrl}</span>
              </a>
            </div>
          )}

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
            {isCode && codeContent ? (
              <div className="relative bg-gray-900 rounded-xl border-2 border-emerald-500/30 shadow-2xl overflow-hidden">
                {/* Code Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-semibold text-gray-300">{codeLanguage}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all transform hover:scale-105 text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                {/* Code Content */}
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 font-mono leading-relaxed">
                    <code>{codeContent}</code>
                  </pre>
                </div>
              </div>
            ) : isBookmark ? (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-2 border-orange-200/50 dark:border-orange-800/50 shadow-xl">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                    {displayContent}
                  </p>
                </div>
              </div>
            ) : isTweet ? (
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

