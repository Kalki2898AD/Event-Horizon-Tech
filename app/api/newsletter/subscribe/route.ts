import { NextResponse } from 'next/server';
import { createClient, PostgrestError } from '@supabase/supabase-js';
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

interface Article {
  title: string;
  description: string;
  url: string;
}

async function sendWelcomeEmail(email: string, frequency: string) {
  try {
    console.log('Starting welcome email process...');
    
    const { data: articles } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3) as { data: Article[] | null };

    const articlesList = articles
      ? articles
          .map(
            (article) => `
              <div style="margin-bottom: 20px;">
                <h3 style="margin: 0;">${article.title}</h3>
                <p style="margin: 5px 0;">${article.description}</p>
                <a href="${article.url}" style="color: #0070f3; text-decoration: none;">Read More</a>
              </div>
            `
          )
          .join('')
      : '';

    console.log('Sending to:', email);
    console.log('Frequency:', frequency);
    
    const { data, error: emailError } = await resend.emails.send({
      from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
      to: [email],
      subject: 'Welcome to Event Horizon Tech News! 🚀',
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

          ${articles && articles.length > 0 ? `
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
      console.error('Resend API error:', emailError);
      throw emailError;
    }

    console.log('Welcome email sent successfully. Response:', data);
    return data;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
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
    if (error instanceof PostgrestError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to subscribe to newsletter. Please try again later.' },
      { status: 500 }
    );
  }
}
