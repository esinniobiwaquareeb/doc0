/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getProjects as kvGetProjects, setProjects as kvSetProjects } from '@/lib/serverStorage';

// Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projects = await kvGetProjects();
    const project = projects.find((p: { id: string }) => p.id === id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get project' },
      { status: 500 }
    );
  }
}

// Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await request.json();
    
    if (!project.id || !project.name) {
      return NextResponse.json(
        { error: 'Project ID and name are required' },
        { status: 400 }
      );
    }
    
    // Read existing projects
    const projects: any[] = await kvGetProjects();
    
    // Update or add project
    const existingIndex = projects.findIndex((p: { id: string }) => p.id === id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    // Save updated projects
    await kvSetProjects(projects);
    
    return NextResponse.json({ 
      message: 'Project saved successfully', 
      project 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save project' },
      { status: 500 }
    );
  }
}

// Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Read existing projects
    const projects: any[] = await kvGetProjects();
    
    // Remove project
    const filteredProjects = projects.filter((p: { id: string }) => p.id !== id);
    
    if (filteredProjects.length === projects.length) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Save updated projects
    await kvSetProjects(filteredProjects);
    
    return NextResponse.json({ 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
