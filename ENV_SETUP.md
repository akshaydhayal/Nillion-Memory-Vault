# Environment Variables Setup Guide

This guide will help you get all the required environment variables for Nillion MemoryVault.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your keys** (see instructions below)

## Required Environment Variables

### 1. BUILDER_PRIVATE_KEY (Required)

**What it is:** Your private key for authenticating with nilDB (Nillion's private storage)

**Where to get it:**
1. Go to [nilPay](https://nilpay.vercel.app/)
2. Create or connect your Nillion wallet
3. Subscribe to **nilDB** service (you'll need NIL tokens)
4. After subscribing, you'll see your **private key** (hex format)
5. Copy the entire private key

**Format:** Hex string (usually starts with `0x` or is a long hex string)
```
BUILDER_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Important:** Keep this key secure! Never commit it to git.

---

### 2. NILAI_API_KEY (Required for AI features)

**What it is:** Your API key for accessing nilAI (Nillion's private LLM service)

**Where to get it:**
1. Go to [nilPay](https://nilpay.vercel.app/)
2. Make sure you're connected with the same wallet
3. Subscribe to **nilAI** service (you'll need NIL tokens)
4. After subscribing, you'll see your **API key**
5. Copy the API key

**Format:** String (usually a long alphanumeric string)
```
NILAI_API_KEY=your-api-key-here-12345
```

**Note:** Without this key, AI features (search, Q&A, summarize) won't work, but you can still create and store notes.

---

## Prerequisites Before Getting Keys

### Step 1: Create Nillion Wallet

1. Visit: https://docs.nillion.com/community/guides/nillion-wallet
2. Follow the instructions to create your wallet
3. **Save your wallet credentials securely** - you'll need them to access nilPay

### Step 2: Get Testnet Tokens

1. Visit: https://faucet.testnet.nillion.com/
2. Enter your wallet address
3. Request testnet NIL tokens
4. Wait for tokens to arrive (usually instant)

### Step 3: Subscribe to Services

1. Visit: https://nilpay.vercel.app/
2. Connect your wallet
3. **Subscribe to nilDB:**
   - Select nilDB service
   - Pay the subscription fee with NIL tokens
   - **Copy your private key** from the subscription page
4. **Subscribe to nilAI:**
   - Select nilAI service
   - Pay the subscription fee with NIL tokens
   - **Copy your API key** from the subscription page

---

## Optional Environment Variables

These have sensible defaults and usually don't need to be changed:

### NILCHAIN_URL
- **Default:** `http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz`
- **When to change:** Only if using a different network or custom endpoint

### NILAUTH_URL
- **Default:** `https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz`
- **When to change:** Only if using a different auth endpoint

### NILDB_NODES
- **Default:** Testnet nodes (3 nodes)
- **When to change:** Only if using different nilDB nodes

### NILAI_BASE_URL
- **Default:** `https://nilai-api.nillion.network`
- **When to change:** Only if using a different nilAI endpoint

### NILAI_MODEL
- **Default:** `meta-llama/Llama-3.1-8B-Instruct`
- **When to change:** If you want to use a different model
- **Available models:** Check https://docs.nillion.com/build/private-llms/overview#available-models

---

## Example .env File

Here's what a complete `.env` file should look like:

```env
# Required
BUILDER_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
NILAI_API_KEY=your-actual-api-key-here

# Optional (commented out - using defaults)
# NILAI_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

---

## Verification

After setting up your `.env` file:

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Check health endpoint:**
   - Visit: http://localhost:3000/api/health
   - Should show:
     ```json
     {
       "status": "ok",
       "config": {
         "hasBuilderKey": true,
         "hasNilAIKey": true,
         "nildbNodes": 3
       }
     }
     ```

3. **If you see errors:**
   - Make sure `.env` file exists in the project root
   - Check that keys are correct (no extra spaces)
   - Verify your subscriptions are active on nilPay
   - Check the browser console and server logs for specific errors

---

## Troubleshooting

### "BUILDER_PRIVATE_KEY is required"
- Make sure `.env` file exists in the project root
- Check that the key is set correctly (no quotes needed)
- Verify the key format (should be hex string)

### "NILAI_API_KEY is required"
- This only affects AI features
- You can still use the app for storing notes without this
- Make sure you've subscribed to nilAI on nilPay

### Keys not working
- Verify your subscriptions are still active on nilPay
- Check that you copied the entire key (no truncation)
- Make sure there are no extra spaces or quotes in `.env`

### Still having issues?
- Check the [Nillion Documentation](https://docs.nillion.com)
- Visit [Nillion Status Page](https://status.nillion.com) to check service status
- See [SETUP.md](./SETUP.md) for more detailed setup instructions

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit your `.env` file to git (it's already in `.gitignore`)
- Never share your private keys
- Keep your wallet credentials secure
- The `.user-keypair.json` file (generated automatically) should also be kept secure

