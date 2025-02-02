import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);

async function getSubscribersByFrequency(frequency: string) {
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('frequency', frequency);

  if (error) {
    throw new Error(`Failed to fetch ${frequency} subscribers: ${error.message}`);
  }

  return subscribers || [];
}

async function fetchLatestNews() {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/news`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  const { articles } = await response.json();
  return articles;
}

async function sendNewsletterToSubscriber(email: string, frequency: string, articles: any[]) {
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

  const { data, error } = await resend.emails.send({
    from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
    to: [email],
    subject: `Your ${frequency} Tech News Digest`,
    reply_to: 'support@eventhorizonlive.space',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your ${frequency} Tech News Digest</title>
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
              <a href="{unsubscribe_url}" style="color: #4F46E5; text-decoration: none;">Unsubscribe</a>
            </p>
          </footer>
        </body>
      </html>
    `
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Verify cron secret
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('Starting newsletter distribution...');
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentDayOfMonth = currentDate.getDate();

    // Determine which frequencies to send based on current date
    const frequenciesToSend = ['daily'];
    
    // Send weekly newsletters on Monday
    if (currentDay === 1) {
      frequenciesToSend.push('weekly');
    }
    
    // Send monthly newsletters on the 1st of the month
    if (currentDayOfMonth === 1) {
      frequenciesToSend.push('monthly');
    }

    console.log('Fetching latest news...');
    const articles = await fetchLatestNews();

    if (!articles || articles.length === 0) {
      throw new Error('No articles available for newsletter');
    }

    const results = [];

    for (const frequency of frequenciesToSend) {
      console.log(`Processing ${frequency} newsletters...`);
      const subscribers = await getSubscribersByFrequency(frequency);
      console.log(`Found ${subscribers.length} ${frequency} subscribers`);

      for (const subscriber of subscribers) {
        try {
          console.log(`Sending ${frequency} newsletter to ${subscriber.email}...`);
          const result = await sendNewsletterToSubscriber(
            subscriber.email,
            frequency,
            articles.slice(0, 5)
          );
          results.push({
            email: subscriber.email,
            frequency,
            status: 'success',
            id: result.id
          });
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          results.push({
            email: subscriber.email,
            frequency,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    return new Response(JSON.stringify({
      message: 'Newsletter distribution completed',
      results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Newsletter distribution error:', error);
    return new Response('Failed to distribute newsletters', { status: 500 });
  }
}
