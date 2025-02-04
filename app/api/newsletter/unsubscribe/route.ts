import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createHash } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      );
    }

    // Verify token
    const hashedEmail = createHash('sha256').update(email).digest('hex');
    if (token !== hashedEmail) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe link' },
        { status: 400 }
      );
    }

    // Remove from subscribers list
    const subscriberKey = `subscriber:${email}`;
    await kv.del(subscriberKey);

    // Return success page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Unsubscribed - Event Horizon Tech</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
          <div class="max-w-md w-full mx-4 bg-white rounded-lg shadow-md p-8 text-center">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">Successfully Unsubscribed</h1>
            <p class="text-gray-600 mb-6">
              You have been unsubscribed from the Event Horizon Tech newsletter.
              We're sorry to see you go!
            </p>
            <a
              href="/"
              class="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to Homepage
            </a>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
