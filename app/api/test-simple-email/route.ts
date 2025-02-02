import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    console.log('Testing Resend API key:', process.env.RESEND_API_KEY?.slice(0, 10) + '...');
    
    const testEmail = request.nextUrl.searchParams.get('email');
    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to send test email to:', testEmail);

    const { data, error } = await resend.emails.send({
      from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
      to: [testEmail],
      subject: 'Test Email from Event Horizon Tech',
      reply_to: 'support@eventhorizonlive.space',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email from Event Horizon Tech.</p>
          <p>If you're seeing this, the email system is working!</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return NextResponse.json({
      message: `Test email sent successfully to ${testEmail}`,
      data
    });
  } catch (error) {
    console.error('Test email error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to send test email', details: error },
      { status: 500 }
    );
  }
}
