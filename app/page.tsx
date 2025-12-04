'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, MessageCircle, FileText, Shield, Sparkles, Loader2, LogOut, User } from 'lucide-react';
import NoteCard from './components/NoteCard';
import AddMemoryModal from './components/AddMemoryModal';
import ViewNoteModal from './components/ViewNoteModal';
import SearchPanel from './components/SearchPanel';
import QuestionPanel from './components/QuestionPanel';
import SummaryPanel from './components/SummaryPanel';
import LoginModal from './components/LoginModal';
import LandingPage from './components/LandingPage';
import { Note } from '@/types';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
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

  const handleNewMemory = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setEditingNote(null);
    setShowMemoryModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowMemoryModal(true);
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note._id !== noteId));
  };

  const handleSaveNote = () => {
    loadNotes();
  };

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowLogin(true)} />
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 dark:bg-primary-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-xl blur-lg opacity-50"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 dark:from-white dark:via-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Nillion MemoryVault
                </h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
                  Privacy-First Personal Knowledge Base
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{userEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
              <div className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-semibold shadow-md">
                🔒 Encrypted
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleNewMemory}
            className="group relative px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-2xl font-semibold overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Add Memory to nilDB</span>
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="group px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center gap-2 shadow-md hover:shadow-xl font-medium"
          >
            <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            nilAI Search
          </button>
          <button
            onClick={() => setShowQuestion(true)}
            className="group px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center gap-2 shadow-md hover:shadow-xl font-medium"
          >
            <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Ask Question
          </button>
          <button
            onClick={() => setShowSummary(true)}
            className="group px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center gap-2 shadow-md hover:shadow-xl font-medium"
          >
            <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            Summarize
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 p-4 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-400/30 to-cyan-400/30 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-lg shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notes.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Total Notes
                </p>
              </div>
            </div>
          </div>
          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 p-4 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Encrypted
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  All Data
                </p>
              </div>
            </div>
          </div>
          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 p-4 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI-Powered
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Private LLM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400 animate-spin relative" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
              Please wait, loading your memories and notes...
            </p>
          </div>
        ) : notes.length === 0 ? (
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-16 text-center border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-lg">
                  <FileText className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                No notes yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Create your first encrypted note to get started with your private knowledge base
              </p>
              <button
                onClick={handleNewMemory}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl font-semibold"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Add Your First Memory
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onView={handleViewNote}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showMemoryModal && (
        <AddMemoryModal
          note={editingNote}
          onClose={() => {
            setShowMemoryModal(false);
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


      {viewingNote && (
        <ViewNoteModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}

      {/* Footer */}
      <footer className="relative mt-16 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2 text-gray-600 dark:text-gray-400">
            Built with <span className="font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">Nillion</span> - Privacy-Preserving AI & Computation
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            All data encrypted with nilDB • AI processing in TEE with nilAI
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

