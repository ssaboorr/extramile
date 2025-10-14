# Firestore Permission Error Troubleshooting Guide

## 🚨 Error: "Missing or insufficient permissions"

This error occurs when your Firestore security rules are blocking read/write operations. Here's how to fix it:

## 🔧 Quick Fix Steps

### 1. **Deploy Firestore Rules**

Run the deployment script:
```bash
cd /Users/sabooransari/Saboor/extramile/extramileplay-game
./deploy-firestore.sh
```

Or manually deploy:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 2. **Check Your Firebase Project Configuration**

Make sure you have:
- ✅ Firestore enabled in Firebase Console
- ✅ Authentication enabled with Google provider
- ✅ Correct project ID in your config

### 3. **Use Firebase Emulator for Development**

For local development, use the emulator suite:
```bash
firebase emulators:start
```

This will start:
- Firestore emulator on port 8080
- Auth emulator on port 9099
- UI on port 4000

## 🔍 Detailed Troubleshooting

### **Check 1: Firebase Project Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to "Authentication" → "Sign-in method"
4. Enable "Google" provider
5. Navigate to "Firestore Database"
6. Make sure it's enabled

### **Check 2: Environment Variables**

Verify your `.env.local` file has the correct Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### **Check 3: Security Rules**

The security rules should allow authenticated users to:
- Create/read/update their own player data
- Read room data
- Create/join rooms
- Create game records

If you're still getting permission errors, temporarily use these permissive rules for testing:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow all authenticated users to read/write
    // ⚠️ REMOVE THIS IN PRODUCTION
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING:** Never use these rules in production!

### **Check 4: Authentication State**

Make sure the user is properly authenticated before trying to write to Firestore:

```typescript
import { auth } from '@/lib/firebase/config';

// Check if user is authenticated
if (!auth.currentUser) {
  console.error('User not authenticated');
  return;
}

console.log('User ID:', auth.currentUser.uid);
```

## 🧪 Testing Your Setup

### **Test 1: Basic Connection**

Add this to your app temporarily to test the connection:

```typescript
import { testFirestoreConnection } from '@/lib/firebase/test-connection';

// Call this function after user signs in
const testConnection = async () => {
  try {
    await testFirestoreConnection();
    console.log('✅ Firestore connection successful');
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
  }
};
```

### **Test 2: Player Creation**

```typescript
import { testPlayerCreation } from '@/lib/firebase/test-connection';

// Test player creation after authentication
const testPlayer = async () => {
  try {
    await testPlayerCreation(auth.currentUser?.uid || '');
    console.log('✅ Player creation successful');
  } catch (error) {
    console.error('❌ Player creation failed:', error);
  }
};
```

## 🚀 Development Workflow

### **Option 1: Use Emulators (Recommended)**

1. Start emulators:
```bash
firebase emulators:start
```

2. Update your Firebase config to use emulators:
```typescript
// In your config file, add this for development
if (process.env.NODE_ENV === 'development') {
  import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
    connectFirestoreEmulator(db, 'localhost', 8080);
  });
}
```

### **Option 2: Use Production with Permissive Rules**

1. Temporarily use permissive rules (see above)
2. Test your authentication flow
3. Switch back to proper security rules
4. Deploy with: `firebase deploy --only firestore:rules`

## 🔐 Production Security Rules

Once everything works, use these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Players can read/write their own data
    match /players/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rooms are readable by authenticated users
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      
      match /players/{playerId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == playerId;
      }
    }
    
    // Games are readable by authenticated users
    match /games/{gameId} {
      allow read, write: if request.auth != null;
    }
    
    // Achievements are read-only
    match /achievements/{achievementId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

## 📞 Still Having Issues?

1. **Check Firebase Console Logs**: Look for error details in the Firebase Console
2. **Browser Console**: Check for detailed error messages
3. **Network Tab**: Look for failed requests to Firestore
4. **Firebase CLI**: Run `firebase projects:list` to verify your project

## 🎯 Common Solutions

| Error | Solution |
|-------|----------|
| `permission-denied` | Deploy security rules |
| `unauthenticated` | Check authentication flow |
| `not-found` | Verify collection names |
| `invalid-argument` | Check data types and required fields |
| `unavailable` | Check internet connection and Firebase status |

## ✅ Success Checklist

- [ ] Firebase project is properly configured
- [ ] Firestore is enabled
- [ ] Authentication providers are enabled
- [ ] Security rules are deployed
- [ ] Environment variables are correct
- [ ] User is authenticated before Firestore operations
- [ ] Error handling is implemented

Once all these are checked, your Google sign-in should work without permission errors!
