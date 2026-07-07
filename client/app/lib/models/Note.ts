import { Schema, model, models } from 'mongoose';
import type { AnalysisResponse } from '../types';

export interface INote {
  userId: string;
  title: string;
  understanding: string;
  analysis?: AnalysisResponse;
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt?: Date;
  reviewCount: number;
}

const NoteSchema = new Schema<INote>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    understanding: {
      type: String,
      required: [true, 'Understanding is required'],
    },
    analysis: {
      type: Schema.Types.Mixed,
      default: null,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1, lastReviewedAt: 1 });

const Note = models.Note || model<INote>('Note', NoteSchema);

export default Note;
