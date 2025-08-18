/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'data');
const favoritesFile = path.join(dataDir, 'favorites.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Get favorites
export async function GET() {
  try {
    await ensureDataDir();
    
    try {
      const data = await fs.readFile(favoritesFile, 'utf-8');
      const favorites = JSON.parse(data);
      return NextResponse.json(favorites);
    } catch {
      // File doesn't exist, return empty array
      return NextResponse.json([]);
    }
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
    await ensureDataDir();
    
    const body = await request.json();
    const { favorites } = body;
    
    if (!Array.isArray(favorites)) {
      return NextResponse.json(
        { error: 'Favorites must be an array' },
        { status: 400 }
      );
    }
    
    await fs.writeFile(favoritesFile, JSON.stringify(favorites, null, 2));
    
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
