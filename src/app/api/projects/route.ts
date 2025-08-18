/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getProjects as kvGetProjects, setProjects as kvSetProjects } from '@/lib/serverStorage';

// Get all projects
export async function GET() {
  try {
    const projects = await kvGetProjects();
    return NextResponse.json(projects);
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
    const body = await request.json();
    const { projects } = body;
    
    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { error: 'Projects must be an array' },
        { status: 400 }
      );
    }
    
    await kvSetProjects(projects);
    
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
