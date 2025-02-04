'use client';

import { Resend } from 'resend';
import { createHash } from 'crypto';

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailTemplate {
  frequency: 'daily' | 'weekly' | 'monthly';
  articles: Array<{
    title: string;
    url: string;
    description: string;
  }>;
}

function generateUnsubscribeUrl(email: string): string {
  const token = createHash('sha256').update(email).digest('hex');
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

export async function sendNewsletterEmail(to: string, template: EmailTemplate) {
  console.log('Starting to send email to:', to);
  try {
    const { frequency, articles } = template;
    
    if (!articles || articles.length === 0) {
      console.error('No articles provided for email template');
      throw new Error('No articles available');
    }

    console.log('Preparing email template with', articles.length, 'articles');
    
    const articlesList = articles
      .map(
        (article) => `
        <div style="margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">
            <a href="${article.url}" style="color: #4F46E5; text-decoration: none;">
              ${article.title}
            </a>
          </h2>
          <p style="margin: 8px 0 0; color: #4B5563;">
            ${article.description || 'No description available'}
          </p>
        </div>
      `
      )
      .join('');

    const unsubscribeUrl = generateUnsubscribeUrl(to);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your ${frequency} Tech News Update</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Event Horizon Tech</h1>
            <p style="color: #6B7280; margin: 10px 0 0;">Your ${frequency} tech news digest</p>
          </header>

          <main>
            <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
              <h2 style="margin: 0 0 20px; color: #111827;">Latest Tech News</h2>
              ${articlesList}
            </div>
          </main>

          <footer style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; margin: 0;">
              You're receiving this email because you subscribed to ${frequency} updates from Event Horizon Tech.
            </p>
            <p style="color: #6B7280; margin: 10px 0 0;">
              <a href="${unsubscribeUrl}" style="color: #4F46E5; text-decoration: none;">Unsubscribe</a>
            </p>
          </footer>
        </body>
      </html>
    `;

    console.log('Attempting to send email via Resend...');
    
    const { data, error } = await resend.emails.send({
      from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
      to: [to],
      subject: `Your ${frequency} Tech News Update`,
      html: html,
      replyTo: 'budgetbuddy567@gmail.com'
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Email service error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}
