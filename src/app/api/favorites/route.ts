/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getFavorites as kvGetFavorites, setFavorites as kvSetFavorites } from '@/lib/serverStorage';

// Get favorites
export async function GET() {
  try {
    const favorites = await kvGetFavorites();
    return NextResponse.json(favorites);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get favorites' },
      { status: 500 }
    );
  }
}

// Update favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { favorites } = body;
    
    if (!Array.isArray(favorites)) {
      return NextResponse.json(
        { error: 'Favorites must be an array' },
        { status: 400 }
      );
    }
    
    await kvSetFavorites(favorites);
    
    return NextResponse.json({ 
      message: 'Favorites updated successfully', 
      favorites 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update favorites' },
      { status: 500 }
    );
  }
}
