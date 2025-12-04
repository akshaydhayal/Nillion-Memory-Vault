# Setup Guide for Nillion MemoryVault

This guide will help you set up Nillion MemoryVault step by step.

## Step 1: Get Nillion Wallet and Tokens

1. **Create a Nillion Wallet**
   - Visit: https://docs.nillion.com/community/guides/nillion-wallet
   - Follow the instructions to create your wallet
   - Save your wallet credentials securely

2. **Get Testnet NIL Tokens**
   - Visit the faucet: https://faucet.testnet.nillion.com/
   - Request testnet tokens for your wallet

## Step 2: Subscribe to Nillion Services

1. **Visit nilPay**
   - Go to: https://nilpay.vercel.app/
   - Connect your wallet

2. **Subscribe to nilDB (Private Storage)**
   - Select nilDB service
   - Pay with NIL tokens to subscribe
   - **Save your API key and private key** - you'll need these!

3. **Subscribe to nilAI (Private LLMs)**
   - Select nilAI service
   - Pay with NIL tokens to subscribe
   - **Save your nilAI API key** - you'll need this!

## Step 3: Install Dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

## Step 4: Configure Environment

1. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and add:
   ```env
   # Your builder private key from nilPay (hex format)
   BUILDER_PRIVATE_KEY=your-hex-private-key-here

   # Your nilAI API key from nilPay
   NILAI_API_KEY=your-nilai-api-key-here

   # Optional: Override defaults if needed
   # NILAI_MODEL=meta-llama/Llama-3.1-8B-Instruct
   ```

## Step 5: Run the Application

```bash
# Start the development server
pnpm dev
```

The application will be available at http://localhost:3000

## Step 6: Verify Setup

1. **Check Health Endpoint**
   - Visit: http://localhost:3000/api/health
   - Should show `hasBuilderKey: true` and `hasNilAIKey: true`

2. **Create Your First Note**
   - Click "New Note" in the app
   - Add a title and content
   - Save the note
   - It should appear in your notes list

3. **Test AI Features**
   - Try "AI Search" to search your notes
   - Try "Ask Question" to query your memories
   - Try "Summarize" to get an overview

## Troubleshooting

### "BUILDER_PRIVATE_KEY is required" Error
- Make sure you've set `BUILDER_PRIVATE_KEY` in your `.env` file
- Verify the key is in hex format (starts with `0x` or is a hex string)

### "NILAI_API_KEY is required" Error
- Make sure you've subscribed to nilAI service via nilPay
- Copy the API key exactly as shown in nilPay
- Make sure it's set in your `.env` file

### Notes Not Appearing
- Check the browser console for errors
- Check the server logs for API errors
- Verify your nilDB subscription is active
- Try creating a new note

### AI Features Not Working
- Verify your nilAI subscription is active
- Check that `NILAI_API_KEY` is set correctly
- Check the model name matches available models on testnet
- See Nillion docs for available models: https://docs.nillion.com/build/private-llms/overview#available-models

### User Keypair Issues
- The app automatically generates and stores a user keypair in `.user-keypair.json`
- If you delete this file, a new user identity will be created (you'll lose access to old notes)
- Keep this file secure and backed up if you want to persist your data

## Next Steps

- Explore the Collection Explorer: https://collection-explorer.nillion.com
- Read the Nillion docs: https://docs.nillion.com
- Check out examples: https://github.com/NillionNetwork/blind-module-examples

## Support

- Nillion Documentation: https://docs.nillion.com
- Community Support: https://docs.nillion.com/community-and-support
- Status Page: https://status.nillion.com

