/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'data');
const sharedLinksFile = path.join(dataDir, 'shared-links.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Get all shared links
export async function GET() {
  try {
    await ensureDataDir();
    
    try {
      const data = await fs.readFile(sharedLinksFile, 'utf-8');
      const sharedLinks = JSON.parse(data);
      return NextResponse.json(sharedLinks);
    } catch {
      // File doesn't exist, return empty object
      return NextResponse.json({});
    }
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
    await ensureDataDir();
    
    const body = await request.json();
    const { sharedLinks } = body;
    
    if (typeof sharedLinks !== 'object') {
      return NextResponse.json(
        { error: 'Shared links must be an object' },
        { status: 400 }
      );
    }
    
    await fs.writeFile(sharedLinksFile, JSON.stringify(sharedLinks, null, 2));
    
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
