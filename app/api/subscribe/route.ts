import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, frequency } = await request.json();
    
    if (!email || !frequency) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and frequency are required' 
      }, { status: 400 });
    }

    // First try to update - if the user exists, this will work
    const { data: updateData, error: updateError } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email,
          frequency,
          timezone: 'Asia/Kolkata',
          status: 'active',
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (updateError) {
      console.error('Subscription error:', updateError);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to process subscription',
        details: updateError.message
      }, { status: 500 });
    }

    const isUpdate = updateData?.created_at !== updateData?.updated_at;
    
    return NextResponse.json({
      success: true,
      message: isUpdate 
        ? `Successfully updated to ${frequency} newsletter`
        : `Successfully subscribed to ${frequency} newsletter`,
      data: updateData
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 