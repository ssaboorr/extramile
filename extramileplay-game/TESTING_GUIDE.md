# 🧪 Firebase Cloud Functions Testing Guide

## Method 1: Test Locally with Firebase Emulators (Recommended)

### Step 1: Start the Emulators

```bash
cd functions
npm run serve
```

This will start:
- **Functions Emulator**: http://localhost:5001
- **Firestore Emulator**: http://localhost:8080
- **Emulator UI**: http://localhost:4000

### Step 2: Test Functions with cURL

Once the emulators are running, open a new terminal and test:

#### Test `helloWorld` function:
```bash
curl http://localhost:5001/extramile-dfcca/us-central1/helloWorld
```

Expected response:
```json
{"message":"Hello from Firebase Cloud Functions!"}
```

#### Test `addMessage` function:
```bash
curl -X POST http://localhost:5001/extramile-dfcca/us-central1/addMessage \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from cURL!"}'
```

Expected response:
```json
{"message":"Message added successfully","id":"some-document-id"}
```

### Step 3: View in Emulator UI

Open http://localhost:4000 in your browser to see:
- Function logs
- Firestore data
- Real-time updates

---

## Method 2: Test from Next.js App

### Step 1: Set Up Environment

First, make sure you have `.env.local` configured. If not:

```bash
# Run the setup script
./setup-env.sh

# OR manually copy the template
cp env.template .env.local

# Then edit .env.local to add your Firebase Admin credentials
```

### Step 2: Configure Functions to Use Emulator (Development)

Update your `app/lib/firebase/config.ts` to use emulators in development:

```typescript
// Add this after initializing functions
if (process.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

### Step 3: Use the Example Component

Add the `FirebaseExample` component to your page:

```typescript
// In app/page.tsx
import FirebaseExample from '@/app/components/FirebaseExample';

export default function Home() {
  return (
    <main>
      <FirebaseExample />
    </main>
  );
}
```

### Step 4: Start Next.js Dev Server

```bash
npm run dev
```

Visit http://localhost:3000 and test the buttons in the Firebase Example component.

---

## Method 3: Test via Browser Console

Open your browser console on http://localhost:3000 and run:

```javascript
// Test helloWorld
fetch('http://localhost:5001/extramile-dfcca/us-central1/helloWorld')
  .then(r => r.json())
  .then(console.log);

// Test addMessage
fetch('http://localhost:5001/extramile-dfcca/us-central1/addMessage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello from browser!' })
})
  .then(r => r.json())
  .then(console.log);
```

---

## Method 4: Test Next.js API Route

Test the example API route that uses Firebase Admin:

```bash
# Make sure your Next.js dev server is running
npm run dev

# In another terminal:
curl http://localhost:3000/api/hello
```

Expected response:
```json
{
  "success": true,
  "message": "Document created successfully",
  "id": "some-document-id"
}
```

---

## Method 5: Deploy and Test in Production

### Step 1: Deploy Functions

```bash
# Make sure you're logged in
firebase login

# Deploy all functions
cd functions
npm run deploy

# OR deploy a specific function
firebase deploy --only functions:helloWorld
```

### Step 2: Test Deployed Functions

After deployment, you'll get URLs like:
```
https://us-central1-extramile-dfcca.cloudfunctions.net/helloWorld
```

Test them:

```bash
# Test helloWorld
curl https://us-central1-extramile-dfcca.cloudfunctions.net/helloWorld

# Test addMessage
curl -X POST https://us-central1-extramile-dfcca.cloudfunctions.net/addMessage \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from production!"}'
```

---

## 🔍 Monitoring & Debugging

### View Function Logs (Local)

When using emulators, logs appear in:
1. The terminal where you ran `npm run serve`
2. The Emulator UI at http://localhost:4000

### View Function Logs (Production)

```bash
# View all logs
firebase functions:log

# Follow logs in real-time
firebase functions:log --only helloWorld
```

Or view in Firebase Console:
https://console.firebase.google.com/project/extramile-dfcca/functions/logs

---

## 🧪 Test the Firestore Trigger

The `onMessageCreated` function triggers automatically when a message is added to Firestore.

### Test it:

1. Start emulators: `cd functions && npm run serve`
2. Add a message using the `addMessage` function
3. Check the emulator terminal - you should see the log:
   ```
   New message created: <your message text>
   ```

### View trigger execution:
- Emulator UI: http://localhost:4000
- Production: Firebase Console → Functions → Logs

---

## 📝 Testing Checklist

- [ ] Emulators start successfully
- [ ] `helloWorld` returns "Hello from Firebase Cloud Functions!"
- [ ] `addMessage` creates a document in Firestore
- [ ] `onMessageCreated` trigger logs the message
- [ ] Next.js API route works (`/api/hello`)
- [ ] FirebaseExample component works in the browser
- [ ] Functions deploy successfully (if testing production)

---

## 🐛 Troubleshooting

### Emulator won't start
```bash
# Kill any process using the ports
lsof -ti:5001 | xargs kill
lsof -ti:8080 | xargs kill

# Try again
cd functions && npm run serve
```

### Functions not found (404)
- Check the URL format: `http://localhost:5001/{project-id}/{region}/{function-name}`
- Verify project ID in `.firebaserc`
- Rebuild functions: `npm run build`

### CORS errors in browser
Add CORS headers to your functions:

```typescript
import { onRequest } from "firebase-functions/v2/https";

export const helloWorld = onRequest({
  cors: true  // Enable CORS
}, (request, response) => {
  response.json({ message: "Hello!" });
});
```

### Environment variables not working
- Restart Next.js dev server after changing `.env.local`
- Verify variable names start with `NEXT_PUBLIC_` for client-side
- Check `.env.local` exists and has correct values

---

## 🎯 Quick Test Script

Save this as `test-functions.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Firebase Cloud Functions"
echo "===================================="
echo ""

echo "1️⃣ Testing helloWorld..."
curl -s http://localhost:5001/extramile-dfcca/us-central1/helloWorld | jq
echo ""

echo "2️⃣ Testing addMessage..."
curl -s -X POST http://localhost:5001/extramile-dfcca/us-central1/addMessage \
  -H "Content-Type: application/json" \
  -d '{"text":"Test message from script"}' | jq
echo ""

echo "3️⃣ Testing Next.js API route..."
curl -s http://localhost:3000/api/hello | jq
echo ""

echo "✅ Testing complete!"
```

Make it executable:
```bash
chmod +x test-functions.sh
./test-functions.sh
```

---

## 📚 Additional Resources

- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Cloud Functions Testing](https://firebase.google.com/docs/functions/unit-testing)
- [Firebase Console](https://console.firebase.google.com/project/extramile-dfcca)

---

**Pro Tip**: Always test with emulators first before deploying to production. It's faster, free, and safer!

