import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/app/lib/mongodb';
import Note from '@/app/lib/models/Note';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reviewedToday = await Note.countDocuments({
      userId,
      lastReviewedAt: { $gte: today },
    });

    const totalNotes = await Note.countDocuments({ userId });

    const notesNeedingReview = await Note.countDocuments({
      userId,
      $or: [{ lastReviewedAt: { $lt: today } }, { lastReviewedAt: null }],
    });

    return NextResponse.json({
      completed: reviewedToday >= 2,
      reviewedToday,
      totalNotes,
      notesNeedingReview,
    });
  } catch (error) {
    console.error('Error fetching practice status:', error);
    return NextResponse.json({ error: 'Failed to fetch practice status' }, { status: 500 });
  }
}
