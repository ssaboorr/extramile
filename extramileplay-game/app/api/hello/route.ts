import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebase/admin';

/**
 * Example API Route using Firebase Admin SDK
 * GET /api/hello
 */
export async function GET(request: NextRequest) {
  try {
    // Example: Add a document to Firestore
    const docRef = await adminDb.collection('test').add({
      message: 'Hello from Next.js API Route!',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Document created successfully',
      id: docRef.id,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Example POST endpoint
 * POST /api/hello
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Add message to Firestore
    const docRef = await adminDb.collection('messages').add({
      text: message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Message added successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

