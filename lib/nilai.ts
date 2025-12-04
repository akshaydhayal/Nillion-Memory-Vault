// Use dynamic import to avoid module initialization conflicts with @nillion/nuc
// @nillion/nilai-ts has its own bundled @nillion/nuc which conflicts with direct imports
import { nillionConfig } from './config';

// Available models on Nillion testnet (check docs for latest)
// Default: google/gemma-3-27b-it
// Other models: meta-llama/Llama-3.1-8B-Instruct, etc.

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
  const apiKey = nillionConfig.NILLION_API_KEY;
  if (!apiKey) {
    throw new Error('NILLION_API_KEY is required. Please set it in your .env file. Get it from https://nilpay.vercel.app/');
  }

  console.log('callNilAI: Initializing nilAI client...');
  console.log(`callNilAI: Base URL: ${nillionConfig.NILAI_BASE_URL}`);
  console.log(`callNilAI: Model: ${request.model || nillionConfig.NILAI_MODEL}`);
  console.log(`callNilAI: API Key present: ${!!apiKey} (length: ${apiKey.length})`);
  console.log(`callNilAI: API Key first 10 chars: ${apiKey.substring(0, 10)}...`);
  console.log(`callNilAI: NILAUTH_URL: ${nillionConfig.NILAUTH_URL}`);

  try {
    // Dynamically import nilAI client to avoid module conflicts with @nillion/nuc
    const { NilaiOpenAIClient, NilAuthInstance } = await import('@nillion/nilai-ts');
    
    // Initialize the nilAI OpenAI client
    // The API key should be sufficient - it contains subscription info
    // According to docs, we only need baseURL, apiKey, and nilauthInstance
    const client = new NilaiOpenAIClient({
      baseURL: nillionConfig.NILAI_BASE_URL,
      apiKey: apiKey,
      nilauthInstance: NilAuthInstance.SANDBOX,
    });

    console.log('callNilAI: Client initialized, making request...');

    // Make a request to the Nilai API
    const response = await client.chat.completions.create({
      model: request.model || nillionConfig.NILAI_MODEL,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2000,
    });

    console.log('callNilAI: Request completed successfully');
    return response as unknown as NilAIResponse;
  } catch (error: any) {
    console.error('callNilAI: Error details:', error);
    console.error('callNilAI: Error message:', error.message);
    console.error('callNilAI: Error cause:', error.cause);
    console.error('callNilAI: Full error:', JSON.stringify(error, null, 2));
    
    // Check if it's a subscription error
    if (error.message?.includes('NOT_SUBSCRIBED') || 
        error.message?.includes('not subscribed') ||
        error.cause?.message?.includes('NOT_SUBSCRIBED') ||
        error.cause?.message?.includes('not subscribed')) {
      
      const detailedError = `
Your NILLION_API_KEY does not have an active nilAI subscription.

Troubleshooting steps:
1. Visit https://nilpay.vercel.app/ and verify you have an ACTIVE subscription to nilAI (not just nilDB)
2. Make sure your subscription hasn't expired
3. Verify you copied the nilAI API key (not the nilDB private key)
4. The API key should be from the nilAI subscription page, not nilDB
5. Try refreshing your subscription or re-subscribing if needed

Error details:
- Status: ${error.cause?.status || 'unknown'}
- URL: ${error.cause?.url || 'unknown'}
- Message: ${error.message || error.cause?.message || 'Unknown error'}
      `.trim();
      
      throw new Error(detailedError);
    }
    
    // Re-throw other errors with more context
    throw new Error(`nilAI API error: ${error.message || JSON.stringify(error)}`);
  }
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
        content: 'You are a helpful assistant that creates organized summaries of user notes. For each note, create a clear section with the note title as a heading (## Title) followed by a concise summary of that note\'s key points. Group related notes together when appropriate, but always maintain clear separation between different notes using headings.',
      },
      {
        role: 'user',
        content: `Create a well-organized summary of the following notes. For each note, use the format:\n\n## [Note Title]\n\n[Summary of key points from this note]\n\nSeparate different notes clearly with headings. Group related information when it makes sense, but keep each note distinct:\n\n${context}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 2000,
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

