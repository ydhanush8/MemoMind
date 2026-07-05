import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/app/lib/mongodb';
import Note from '@/app/lib/models/Note';

const TITLE_MAX = 200;
const UNDERSTANDING_MAX = 10_000;
const DAILY_NOTE_LIMIT = 100; // Prevents storage abuse

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const notes = await Note.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { title?: string; understanding?: string; analysis?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { title, understanding, analysis } = body;

  if (!title?.trim() || !understanding?.trim()) {
    return NextResponse.json({ error: 'Title and understanding are required' }, { status: 400 });
  }
  if (title.length > TITLE_MAX) {
    return NextResponse.json(
      { error: `Title must be under ${TITLE_MAX} characters` },
      { status: 400 },
    );
  }
  if (understanding.length > UNDERSTANDING_MAX) {
    return NextResponse.json(
      { error: `Understanding must be under ${UNDERSTANDING_MAX} characters` },
      { status: 400 },
    );
  }

  try {
    await connectDB();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayCount = await Note.countDocuments({ userId, createdAt: { $gte: today } });
    if (todayCount >= DAILY_NOTE_LIMIT) {
      return NextResponse.json(
        { error: `Daily note limit of ${DAILY_NOTE_LIMIT} reached. Try again tomorrow.` },
        { status: 429 },
      );
    }

    const note = await Note.create({
      userId,
      title: title.trim(),
      understanding: understanding.trim(),
      analysis: analysis ?? null,
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
