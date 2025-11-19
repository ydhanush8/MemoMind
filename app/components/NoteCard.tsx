'use client';

import React from 'react';
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    // Call onDelete immediately so grid reflows
    const noteId = (note as { _id?: string })._id || note.id;
    onDelete(noteId);
  };

  const truncatedText =
    note.understanding.length > 150
      ? note.understanding.substring(0, 150) + '...'
      : note.understanding;

  return (
    <>
      <div
        className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-blue-500/50 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 transform hover:-translate-y-1 ${
          isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl font-bold text-white flex-1 line-clamp-2">{note.title}</h3>
          <button
            onClick={handleDeleteClick}
            className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-900/20"
            aria-label="Delete note"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-slate-400">{formatDate(note.createdAt)}</span>
          {note.analysis && (
            <span className="ml-2 px-2 py-0.5 bg-purple-900/50 border border-purple-700/50 text-purple-300 text-xs rounded-full">
              🤖 AI Analyzed
            </span>
          )}
        </div>

        {/* Content */}
        <div className="text-slate-300 leading-relaxed mb-3">
          <p className="whitespace-pre-wrap">{showFull ? note.understanding : truncatedText}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {note.understanding.length > 150 && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              {showFull ? 'Show less' : 'Read more'}
              <svg
                className={`w-4 h-4 transition-transform ${showFull ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="ml-auto text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            {note.analysis ? '🤖 View Full Details' : '📖 View Full Note'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Note?</h3>
                <p className="text-slate-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6">
              Are you sure you want to delete &quot;
              <span className="font-semibold">{note.title}</span>&quot;?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
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
            {/* Modal Header - Fixed, no scroll */}
            <div className="bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-bold text-white pr-4">{note.title}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Original Note */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  What I Learned
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {note.understanding}
                </p>
              </div>

              {/* AI Analysis */}
              {note.analysis && (
                <>
                  <div className="border-t border-slate-700 pt-6">
                    <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      AI Analysis
                    </h3>
                  </div>
                  <AnalysisResult analysis={note.analysis} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
