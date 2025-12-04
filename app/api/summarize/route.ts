import { NextRequest, NextResponse } from 'next/server';
import { listNotes } from '@/lib/collection';
import { summarizeNotes } from '@/lib/nilai';

export async function POST(request: NextRequest) {
  try {
    const notes = await listNotes();
    
    if (notes.length === 0) {
      return NextResponse.json({
        summary: 'No notes found in your vault.',
      });
    }

    // Extract note content
    const noteTexts = notes.map(note => 
      `Title: ${note.title}\nContent: ${note.content}`
    );

    // Use nilAI to summarize
    const summary = await summarizeNotes(noteTexts);

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error in POST /api/summarize:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

