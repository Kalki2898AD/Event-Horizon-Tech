'use client';

import { Resend } from 'resend';
import { createHash } from 'crypto';

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
}

interface EmailTemplate {
  articles: Article[];
  frequency: 'daily' | 'weekly';
}

function generateUnsubscribeUrl(email: string): string {
  const token = createHash('sha256').update(email).digest('hex');
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

export async function sendNewsletterEmail(to: string, template: EmailTemplate) {
  console.log('Starting to send email to:', to);

  try {
    const { articles, frequency } = template;

    if (!articles || articles.length === 0) {
      console.error('No articles provided for email template');
      return { error: 'No articles provided' };
    }

    console.log('Preparing email template with', articles.length, 'articles');

    const unsubscribeUrl = generateUnsubscribeUrl(to);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Event Horizon Tech Newsletter</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Event Horizon Tech</h1>
              <p style="color: #e0e7ff; margin: 8px 0 0;">Your ${frequency} Tech News Update</p>
            </div>
            
            <div style="padding: 24px;">
              ${articles.map(article => `
                <div style="margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px;">
                  ${article.urlToImage ? `
                    <img src="${article.urlToImage}" alt="${article.title}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 16px;">
                  ` : ''}
                  <h2 style="margin: 0 0 8px; font-size: 20px; color: #1f2937;">
                    <a href="${article.url}" style="color: #4f46e5; text-decoration: none;">${article.title}</a>
                  </h2>
                  <p style="margin: 0; color: #4b5563;">${article.description}</p>
                </div>
              `).join('')}
              
              <div style="text-align: center; margin-top: 24px;">
                <a href="https://eventhorizonlive.space" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Visit Our Website
                </a>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; font-size: 14px; color: #6b7280;">
              <p style="margin: 0 0 8px;">
                You're receiving this email because you subscribed to ${frequency} updates from Event Horizon Tech.
              </p>
              <p style="margin: 0;">
                <a href="${unsubscribeUrl}" style="color: #4f46e5; text-decoration: none;">Unsubscribe</a> |
                <a href="mailto:budgetbuddy567@gmail.com" style="color: #4f46e5; text-decoration: none;">Contact Us</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Attempting to send email via Resend...');

    const { data, error } = await resend.emails.send({
      from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
      to: [to],
      subject: `Your ${frequency} Tech News Update from Event Horizon Tech`,
      html,
      reply_to: 'budgetbuddy567@gmail.com'
    });

    if (error) {
      throw error;
    }

    console.log('Email sent successfully:', data);
    return { data };
  } catch (error) {
    console.error('Email service error:', error);
    return { error };
  }
}
