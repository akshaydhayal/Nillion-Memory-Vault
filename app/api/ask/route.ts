import { NextRequest, NextResponse } from 'next/server';
import { listNotes } from '@/lib/collection';
import { answerQuestion } from '@/lib/nilai';
import { QuestionRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: QuestionRequest = await request.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get all notes for context
    const notes = await listNotes();
    
    if (notes.length === 0) {
      return NextResponse.json({
        answer: 'No notes found in your vault. Add some notes first to ask questions.',
      });
    }

    // Extract note content for context
    const noteTexts = notes.map(note => 
      `Title: ${note.title}\nContent: ${note.content}`
    );

    const context = noteTexts.join('\n\n---\n\n');

    // Use nilAI to answer the question with context
    const answer = await answerQuestion(question, context);

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('Error in POST /api/ask:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to answer question' },
      { status: 500 }
    );
  }
}

