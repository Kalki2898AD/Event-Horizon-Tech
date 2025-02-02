import { NextResponse } from 'next/server';
import { sendNewsletterEmail } from '@/app/lib/emailService';

export async function GET(request: Request) {
  try {
    // Get test articles
    const newsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/news`);
    if (!newsResponse.ok) {
      throw new Error('Failed to fetch news');
    }
    const { articles } = await newsResponse.json();

    // Send test email
    const testEmail = request.nextUrl.searchParams.get('email');
    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    await sendNewsletterEmail(testEmail, {
      frequency: 'daily',
      articles: articles.slice(0, 5), // Send top 5 articles
    });

    return NextResponse.json({
      message: `Test email sent successfully to ${testEmail}`,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
