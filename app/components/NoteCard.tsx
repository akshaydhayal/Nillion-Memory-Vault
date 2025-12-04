'use client';

import { Note } from '@/types';
import { format } from 'date-fns';
import { FileText, Calendar, Tag, Trash2, Edit, Twitter, Eye } from 'lucide-react';
import { useState } from 'react';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onView: (note: Note) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onView }: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check if this is a tweet (has 'tweet' tag or contains tweet URL)
  const isTweet = note.tags?.includes('tweet') || note.content?.includes('Tweet URL:');

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isTweet ? (
            <Twitter className="w-5 h-5 text-blue-500" />
          ) : (
            <FileText className="w-5 h-5 text-primary-600" />
          )}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {note.title}
          </h3>
          {isTweet && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
              Tweet
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(note)}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="View full note"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Edit note"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {note.content}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
          </div>
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <div className="flex gap-1">
                {note.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-gray-500">+{note.tags.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

