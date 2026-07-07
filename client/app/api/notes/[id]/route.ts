import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/mongodb';
import Note from '@/app/lib/models/Note';

const TITLE_MAX = 200;
const UNDERSTANDING_MAX = 10_000;

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const note = await Note.findOne({ _id: id, userId }).lean();
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
  }

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

  if (title && title.length > TITLE_MAX) {
    return NextResponse.json(
      { error: `Title must be under ${TITLE_MAX} characters` },
      { status: 400 },
    );
  }
  if (understanding && understanding.length > UNDERSTANDING_MAX) {
    return NextResponse.json(
      { error: `Understanding must be under ${UNDERSTANDING_MAX} characters` },
      { status: 400 },
    );
  }

  try {
    await connectDB();
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { title, understanding, analysis },
      { new: true },
    );
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { lastReviewedAt: new Date(), $inc: { reviewCount: 1 } },
      { new: true },
    );
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error updating review stats:', error);
    return NextResponse.json({ error: 'Failed to update review stats' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const note = await Note.findOneAndDelete({ _id: id, userId });
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
