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

    console.log('GET /api/notes: Starting to fetch notes...');
    
    // Add timeout to prevent hanging (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout: Notes fetch took too long')), 30000);
    });

    const notesPromise = listNotes();
    const notes = await Promise.race([notesPromise, timeoutPromise]) as Awaited<ReturnType<typeof listNotes>>;
    
    console.log(`GET /api/notes: Successfully fetched ${notes.length} notes`);
    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error('Error in GET /api/notes:', error);
    
    // If timeout, return empty array instead of error
    if (error.message?.includes('timeout')) {
      console.warn('Notes fetch timed out, returning empty array');
      return NextResponse.json({ notes: [] });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notes', notes: [] },
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
    // Log detailed error information
    console.error('Error in POST /api/notes:');
    
    // Log the full error structure with proper stringification
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((nodeError: any, index: number) => {
        const errorBody = nodeError.error?.body;
        const status = nodeError.error?.status;
        const errorMsg = typeof errorBody === 'object' 
          ? JSON.stringify(errorBody, null, 2) 
          : errorBody || nodeError.error?.message || 'Unknown error';
        console.error(`  API Route - Node ${index + 1} (status ${status}):`, errorMsg);
      });
    } else {
      // Try to stringify the whole error
      try {
        console.error('  Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      } catch {
        console.error('  Error message:', error.message || error);
        console.error('  Error stack:', error.stack);
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create note. The collection may need to be created first.' },
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

