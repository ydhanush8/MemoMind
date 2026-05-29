'use client';

import React from 'react';
import { Trash2, ChevronDown, ExternalLink, Sparkles, X, FileText } from 'lucide-react';
import type { Note } from '@/app/lib/types';
import AnalysisResult from './AnalysisResult';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const [showFull, setShowFull] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    onDelete(note._id);
  };

  const truncatedText =
    note.understanding.length > 150
      ? note.understanding.substring(0, 150) + '...'
      : note.understanding;

  return (
    <>
      <div
        className={`bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl p-6 transition-all duration-200 ${
          isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-white flex-1 line-clamp-2 leading-snug">
            {note.title}
          </h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded"
            aria-label="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs text-slate-500">{formatDate(note.createdAt)}</span>
          {note.analysis && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs rounded-md">
              <Sparkles className="w-3 h-3" />
              Analyzed
            </span>
          )}
          {note.reviewCount !== undefined && note.reviewCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded-md">
              {note.reviewCount}× reviewed
            </span>
          )}
        </div>

        {/* Content */}
        <p className="text-slate-400 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {showFull ? note.understanding : truncatedText}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {note.understanding.length > 150 && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="text-slate-500 hover:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              {showFull ? 'Show less' : 'Read more'}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFull ? 'rotate-180' : ''}`} />
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto text-slate-500 hover:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            {note.analysis ? 'View details' : 'View note'}
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-white mb-1">Delete note?</h3>
            <p className="text-slate-400 text-sm mb-5">
              &quot;<span className="text-slate-300">{note.title}</span>&quot; will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Note Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="border-b border-slate-800 p-5 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-white pr-4 line-clamp-1">{note.title}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Note content */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  What I Learned
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {note.understanding}
                </p>
              </div>

              {/* AI Analysis */}
              {note.analysis && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Analysis
                  </h3>
                  <AnalysisResult analysis={note.analysis} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
