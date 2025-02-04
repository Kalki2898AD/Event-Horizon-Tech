import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
      to: ['budgetbuddy567@gmail.com'],
      subject: 'Welcome to Event Horizon Tech! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Welcome to Event Horizon Tech! 🚀</h1>
          
          <p>Thank you for subscribing to our daily newsletter! We're excited to have you on board.</p>
          
          <p>You'll receive the latest tech news and updates daily at 8 AM. Here's what you can expect:</p>
          
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin: 10px 0;">✨ Breaking tech news</li>
            <li style="margin: 10px 0;">🔍 In-depth analysis</li>
            <li style="margin: 10px 0;">💡 Industry insights</li>
            <li style="margin: 10px 0;">🚀 Innovation updates</li>
          </ul>
          
          <div style="margin-top: 30px; text-align: center;">
            <p>Your first newsletter will arrive tomorrow at 8 AM!</p>
            <a href="https://eventhorizonlive.space" 
               style="display: inline-block; 
                      padding: 12px 24px; 
                      background-color: #0070f3; 
                      color: white; 
                      text-decoration: none; 
                      border-radius: 5px;
                      font-weight: bold;">
              Visit Our Website
            </a>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Email error:', error);
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
