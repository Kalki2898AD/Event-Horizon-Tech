import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, frequency } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('newsletter_subscribers')
      .select()
      .eq('email', email)
      .single();

    if (existingUser) {
      // Update frequency if user exists
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ frequency })
        .eq('email', email);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Subscription updated successfully' },
        { status: 200 }
      );
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email,
          frequency,
          subscribed_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Send welcome email
    try {
      const emailResult = await resend.emails.send({
        from: 'Event Horizon Tech <newsletter@eventhorizonlive.space>',
        to: email,
        replyTo: 'budgetbuddy567@gmail.com',
        subject: 'Welcome to Event Horizon Tech Newsletter! 🚀',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to Event Horizon Tech! 🎉</h1>
            <p>Thank you for subscribing to our ${frequency} newsletter.</p>
            <p>You'll receive the latest tech news and updates ${frequency}.</p>
            <p>If you have any questions or feedback, feel free to reply to this email.</p>
            <div style="margin-top: 30px; text-align: center;">
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
        `,
      });
      
      console.log('Welcome email sent:', emailResult);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Return success but indicate email failed
      return NextResponse.json(
        { 
          message: 'Subscribed successfully but welcome email failed to send. You will still receive newsletters.',
          emailError: true 
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: 'Subscribed successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
