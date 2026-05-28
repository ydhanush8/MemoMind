import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/app/lib/mongodb';
import Note from '@/app/lib/models/Note';
import { isUserPremium } from '@/app/lib/checkPremium';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const premium = await isUserPremium(userId);
    if (!premium) {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [reviewedToday, totalNotes, notesNeedingReview] = await Promise.all([
      Note.countDocuments({ userId, lastReviewedAt: { $gte: today } }),
      Note.countDocuments({ userId }),
      Note.countDocuments({
        userId,
        $or: [{ lastReviewedAt: { $lt: today } }, { lastReviewedAt: null }],
      }),
    ]);

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
