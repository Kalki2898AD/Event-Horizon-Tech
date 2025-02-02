import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(email: string, frequency: string) {
  try {
    console.log('Starting welcome email process...');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
    // First try to get the base URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log('Using base URL:', baseUrl);
    
    console.log('Fetching news for welcome email...');
    const newsResponse = await fetch(`${baseUrl}/api/news`);
    console.log('News API response status:', newsResponse.status);
    
    if (!newsResponse.ok) {
      throw new Error(`Failed to fetch news: ${newsResponse.statusText}`);
    }
    
    const newsData = await newsResponse.json();
    console.log('Received news data:', JSON.stringify(newsData, null, 2));
    
    const { articles } = newsData;
    
    if (!articles || articles.length === 0) {
      throw new Error('No articles available for welcome email');
    }
    
    console.log(`Found ${articles.length} articles, using first 3 for preview`);
    
    const articlesList = articles
      .slice(0, 3)
      .map(
        (article: any) => `
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

    console.log('Preparing to send email via Resend...');
    console.log('Sending to:', email);
    console.log('Frequency:', frequency);
    
    const { data, error } = await resend.emails.send({
      from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
      to: [email],
      subject: 'Welcome to Event Horizon Tech News! 🚀',
      reply_to: 'support@eventhorizonlive.space',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Event Horizon Tech News</title>
          </head>
          <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px;">
            <header style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Welcome to Event Horizon Tech! 🎉</h1>
            </header>

            <main>
              <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <p style="color: #111827; font-size: 16px;">
                  Thank you for subscribing to our ${frequency} tech news updates! We're excited to keep you informed about the latest in technology.
                </p>

                <h2 style="margin: 24px 0 16px; color: #111827;">Here's a preview of what you can expect:</h2>
                ${articlesList}

                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
                  <h3 style="color: #111827; margin: 0 0 12px;">What's Next?</h3>
                  <ul style="color: #4B5563; margin: 0; padding-left: 20px;">
                    <li>Watch for your first ${frequency} digest</li>
                    <li>Add newsletter@eventhorizonlive.space to your contacts</li>
                    <li>Share feedback by replying to any email</li>
                  </ul>
                </div>
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
      console.error('Resend API error:', error);
      throw error;
    }

    console.log('Welcome email sent successfully. Response:', data);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    console.error('Full welcome email error:', JSON.stringify(error, null, 2));
    // Re-throw the error so we know if the welcome email failed
    throw error;
  }
}

interface SubscribeRequest {
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export async function POST(request: Request): Promise<Response> {
  try {
    console.log('Processing newsletter subscription...');
    const body = (await request.json()) as SubscribeRequest;
    console.log('Received subscription request:', body);

    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!body.frequency || !['daily', 'weekly', 'monthly'].includes(body.frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency' },
        { status: 400 }
      );
    }

    console.log('Checking for existing subscriber...');
    const { data: existingSubscriber, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select()
      .eq('email', body.email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing subscriber:', fetchError);
      throw new Error(`Failed to check subscription status: ${fetchError.message}`);
    }

    if (existingSubscriber) {
      console.log('Updating existing subscriber...');
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          frequency: body.frequency,
          updated_at: new Date().toISOString()
        })
        .eq('email', body.email);

      if (updateError) {
        console.error('Error updating subscriber:', updateError);
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }

      console.log('Subscription updated successfully');
      return NextResponse.json({
        message: 'Subscription updated successfully'
      });
    }

    console.log('Adding new subscriber...');
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: body.email,
          frequency: body.frequency,
          subscribed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.error('Error inserting subscriber:', insertError);
      throw new Error(`Failed to create subscription: ${insertError.message}`);
    }

    console.log('New subscriber added successfully');

    // Send welcome email for new subscribers
    try {
      await sendWelcomeEmail(body.email, body.frequency);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if only the welcome email fails
    }

    return NextResponse.json({
      message: 'Subscribed successfully'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    console.error('Full subscription error:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to subscribe to newsletter. Please try again later.' },
      { status: 500 }
    );
  }
}
