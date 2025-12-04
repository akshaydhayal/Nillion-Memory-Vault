# Nillion Memory Vault

A privacy-first personal knowledge base built with Nillion's privacy-preserving infrastructure. Store, search, and query your notes, code snippets, bookmarks, and tweets with complete privacy - all data is encrypted and processed in trusted execution environments.

## ✨ Features

### 📝 Content Types
- **Text Notes**: Create and store encrypted notes with tags
- **Code Snippets**: Save code snippets with syntax highlighting and language detection
- **Bookmarks**: Save articles and links with descriptions
- **Tweet Archive**: Save Twitter/X tweets by URL with automatic content fetching

### 🔐 Authentication & Privacy
- **Email/Password Authentication**: Secure user accounts with encrypted credentials stored in nilDB
- **User Isolation**: Each user can only access their own encrypted data
- **Session Management**: Secure session-based authentication with HTTP-only cookies

### 🤖 AI-Powered Features
- **AI Search**: Search through your memories using natural language queries (nilAI)
- **Ask Question**: Get answers to questions about your stored knowledge (nilAI)
- **Summarize**: Generate AI-powered summaries of all your notes with clear formatting (nilAI)

### 🎨 User Interface
- **Modern Design**: Beautiful UI with gradients, glassmorphism, and smooth animations
- **Landing Page**: Informative landing page for unauthenticated users
- **Responsive Modals**: Pretty modals for adding/viewing content with tabbed interface
- **Visual Indicators**: Color-coded badges and icons for different content types

### 🛡️ Privacy Guarantees
- **Encrypted Storage**: All data encrypted at rest using nilDB
- **Private AI**: All AI operations performed in Trusted Execution Environments (TEE)
- **Zero-Knowledge**: No operator can see your content
- **User-Owned Data**: Complete control over your encrypted memories

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Authentication**: Email/password with bcrypt hashing
- **Storage**: nilDB (Nillion Private Storage) via Secretvaults SDK
- **AI**: nilAI (Private LLMs in TEE) via Nilai SDK
- **Session Management**: HTTP-only cookies

## 📋 Prerequisites

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

## 🚀 Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd nillion-memory-vault
   pnpm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your:
   - `BUILDER_PRIVATE_KEY`: Your hex private key from nilPay (required for nilDB)
   - `NILAI_API_KEY`: Your nilAI API key from nilPay (required for AI features)
   - `NILLION_API_KEY`: Your Nillion API key (optional, can use NILAI_API_KEY)
   - Optional: Override Nillion network URLs if needed

3. **Run Development Server**
   ```bash
   pnpm dev
   ```

4. **Open Browser**
   Navigate to http://localhost:3000

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication routes (register, login, logout, me)
│   │   ├── notes/        # Note CRUD operations
│   │   ├── tweets/       # Tweet fetching
│   │   ├── search/       # AI search
│   │   ├── ask/          # AI Q&A
│   │   └── summarize/    # AI summarization
│   ├── components/        # React components
│   │   ├── AddMemoryModal.tsx    # Unified modal for adding content
│   │   ├── ViewNoteModal.tsx     # Modal for viewing full content
│   │   ├── NoteCard.tsx          # Note display card
│   │   ├── LoginModal.tsx        # Authentication modal
│   │   ├── SearchPanel.tsx       # AI search panel
│   │   ├── QuestionPanel.tsx     # Q&A panel
│   │   ├── SummaryPanel.tsx      # Summary panel
│   │   └── LandingPage.tsx       # Landing page component
│   └── page.tsx          # Main application page
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication logic
│   ├── nillion.ts        # Nillion client initialization
│   ├── nilai.ts          # nilAI integration
│   ├── collection.ts     # Note collection operations
│   ├── session.ts        # Session management
│   └── config.ts         # Configuration
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## 💡 Usage

### Getting Started

1. **Register/Login**: 
   - First-time users can register with email and password
   - Returning users can log in with their credentials
   - Sessions are maintained via secure HTTP-only cookies

2. **Add Content**:
   - Click "Add Memory to nilDB" to open the content creation modal
   - Choose from 4 tabs:
     - **Text Note**: Write notes with title, content, and tags
     - **Save Tweet**: Paste a Twitter/X URL to automatically fetch and save tweets
     - **Code Snippet**: Save code with language selection and syntax highlighting
     - **Bookmark**: Save URLs with title, description, and tags

3. **View Content**:
   - All your memories are displayed in a beautiful grid layout
   - Click the eye icon to view full content in a modal
   - Code snippets show with copy functionality
   - Bookmarks show clickable links

4. **AI Features**:
   - **AI Search**: Click "AI Search" to search through all your memories using natural language
   - **Ask Question**: Click "Ask Question" to get answers about your stored knowledge
   - **Summarize**: Click "Summarize" to get an AI-generated summary of all your notes

### Content Types

- **Text Notes**: Perfect for thoughts, research, and general notes
- **Code Snippets**: Save code examples with language detection (JavaScript, Python, TypeScript, etc.)
- **Bookmarks**: Archive articles and links with descriptions
- **Tweets**: Save important tweets by pasting their URL

## 🔒 Privacy & Security

- **Encrypted at Rest**: All data stored in nilDB is encrypted
- **TEE Processing**: All AI operations run in Trusted Execution Environments
- **User Isolation**: Each user's data is completely isolated
- **No Plaintext**: Operators cannot see your content
- **Secure Sessions**: HTTP-only cookies prevent XSS attacks

## 🎨 Design Features

- **Glassmorphism**: Modern frosted glass effects
- **Gradient Themes**: Color-coded content types
- **Smooth Animations**: Hover effects and transitions
- **Responsive Design**: Works on all screen sizes
- **Dark Mode**: Full dark mode support

## 🐛 Troubleshooting

### Authentication Issues
- Ensure your `BUILDER_PRIVATE_KEY` is correctly set in `.env`
- Check that the users collection is properly initialized

### AI Features Not Working
- Verify your `NILAI_API_KEY` is set and valid
- Ensure you have an active nilAI subscription
- Check the browser console for error messages

### Data Not Loading
- Check your network connection
- Verify nilDB subscription is active
- Review server logs for detailed error messages

## 📚 Resources

- [Nillion Documentation](https://docs.nillion.com)
- [Secretvaults SDK Docs](https://docs.nillion.com/build/private-storage/ts-docs)
- [Private LLMs Guide](https://docs.nillion.com/build/private-llms/overview)
- [Collection Explorer](https://collection-explorer.nillion.com)

## 📝 License

MIT

## 🙏 Acknowledgments

Built with [Nillion](https://nillion.com) - Privacy-preserving computation infrastructure.
