/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'data');
const projectsFile = path.join(dataDir, 'projects.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Get all projects
export async function GET() {
  try {
    await ensureDataDir();
    
    try {
      const data = await fs.readFile(projectsFile, 'utf-8');
      const projects = JSON.parse(data);
      return NextResponse.json(projects);
    } catch {
      // File doesn't exist, return empty array
      return NextResponse.json([]);
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get projects' },
      { status: 500 }
    );
  }
}

// Create or update project
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const body = await request.json();
    const { projects } = body;
    
    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { error: 'Projects must be an array' },
        { status: 400 }
      );
    }
    
    await fs.writeFile(projectsFile, JSON.stringify(projects, null, 2));
    
    return NextResponse.json({ 
      message: 'Projects saved successfully', 
      count: projects.length 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save projects' },
      { status: 500 }
    );
  }
}
