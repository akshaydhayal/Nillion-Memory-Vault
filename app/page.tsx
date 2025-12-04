'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, MessageCircle, FileText, Shield, Sparkles, Loader2, LogOut, User } from 'lucide-react';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import SearchPanel from './components/SearchPanel';
import QuestionPanel from './components/QuestionPanel';
import SummaryPanel from './components/SummaryPanel';
import LoginModal from './components/LoginModal';
import { Note } from '@/types';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Only check auth on mount, don't load notes yet
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.isAuthenticated) {
        setIsAuthenticated(true);
        setUserEmail(data.email);
        // Only load notes after authentication is confirmed
        loadNotes();
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
        setNotes([]); // Clear notes if not authenticated
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setUserEmail(null);
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    // checkAuth() will call loadNotes() if authenticated, so no need to call it separately
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUserEmail(null);
      setNotes([]); // Clear notes
      setIsLoading(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setShowEditor(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note._id !== noteId));
  };

  const handleSaveNote = () => {
    loadNotes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Nillion MemoryVault
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Privacy-First Personal Knowledge Base
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {userEmail}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Login / Register
                </button>
              )}
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                🔒 Encrypted
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={handleNewNote}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Search className="w-5 h-5" />
            AI Search
          </button>
          <button
            onClick={() => setShowQuestion(true)}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Ask Question
          </button>
          <button
            onClick={() => setShowSummary(true)}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Summarize
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notes.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Notes
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Encrypted
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All Data
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI-Powered
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Private LLM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No notes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first encrypted note to get started
            </p>
            <button
              onClick={handleNewNote}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showEditor && (
        <NoteEditor
          note={editingNote}
          onClose={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
          onSave={handleSaveNote}
        />
      )}

      {showSearch && (
        <SearchPanel onClose={() => setShowSearch(false)} />
      )}

      {showQuestion && (
        <QuestionPanel onClose={() => setShowQuestion(false)} />
      )}

      {showSummary && (
        <SummaryPanel onClose={() => setShowSummary(false)} />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            Built with <span className="font-semibold">Nillion</span> - Privacy-Preserving AI & Computation
          </p>
          <p className="text-sm">
            All data encrypted with nilDB • AI processing in TEE with nilAI
          </p>
        </div>
      </footer>
    </div>
  );
}

