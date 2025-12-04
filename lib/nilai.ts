import { nillionConfig } from './config';

// Available models on Nillion testnet (check docs for latest)
// Default: meta-llama/Llama-3.1-8B-Instruct
// Other models may require special access

export interface NilAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface NilAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callNilAI(request: NilAIRequest): Promise<NilAIResponse> {
  if (!nillionConfig.NILAI_API_KEY) {
    throw new Error('NILAI_API_KEY is required. Please set it in your .env file.');
  }

  const response = await fetch(`${nillionConfig.NILAI_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${nillionConfig.NILAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: request.model || nillionConfig.NILAI_MODEL,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`NilAI API error: ${error}`);
  }

  return response.json();
}

export async function searchNotes(query: string, notes: string[]): Promise<string> {
  const context = notes.join('\n\n---\n\n');
  
  const response = await callNilAI({
    model: nillionConfig.NILAI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that searches through user notes and provides relevant information. Be concise and accurate.',
      },
      {
        role: 'user',
        content: `Based on the following notes, answer this query: "${query}"\n\nNotes:\n${context}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || 'No results found.';
}

export async function summarizeNotes(notes: string[]): Promise<string> {
  const context = notes.join('\n\n---\n\n');
  
  const response = await callNilAI({
    model: nillionConfig.NILAI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates concise summaries of user notes. Focus on key points and themes.',
      },
      {
        role: 'user',
        content: `Summarize the following notes:\n\n${context}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || 'Unable to generate summary.';
}

export async function answerQuestion(question: string, context: string): Promise<string> {
  const response = await callNilAI({
    model: nillionConfig.NILAI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that answers questions based on the user\'s personal knowledge base. Use only the provided context to answer. If the context doesn\'t contain the answer, say so.',
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nContext from user's notes:\n${context}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'Unable to generate answer.';
}

