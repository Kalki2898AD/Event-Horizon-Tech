import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user is already subscribed
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .is('unsubscribed_at', null)
      .single();

    if (existingSubscriber) {
      return NextResponse.json(
        { message: 'You are already subscribed to our newsletter' },
        { status: 200 }
      );
    }

    // Generate unsubscribe token
    const unsubscribeToken = createHash('sha256').update(email).digest('hex');

    // Save to Supabase
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email,
          frequency: 'daily',
          subscribed_at: new Date().toISOString(),
        }
      ]);

    if (insertError) {
      console.error('Error saving subscriber:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      unsubscribeToken
    });

  } catch (error) {
    console.error('Error in subscribe route:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
