import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, timezone = 'UTC' } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check if subscriber already exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email }
    });

    if (existingSubscriber) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    // Store subscriber in database
    await prisma.subscriber.create({
      data: { 
        email, 
        timezone 
      }
    });

    // Send welcome email
    await resend.emails.send({
      from: 'news@eventhorizonlive.space',
      to: email,
      subject: 'Welcome to EHTech News!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to EHTech News!</h1>
          <p>Thank you for subscribing to our newsletter. You will receive daily updates at 8 AM in your timezone.</p>
          <p>Stay tuned for the latest tech news!</p>
        </div>
      `
    });

    return res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Failed to subscribe. Please try again later.' });
  }
} 