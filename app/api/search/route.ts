import { NextRequest, NextResponse } from 'next/server';
import { listNotes } from '@/lib/collection';
import { SearchRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Get all notes
    const notes = await listNotes();
    
    if (notes.length === 0) {
      return NextResponse.json({
        result: 'No notes found in your vault.',
      });
    }

    // Extract note content for search (title + content)
    const noteTexts = notes.map(note => 
      `Title: ${note.title}\nContent: ${note.content}`
    );

    // Dynamically import searchNotes to avoid module conflicts
    // This prevents @nillion/nilai-ts from conflicting with @nillion/nuc
    const { searchNotes } = await import('@/lib/nilai');
    const result = await searchNotes(query, noteTexts);

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error in POST /api/search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform search' },
      { status: 500 }
    );
  }
}

