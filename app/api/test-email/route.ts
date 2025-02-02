import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    // Verify secret
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Send test email
    const testEmail = url.searchParams.get('email');
    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
      to: [testEmail],
      subject: 'Test Email from Event Horizon Tech',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Test Email</h1>
          <p>This is a test email from Event Horizon Tech to verify that our email system is working correctly.</p>
          <div style="margin-top: 30px; text-align: center;">
            <p>If you received this email, it means our email system is working properly!</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send test email:', error);
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Test email sent successfully',
      id: data?.id,
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
