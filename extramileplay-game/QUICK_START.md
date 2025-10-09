# Quick Start Guide

## 🚀 Getting Started with Firebase

### 1. Environment Setup

A `.env.local` file needs to be created in the project root with your Firebase credentials. The template is already prepared with your public Firebase config.

**Important:** You need to add Firebase Admin SDK credentials to `.env.local`:

```bash
# Get your service account key from Firebase Console
# https://console.firebase.google.com/project/extramile-dfcca/settings/serviceaccounts
```

Then add these variables to `.env.local`:
```
FIREBASE_ADMIN_PROJECT_ID=extramile-dfcca
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@extramile-dfcca.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----
```

### 2. Install Dependencies

```bash
# Main app dependencies (if not already installed)
npm install

# Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Test Cloud Functions Locally

```bash
# Start Firebase emulators
cd functions
npm run serve
```

This will start:
- 🔥 Functions Emulator: http://localhost:5001
- 📦 Firestore Emulator: http://localhost:8080
- 🎮 Firebase UI: http://localhost:4000

### 4. Deploy Cloud Functions (Optional)

```bash
# Make sure you're logged in to Firebase
firebase login

# Deploy all functions
cd functions
npm run deploy
```

### 5. Run Next.js Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📁 What's Been Set Up

### Client-Side Firebase (`app/lib/firebase/config.ts`)
- ✅ Firebase App initialized
- ✅ Authentication ready
- ✅ Firestore database ready
- ✅ Cloud Functions client ready
- ✅ Analytics configured

### Server-Side Firebase (`app/lib/firebase/admin.ts`)
- ✅ Firebase Admin SDK configured
- ✅ Admin Auth ready
- ✅ Admin Firestore ready

### Cloud Functions (`functions/src/index.ts`)
- ✅ `helloWorld` - Example HTTP function
- ✅ `addMessage` - Add message to Firestore
- ✅ `onMessageCreated` - Firestore trigger example

### Helper Files
- ✅ `app/lib/firebase/functions-helpers.ts` - Client-side function calling helpers
- ✅ `app/api/hello/route.ts` - Example Next.js API route with Firebase Admin
- ✅ `app/components/FirebaseExample.tsx` - Example React component

## 🧪 Testing

### Test API Route
```bash
curl http://localhost:3000/api/hello
```

### Test Cloud Function (when emulator is running)
```bash
curl http://localhost:5001/extramile-dfcca/us-central1/helloWorld
```

## 📚 Learn More

- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed documentation
- [Firebase Console](https://console.firebase.google.com/project/extramile-dfcca)
- [Firebase Documentation](https://firebase.google.com/docs)

## ⚠️ Important Notes

1. **Never commit** `.env.local` or service account keys to Git
2. The `.gitignore` is already configured to exclude sensitive files
3. For production, use Firebase environment config or your hosting provider's environment variables
4. Some Firebase features require the Blaze (pay-as-you-go) plan

## 🐛 Troubleshooting

**Functions not working?**
- Make sure environment variables are set in `.env.local`
- Restart the Next.js dev server after changing env vars
- Check that functions are deployed or emulator is running

**Can't deploy functions?**
```bash
firebase login
firebase use extramile-dfcca
cd functions && npm run build && firebase deploy --only functions
```

**Environment variables not loading?**
- Client-side vars must start with `NEXT_PUBLIC_`
- Server-side vars don't need the prefix
- Restart dev server after changes

## ✅ Next Steps

1. Add your Firebase Admin credentials to `.env.local`
2. Test the setup by running the emulators
3. Deploy functions to Firebase when ready
4. Start building your features!

