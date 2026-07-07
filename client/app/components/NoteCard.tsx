'use client';

import React from 'react';
import { Trash2, ArrowUpRight, Sparkles, X, FileText } from 'lucide-react';
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
  const [showModal, setShowModal] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
        role="button"
        tabIndex={0}
        onClick={() => setShowModal(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowModal(true);
          }
        }}
        className={cn(
          'group relative flex flex-col text-left rounded-2xl border border-border/60 bg-card p-5 shadow-elevation-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer',
          isDeleting && 'opacity-0 scale-95 pointer-events-none',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-bold text-foreground line-clamp-2 leading-snug flex-1 tracking-tight">
            {note.title}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="flex-shrink-0 p-1.5 -mr-1 -mt-1 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
            aria-label="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2.5 mb-3 flex-wrap">
          <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
          {note.analysis && (
            <Badge variant="default" className="px-2 py-0 text-[11px]">
              <Sparkles className="h-2.5 w-2.5" />
              Analyzed
            </Badge>
          )}
          {note.reviewCount !== undefined && note.reviewCount > 0 && (
            <Badge variant="secondary" className="px-2 py-0 text-[11px]">
              {note.reviewCount}&times; reviewed
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {truncatedText}
        </p>

        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-end">
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary flex items-center gap-1 transition-colors">
            View details
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent onClose={() => setShowDeleteConfirm(false)} className="max-w-sm">
          <DialogHeader className="pb-4">
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription className="mt-1.5">
              &quot;<span className="text-foreground font-medium">{note.title}</span>&quot; will be
              permanently removed.
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

      {showModal && (
        <div
          className="fixed inset-0 bg-background/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border border-border/60 bg-card shadow-elevation-3 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-base font-bold text-foreground pr-4 line-clamp-1 tracking-tight">
                {note.title}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="bg-secondary/50 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  What I Learned
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {note.understanding}
                </p>
              </div>

              {note.analysis && (
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
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
