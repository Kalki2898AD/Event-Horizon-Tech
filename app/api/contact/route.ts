import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();
    
    // Add your contact form logic here
    // For example:
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