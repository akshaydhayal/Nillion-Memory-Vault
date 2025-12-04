'use client';

import { Note } from '@/types';
import { format } from 'date-fns';
import { FileText, Calendar, Tag, Trash2, Edit, Twitter, Eye, Code, Bookmark } from 'lucide-react';
import { useState } from 'react';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onView: (note: Note) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onView }: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check note type
  const isTweet = note.tags?.includes('tweet') || note.content?.includes('Tweet URL:');
  const isCode = note.tags?.includes('code') || note.content?.includes('```');
  const isBookmark = note.tags?.includes('bookmark') || note.content?.includes('Bookmark URL:');

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await fetch(`/api/notes?id=${note._id}`, {
        method: 'DELETE',
      });
      onDelete(note._id);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 p-5 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      {/* Decorative gradient blob */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${
        isTweet ? 'bg-gradient-to-br from-sky-400/20 to-blue-400/20' :
        isCode ? 'bg-gradient-to-br from-emerald-400/20 to-teal-400/20' :
        isBookmark ? 'bg-gradient-to-br from-orange-400/20 to-red-400/20' :
        'bg-gradient-to-br from-primary-400/20 to-purple-400/20'
      } rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {isTweet ? (
              <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-500 rounded-lg shadow-md flex-shrink-0">
                <Twitter className="w-4 h-4 text-white" />
              </div>
            ) : isCode ? (
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md flex-shrink-0">
                <Code className="w-4 h-4 text-white" />
              </div>
            ) : isBookmark ? (
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-md flex-shrink-0">
                <Bookmark className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg shadow-md flex-shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {note.title}
              </h3>
              <div className="flex gap-1.5 mt-1">
                {isTweet && (
                  <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 text-sky-700 dark:text-sky-300 rounded-full text-xs font-semibold">
                    Tweet
                  </span>
                )}
                {isCode && (
                  <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                    Code
                  </span>
                )}
                {isBookmark && (
                  <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold">
                    Bookmark
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 ml-2">
            <button
              onClick={() => onView(note)}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all transform hover:scale-110"
              title="View full note"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(note)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all transform hover:scale-110"
              title="Edit note"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          {isCode ? (
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700 overflow-hidden">
              <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                <code className="block whitespace-pre-wrap break-words">
                  {note.content.match(/```[\w]*\n([\s\S]*?)```/)?.[1]?.substring(0, 150) || note.content.substring(0, 150)}
                  {(note.content.match(/```[\w]*\n([\s\S]*?)```/)?.[1]?.length || note.content.length) > 150 && '...'}
                </code>
              </pre>
            </div>
          ) : isBookmark ? (
            <div className="space-y-2">
              {note.content.match(/Bookmark URL: (.+)/)?.[1] && (
                <a
                  href={note.content.match(/Bookmark URL: (.+)/)?.[1]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium block truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  🔗 {note.content.match(/Bookmark URL: (.+)/)?.[1]}
                </a>
              )}
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2 text-sm leading-relaxed">
                {note.content.split('\n\n').filter(p => !p.includes('Bookmark URL:') && !p.includes('Tags:')).join('\n\n') || note.content}
              </p>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed">
              {note.content}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-medium">{format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
          </div>
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <div className="flex gap-1">
                {note.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {note.tags.length > 2 && (
                  <span className="text-gray-500 font-medium">+{note.tags.length - 2}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

