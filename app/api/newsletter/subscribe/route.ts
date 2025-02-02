import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface SubscribeRequest {
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
}

async function sendWelcomeEmail(email: string, frequency: string) {
  try {
    console.log('Starting welcome email process...');
    
    // Fetch latest articles from NewsAPI
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=3&apiKey=${process.env.NEWS_API_KEY}`,
      { cache: 'no-store' }
    );
    
    const newsData = await response.json();
    const articles = (newsData.articles || []) as NewsArticle[];

    const articlesList = articles
      .map(
        (article) => `
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0;">${article.title}</h3>
            <p style="margin: 5px 0;">${article.description || ''}</p>
            <a href="${article.url}" style="color: #0070f3; text-decoration: none;">Read More</a>
          </div>
        `
      )
      .join('');

    console.log('Sending welcome email to:', email);
    
    const { data, error: emailError } = await resend.emails.send({
      from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
      to: [email],
      subject: 'Welcome to Event Horizon Tech! 🚀',
      replyTo: 'support@eventhorizonlive.space',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Welcome to Event Horizon Tech! 🚀</h1>
          
          <p>Thank you for subscribing to our ${frequency} newsletter! We're excited to have you on board.</p>
          
          <p>You'll receive the latest tech news and updates ${frequency}. Here's what you can expect:</p>
          
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin: 10px 0;">✨ Breaking tech news</li>
            <li style="margin: 10px 0;">🔍 In-depth analysis</li>
            <li style="margin: 10px 0;">💡 Industry insights</li>
            <li style="margin: 10px 0;">🚀 Innovation updates</li>
          </ul>

          ${articles.length > 0 ? `
            <div style="margin-top: 30px;">
              <h2 style="color: #333;">Latest Articles</h2>
              ${articlesList}
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; text-align: center;">
            <p>Stay tuned for your first newsletter!</p>
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

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 0.9em;">
            <p>Follow us on social media for more updates!</p>
          </div>
        </div>
      `
    });

    if (emailError) {
      console.error('Welcome email error:', emailError);
      throw emailError;
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    console.log('Processing newsletter subscription...');
    const body: SubscribeRequest = await request.json();
    const { email, frequency } = body;

    if (!email || !frequency) {
      return NextResponse.json(
        { error: 'Email and frequency are required' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscriber:', checkError);
      return NextResponse.json(
        { error: 'Failed to process subscription' },
        { status: 500 }
      );
    }

    if (existingSubscriber) {
      // Update frequency if different
      if (existingSubscriber.frequency !== frequency) {
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ frequency })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating frequency:', updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription frequency' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        message: 'Subscription frequency updated successfully',
        subscriber: existingSubscriber,
      });
    }

    // Add new subscriber
    const { data: newSubscriber, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email,
          frequency,
          subscribed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting new subscriber:', insertError);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Send welcome email immediately after successful subscription
    try {
      await sendWelcomeEmail(email, frequency);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with success response even if email fails
      // The subscription was successful, we just couldn't send the welcome email
    }

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      subscriber: newSubscriber,
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to subscribe to newsletter. Please try again later.' },
      { status: 500 }
    );
  }
}
