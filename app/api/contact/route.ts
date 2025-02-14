import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Add your email sending logic here
    // For example, using Resend:
    // await resend.emails.send({
    //   from: 'contact@yourdomain.com',
    //   to: 'support@yourdomain.com',
    //   subject: `Contact Form: ${name}`,
    //   text: `From: ${name} (${email})\n\n${message}`,
    // });

    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 