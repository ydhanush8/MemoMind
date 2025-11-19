import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/app/lib/mongodb';
import Note from '@/app/lib/models/Note';

// GET /api/practice/daily - Get 2-5 random notes for daily practice
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find notes that haven't been reviewed today
    const candidateNotes = await Note.find({
      userId,
      $or: [
        { lastReviewedAt: { $lt: today } }, // Reviewed before today
        { lastReviewedAt: null }, // Never reviewed
      ],
    })
      .sort({ lastReviewedAt: 1 }) // Oldest first (or null first)
      .limit(10) // Get top 10 candidates
      .lean();

    // If no notes available
    if (candidateNotes.length === 0) {
      return NextResponse.json([]);
    }

    // Randomly select 2-5 notes from candidates
    const count = Math.min(
      Math.max(2, Math.floor(Math.random() * 4) + 2), // Random between 2-5
      candidateNotes.length,
    );

    // Shuffle and take the first 'count' notes
    const shuffled = candidateNotes.sort(() => Math.random() - 0.5);
    const selectedNotes = shuffled.slice(0, count);

    return NextResponse.json(selectedNotes);
  } catch (error) {
    console.error('Error fetching daily practice notes:', error);
    return NextResponse.json({ error: 'Failed to fetch practice notes' }, { status: 500 });
  }
}
