'use client';

import { useState } from 'react';
import { callCloudFunction } from '@/app/lib/firebase/functions-helpers';

/**
 * Example component demonstrating Firebase Cloud Functions usage
 */
export default function FirebaseExample() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAddMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const result = await callCloudFunction('addMessage', { text: message });
      setResponse(result);
      setMessage('');
      alert('Message added successfully!');
    } catch (error) {
      console.error('Error calling cloud function:', error);
      alert('Error calling cloud function. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const testHelloWorld = async () => {
    setLoading(true);
    try {
      const result = await callCloudFunction('helloWorld');
      setResponse(result);
      alert('Cloud function called successfully!');
    } catch (error) {
      console.error('Error calling cloud function:', error);
      alert('Error calling cloud function. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Firebase Cloud Functions Test</h2>
      
      <div className="space-y-4">
        {/* Test Hello World Function */}
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Test Hello World Function</h3>
          <button
            onClick={testHelloWorld}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Call helloWorld'}
          </button>
        </div>

        {/* Add Message Function */}
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Add Message to Firestore</h3>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a message"
            className="border px-3 py-2 rounded w-full mb-2"
          />
          <button
            onClick={handleAddMessage}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Add Message'}
          </button>
        </div>

        {/* Response Display */}
        {response && (
          <div className="border p-4 rounded bg-gray-50">
            <h3 className="font-semibold mb-2">Response:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Make sure you've deployed your Cloud Functions first using:
          <code className="block mt-2 bg-yellow-100 p-2 rounded">
            cd functions && npm run deploy
          </code>
          Or test locally with the emulator:
          <code className="block mt-2 bg-yellow-100 p-2 rounded">
            cd functions && npm run serve
          </code>
        </p>
      </div>
    </div>
  );
}

