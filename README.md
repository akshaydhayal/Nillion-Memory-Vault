# Nillion MemoryVault

A privacy-first personal knowledge base built with Nillion's privacy-preserving infrastructure. Store, search, and query your notes and documents with complete privacy - all data is encrypted and processed in trusted execution environments.

## Features

- 🔒 **Private Storage**: Encrypted notes and documents stored in nilDB
- 🤖 **AI-Powered Search**: Search and summarize your memories using nilAI
- 💬 **Memory Q&A**: Ask questions about your stored knowledge with nilRAG
- 🛡️ **Zero-Knowledge**: All data and queries remain private - no operator can see your content

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Storage**: nilDB (Nillion Private Storage) via Secretvaults SDK
- **AI**: nilAI (Private LLMs in TEE)
- **Retrieval**: nilRAG for contextual memory retrieval

## Prerequisites

1. **Get Nillion API Keys**
   - Create a Nillion Wallet: https://docs.nillion.com/community/guides/nillion-wallet
   - Get testnet NIL tokens: https://faucet.testnet.nillion.com/
   - Subscribe to services via nilPay: https://nilpay.vercel.app/
   - You'll need subscriptions for:
     - nilDB (Private Storage)
     - nilAI (Private LLMs)

2. **System Requirements**
   - Node.js 22+
   - pnpm (or npm/yarn)

## Setup

1. **Clone and Install**
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your:
   - `BUILDER_PRIVATE_KEY`: Your hex private key from nilPay (required for nilDB)
   - `NILAI_API_KEY`: Your nilAI API key from nilPay (required for AI features)
   - Optional: Override Nillion network URLs if needed

3. **Run Development Server**
   ```bash
   pnpm dev
   ```

4. **Open Browser**
   Navigate to http://localhost:3000

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes for backend operations
│   ├── components/        # React components
│   └── page.tsx          # Main page
├── lib/                   # Utility functions and Nillion clients
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## Usage

1. **Create Notes**: Add encrypted notes to your personal knowledge base
   - Click "New Note" to create a note
   - Notes are automatically encrypted and stored in nilDB
   - Your user keypair is stored locally (`.user-keypair.json`) to persist your data

2. **Search**: Use AI-powered search to find relevant memories
   - Click "AI Search" to search through your notes using nilAI
   - All search queries are processed privately in TEE

3. **Ask Questions**: Query your stored knowledge with natural language
   - Click "Ask Question" to ask questions about your notes
   - Uses nilRAG-style retrieval to find relevant context
   - Answers are generated using nilAI in a TEE

4. **Summarize**: Get AI-generated summaries of your notes
   - Click "Summarize" to get an overview of all your notes
   - Summary is generated using nilAI

## Privacy Guarantees

- All data encrypted at rest (nilDB)
- All computation in TEE (nilAI)
- No plaintext visible to operators
- User-owned data with selective sharing

## Resources

- [Nillion Documentation](https://docs.nillion.com)
- [Secretvaults SDK Docs](https://docs.nillion.com/build/private-storage/ts-docs)
- [Private LLMs Guide](https://docs.nillion.com/build/private-llms/overview)
- [Collection Explorer](https://collection-explorer.nillion.com)

## License

MIT

