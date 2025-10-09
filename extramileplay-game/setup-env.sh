#!/bin/bash

echo "🔥 Firebase Environment Setup Script"
echo "===================================="
echo ""

# Check if env.template exists
if [ ! -f "env.template" ]; then
    echo "❌ Error: env.template file not found!"
    exit 1
fi

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Copy template to .env.local
cp env.template .env.local
echo "✅ Created .env.local from template"
echo ""
echo "📝 Next steps:"
echo "1. Go to: https://console.firebase.google.com/project/extramile-dfcca/settings/serviceaccounts"
echo "2. Click 'Generate new private key'"
echo "3. Download the JSON file"
echo "4. Edit .env.local and replace:"
echo "   - FIREBASE_ADMIN_CLIENT_EMAIL"
echo "   - FIREBASE_ADMIN_PRIVATE_KEY"
echo ""
echo "5. Run: npm run dev"
echo ""
echo "✨ Done! Edit .env.local to add your Firebase Admin credentials."
