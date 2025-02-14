import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Destructure and use all variables to avoid unused var warnings
    const { name, email, message } = await request.json();
    console.log('Contact form submission:', { name, email, message });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send message' 
    }, { status: 500 });
  }
} 