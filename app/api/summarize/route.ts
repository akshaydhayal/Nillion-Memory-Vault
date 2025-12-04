import { NextRequest, NextResponse } from 'next/server';
import { listNotes } from '@/lib/collection';

export async function POST(request: NextRequest) {
  try {
    const notes = await listNotes();
    
    if (notes.length === 0) {
      return NextResponse.json({
        summary: 'No notes found in your vault.',
      });
    }

    // Extract note content with clear structure
    const noteTexts = notes.map(note => 
      `NOTE: "${note.title}"\n\n${note.content}`
    );

    // Dynamically import summarizeNotes to avoid module conflicts
    const { summarizeNotes } = await import('@/lib/nilai');
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

