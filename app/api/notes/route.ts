import { NextRequest, NextResponse } from 'next/server';
import { listNotes, createNote, getNote, updateNote, deleteNote } from '@/lib/collection';
import { CreateNoteRequest, UpdateNoteRequest } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const noteId = searchParams.get('id');

    if (noteId) {
      const note = await getNote(noteId);
      if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      return NextResponse.json({ note });
    }

    const notes = await listNotes();
    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error('Error in GET /api/notes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateNoteRequest = await request.json();
    const { title, content, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const noteId = await createNote(title, content, tags || []);
    return NextResponse.json({ noteId, success: true });
  } catch (error: any) {
    console.error('Error in POST /api/notes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create note' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateNoteRequest = await request.json();
    const { noteId, title, content, tags } = body;

    if (!noteId || !title || !content) {
      return NextResponse.json(
        { error: 'Note ID, title, and content are required' },
        { status: 400 }
      );
    }

    await updateNote(noteId, title, content, tags || []);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /api/notes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    await deleteNote(noteId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/notes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete note' },
      { status: 500 }
    );
  }
}

