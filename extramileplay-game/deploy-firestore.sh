#!/bin/bash

# Deploy Firestore rules and indexes
echo "Deploying Firestore rules and indexes..."

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

echo "Firestore deployment completed!"
echo ""
echo "You can now test Google sign-in. If you still get permission errors:"
echo "1. Make sure you're using the Firebase emulator suite for development"
echo "2. Check that your Firebase project has the correct authentication providers enabled"
echo "3. Verify that Firestore is enabled in your Firebase console"
echo ""
echo "To start the emulator suite:"
echo "firebase emulators:start"
