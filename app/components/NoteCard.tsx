'use client';

import React from 'react';
import { Trash2, ExternalLink, Sparkles, X, FileText } from 'lucide-react';
import type { Note } from '@/app/lib/types';
import AnalysisResult from './AnalysisResult';
import { cn } from '@/app/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

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
      {/* Card */}
      <div
        className={cn(
          'group relative rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:bg-secondary/30 hover:border-border',
          isDeleting && 'opacity-0 scale-95'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug flex-1">
            {note.title}
          </h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-shrink-0 p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all duration-150"
            aria-label="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap">
          <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
          {note.analysis && (
            <Badge variant="default" className="gap-1 px-1.5 py-0 text-[11px]">
              <Sparkles className="h-2.5 w-2.5" />
              Analyzed
            </Badge>
          )}
          {note.reviewCount !== undefined && note.reviewCount > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
              {note.reviewCount}&times;
            </Badge>
          )}
        </div>

        {/* Content — always clamped to 3 lines; no expand on card */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {truncatedText}
        </p>

        {/* Footer */}
        <div className="border-t border-border/30 mt-4 pt-3 flex items-center justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View details
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent onClose={() => setShowDeleteConfirm(false)} className="max-w-sm">
          <DialogHeader className="pb-4">
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription className="mt-1.5">
              &quot;<span className="text-foreground">{note.title}</span>&quot; will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Note Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl border border-border/50 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-base font-semibold text-foreground pr-4 line-clamp-1">
                {note.title}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="flex-shrink-0 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* What I Learned */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  What I Learned
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {note.understanding}
                </p>
              </div>

              {/* AI Analysis */}
              {note.analysis && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
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
