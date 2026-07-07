import Note from '../models/Note.js';
import { AppError } from '../utils/appError.js';
import { LIMITS } from '../utils/constants.js';
import { utcMidnight } from '../utils/date.js';
import type { CreateNoteInput, UpdateNoteInput } from '../types/note.types.js';

export async function listNotes(userId: string) {
  try {
    return await Note.find({ userId }).sort({ createdAt: -1 }).lean();
  } catch {
    throw new AppError(500, 'Failed to fetch notes');
  }
}

export async function getNote(userId: string, id: string) {
  try {
    const note = await Note.findOne({ _id: id, userId }).lean();
    if (!note) throw new AppError(404, 'Note not found');
    return note;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to fetch note');
  }
}

export async function createNote(userId: string, input: CreateNoteInput) {
  try {
    const today = utcMidnight();
    const todayCount = await Note.countDocuments({ userId, createdAt: { $gte: today } });
    if (todayCount >= LIMITS.DAILY_NOTE_LIMIT) {
      throw new AppError(
        429,
        `Daily note limit of ${LIMITS.DAILY_NOTE_LIMIT} reached. Try again tomorrow.`,
      );
    }

    return await Note.create({
      userId,
      title: input.title.trim(),
      understanding: input.understanding.trim(),
      analysis: input.analysis ?? null,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to create note');
  }
}

export async function updateNote(userId: string, id: string, input: UpdateNoteInput) {
  try {
    // Mongoose ignores undefined fields, matching the original partial-update behaviour.
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { title: input.title, understanding: input.understanding, analysis: input.analysis },
      { new: true },
    );
    if (!note) throw new AppError(404, 'Note not found');
    return note;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to update note');
  }
}

export async function markReviewed(userId: string, id: string) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { lastReviewedAt: new Date(), $inc: { reviewCount: 1 } },
      { new: true },
    );
    if (!note) throw new AppError(404, 'Note not found');
    return note;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to update review stats');
  }
}

export async function deleteNote(userId: string, id: string) {
  try {
    const note = await Note.findOneAndDelete({ _id: id, userId });
    if (!note) throw new AppError(404, 'Note not found');
    return { message: 'Note deleted successfully' };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to delete note');
  }
}
