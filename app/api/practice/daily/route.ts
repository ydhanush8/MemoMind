import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/app/lib/mongodb';
import Note from '@/app/lib/models/Note';

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // UTC midnight for consistent timezone handling

    // Fetch the 10 least-recently-reviewed notes (prioritizes older reviews)
    const candidates = await Note.find({
      userId,
      $or: [{ lastReviewedAt: { $lt: today } }, { lastReviewedAt: null }],
    })
      .sort({ lastReviewedAt: 1 }) // null values sort first in MongoDB
      .limit(10)
      .lean();

    if (candidates.length === 0) {
      return NextResponse.json([]);
    }

    // Shuffle candidates fairly (Fisher-Yates) and pick 2-5
    const shuffled = fisherYatesShuffle(candidates);
    const count = Math.min(Math.max(2, Math.ceil(Math.random() * 4) + 1), shuffled.length);
    const selected = shuffled.slice(0, count);

    return NextResponse.json(selected);
  } catch (error) {
    console.error('Error fetching daily practice notes:', error);
    return NextResponse.json({ error: 'Failed to fetch practice notes' }, { status: 500 });
  }
}
