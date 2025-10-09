# Firebase Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. Firebase CLI installed globally: `npm install -g firebase-tools`
3. A Firebase project (already set up: `extramile-dfcca`)

## Environment Variables Setup

### 1. Create `.env.local` file in the project root

The `.env.local` file has been created with your Firebase configuration. You need to add your Firebase Admin SDK credentials:

#### Option A: Using Service Account Key (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `extramile-dfcca`
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file and save it as `serviceAccountKey.json` in the project root
6. Add to `.env.local`:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
   ```

#### Option B: Using Individual Environment Variables

Extract values from your service account JSON and add to `.env.local`:
```
FIREBASE_ADMIN_PROJECT_ID=extramile-dfcca
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@extramile-dfcca.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
```

## Firebase Cloud Functions Setup

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Functions Dependencies

```bash
cd functions
npm install
```

### 4. Build Functions

```bash
npm run build
```

## Available Cloud Functions

The following example functions are included:

1. **helloWorld** - Simple HTTP endpoint
2. **addMessage** - Adds a message to Firestore
3. **onMessageCreated** - Firestore trigger when a message is created

## Development Workflow

### Run Functions Locally (Emulator)

```bash
cd functions
npm run serve
```

This will start:
- Functions Emulator on http://localhost:5001
- Firestore Emulator on http://localhost:8080
- Firebase Emulator UI on http://localhost:4000

### Deploy Functions to Firebase

```bash
cd functions
npm run deploy
```

Or deploy a specific function:

```bash
firebase deploy --only functions:helloWorld
```

## Using Cloud Functions in Your App

### Client-side (React/Next.js)

```typescript
import { callCloudFunction } from '@/app/lib/firebase/functions-helpers';

// Call a cloud function
const result = await callCloudFunction('helloWorld');
console.log(result);

// Call with data
const message = await callCloudFunction('addMessage', { text: 'Hello!' });
```

### Server-side (API Routes)

```typescript
import { adminAuth, adminDb } from '@/app/lib/firebase/admin';

// Use Firebase Admin SDK
const user = await adminAuth.getUser(uid);
const doc = await adminDb.collection('users').doc(userId).get();
```

## Project Structure

```
extramileplay-game/
├── app/
│   └── lib/
│       └── firebase/
│           ├── config.ts          # Client-side Firebase config
│           ├── admin.ts           # Server-side Firebase Admin config
│           └── functions-helpers.ts # Helper functions for calling Cloud Functions
├── functions/
│   ├── src/
│   │   └── index.ts              # Cloud Functions definitions
│   ├── package.json
│   └── tsconfig.json
├── .env.local                     # Environment variables (not committed)
├── .env.example                   # Example environment variables
├── firebase.json                  # Firebase configuration
└── .firebaserc                    # Firebase project settings
```

## Important Notes

1. **Environment Variables**: Never commit `.env.local` or `serviceAccountKey.json` to version control
2. **Firebase Plan**: Some features like scheduled functions require the Blaze (pay-as-you-go) plan
3. **CORS**: If calling functions from a web app, ensure CORS is properly configured
4. **Security**: Always validate and sanitize input in your Cloud Functions

## Next Steps

1. ✅ Environment variables configured
2. ✅ Firebase client SDK initialized
3. ✅ Firebase Admin SDK configured
4. ✅ Cloud Functions initialized
5. 🔄 Install functions dependencies: `cd functions && npm install`
6. 🔄 Build functions: `npm run build`
7. 🔄 Test locally with emulators: `npm run serve`
8. 🔄 Deploy to Firebase: `npm run deploy`

## Troubleshooting

### Functions won't deploy
- Ensure you're logged in: `firebase login`
- Check project ID: `firebase use extramile-dfcca`
- Build functions first: `cd functions && npm run build`

### Can't call functions from app
- Check CORS settings in cloud functions
- Verify Firebase is initialized correctly
- Check browser console for errors

### Environment variables not working
- Restart Next.js dev server after changing `.env.local`
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Server-side variables don't need the prefix

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Next.js with Firebase](https://firebase.google.com/docs/web/setup)

