#!/bin/bash

echo "🧪 Testing Firebase Cloud Functions"
echo "===================================="
echo ""

# Check if emulator is running
if ! curl -s http://localhost:5001 > /dev/null 2>&1; then
    echo "❌ Error: Firebase emulators not running!"
    echo "Start them with: cd functions && npm run serve"
    exit 1
fi

echo "✅ Emulators are running"
echo ""

echo "1️⃣ Testing helloWorld function..."
echo "URL: http://localhost:5001/extramile-dfcca/us-central1/helloWorld"
response1=$(curl -s http://localhost:5001/extramile-dfcca/us-central1/helloWorld)
echo "Response: $response1"
echo ""

echo "2️⃣ Testing addMessage function..."
echo "URL: http://localhost:5001/extramile-dfcca/us-central1/addMessage"
response2=$(curl -s -X POST http://localhost:5001/extramile-dfcca/us-central1/addMessage \
  -H "Content-Type: application/json" \
  -d '{"text":"Test message from test script"}')
echo "Response: $response2"
echo ""

echo "3️⃣ Testing Next.js API route (if server is running)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "URL: http://localhost:3000/api/hello"
    response3=$(curl -s http://localhost:3000/api/hello)
    echo "Response: $response3"
else
    echo "⚠️  Next.js dev server not running on port 3000"
    echo "   Start it with: npm run dev"
fi
echo ""

echo "📊 Summary:"
echo "==========="
echo "✅ Function emulators: http://localhost:4000"
echo "✅ Functions endpoint: http://localhost:5001"
echo "✅ Firestore emulator: http://localhost:8080"
echo ""
echo "🎉 Testing complete! Check the responses above."

