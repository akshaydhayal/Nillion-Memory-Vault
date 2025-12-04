# Authentication & Privacy Implementation

## Overview

Nillion MemoryVault now implements **session-based authentication** to ensure that each user only sees their own notes. Every browser session gets a unique identity, and notes are automatically isolated per session.

## How It Works

### 1. Session Management
- Each browser session gets a unique **session ID** stored in an HTTP-only cookie
- The session cookie is automatically created on first visit
- Sessions persist for 30 days
- Each session has its own unique **user ID**

### 2. User Identity
- Each session gets its own **Nillion user signer** (private key)
- User signers are stored in `.sessions/` directory, one file per session
- Each signer generates a unique **DID** (Decentralized Identifier)
- Notes are owned by the user's DID, ensuring automatic isolation

### 3. Data Isolation
- When you create a note, it's stored with `owner: userDid` (your session's DID)
- When you list notes, only notes owned by your DID are returned
- Other users (different sessions) cannot see your notes because they have different DIDs
- This is enforced at the Nillion nilDB level - data is encrypted and access-controlled

### 4. Privacy Guarantees
- ✅ **Session-based isolation**: Each browser session is a separate "user"
- ✅ **Encrypted storage**: All notes are encrypted using Nillion's nilDB
- ✅ **Private keys**: User signers are stored server-side in `.sessions/` directory
- ✅ **No cross-session access**: Users cannot access each other's notes
- ✅ **Automatic cleanup**: Old sessions can be cleaned up (optional)

## File Structure

```
.sessions/
  ├── {session-id-1}.json  # User signer for session 1
  ├── {session-id-2}.json  # User signer for session 2
  └── ...
```

Each session file contains:
- `privateKey`: The user's private key (hex format)
- `sessionId`: The session identifier
- `createdAt`: When the session was created

## API Endpoints

### `GET /api/session`
Returns information about the current session:
```json
{
  "sessionId": "abc12345...",
  "userId": "xyz67890...",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "message": "Each browser session has a unique identity. Your notes are private to this session."
}
```

## Testing Multi-User Isolation

To test that users are properly isolated:

1. **Open two different browsers** (or incognito windows)
2. **Create notes in each browser**
3. **Verify**: Each browser only sees its own notes

This works because:
- Each browser gets a different session cookie
- Each session gets a different user signer
- Each signer generates a different DID
- Notes are filtered by DID

## Security Notes

- **Session cookies** are HTTP-only (not accessible via JavaScript)
- **User signers** are stored server-side only
- **Private keys** are never exposed to the client
- **Data encryption** is handled by Nillion's nilDB infrastructure
- **Access control** is enforced at the Nillion API level

## Future Enhancements

For production use, you might want to add:
- User registration/login system
- Password protection
- Session expiration and renewal
- User account management
- Multi-device sync (same user, different devices)

For now, the session-based approach provides:
- ✅ Quick implementation
- ✅ Automatic user isolation
- ✅ Privacy guarantees
- ✅ No user management overhead

