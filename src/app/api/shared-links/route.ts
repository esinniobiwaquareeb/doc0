/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getSharedLinks as kvGetSharedLinks, setSharedLinks as kvSetSharedLinks } from '@/lib/serverStorage';

// Get all shared links
export async function GET() {
  try {
    const sharedLinks = await kvGetSharedLinks();
    return NextResponse.json(sharedLinks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get shared links' },
      { status: 500 }
    );
  }
}

// Create or update shared links
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sharedLinks } = body;
    
    if (typeof sharedLinks !== 'object') {
      return NextResponse.json(
        { error: 'Shared links must be an object' },
        { status: 400 }
      );
    }
    
    await kvSetSharedLinks(sharedLinks);
    
    return NextResponse.json({ 
      message: 'Shared links saved successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save shared links' },
      { status: 500 }
    );
  }
}
