import { promises as fs } from 'fs';
import path from 'path';
import type { Project, SharedLink } from '@/types';
import { put, del, list } from '@vercel/blob';

const dataDir = path.join(process.cwd(), 'src', 'data');
const fileForKey = (key: string) => {
  switch (key) {
    case 'projects':
      return path.join(dataDir, 'projects.json');
    case 'shared-links':
      return path.join(dataDir, 'shared-links.json');
    case 'favorites':
      return path.join(dataDir, 'favorites.json');
    default:
      return path.join(dataDir, `${key}.json`);
  }
};

async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function blobGet<T>(key: string): Promise<T | null> {
  try {
    // List blobs to find the one we want
    const { blobs } = await list();
    const targetBlob = blobs.find(blob => blob.pathname === `${key}.json`);
    
    if (!targetBlob) return null;
    
    // Fetch the blob content
    const response = await fetch(targetBlob.url);
    if (!response.ok) return null;
    
    const text = await response.text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function blobSet<T>(key: string, value: T): Promise<void> {
  try {
    const jsonString = JSON.stringify(value);
    console.log(`[Blob] Saving ${key} to blob storage...`);
    const result = await put(`${key}.json`, jsonString, {
      access: 'public',
      addRandomSuffix: false
    });
    console.log(`[Blob] Successfully saved ${key} to blob storage:`, result.url);
  } catch (error) {
    console.error(`[Blob] Failed to save ${key} to blob storage:`, error);
    throw error; // Re-throw to let caller know it failed
  }
}

async function fsRead<T>(key: string, fallback: T): Promise<T> {
  try {
    await ensureDataDir();
    const file = fileForKey(key);
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

async function fsWrite<T>(key: string, value: T): Promise<void> {
  try {
    await ensureDataDir();
    const file = fileForKey(key);
    await fs.writeFile(file, JSON.stringify(value, null, 2));
  } catch {
    /* noop */
  }
}

export async function getProjects(): Promise<Project[]> {
  const fromBlob = await blobGet<Project[]>('projects');
  if (fromBlob) return fromBlob;
  return fsRead<Project[]>('projects', []);
}

export async function setProjects(projects: Project[]): Promise<void> {
  console.log(`[Storage] Setting ${projects.length} projects...`);
  try {
    await blobSet<Project[]>('projects', projects);
    console.log(`[Storage] Successfully saved to blob storage`);
  } catch (error) {
    console.error(`[Storage] Blob storage failed, falling back to filesystem:`, error);
  }
  
  try {
    await fsWrite<Project[]>('projects', projects);
    console.log(`[Storage] Successfully saved to filesystem`);
  } catch (error) {
    console.error(`[Storage] Filesystem save also failed:`, error);
    throw error; // If both fail, we have a problem
  }
}

export async function getSharedLinks(): Promise<Record<string, SharedLink>> {
  const fromBlob = await blobGet<Record<string, SharedLink>>('shared-links');
  if (fromBlob) return fromBlob;
  return fsRead<Record<string, SharedLink>>('shared-links', {});
}

export async function setSharedLinks(sharedLinks: Record<string, SharedLink>): Promise<void> {
  await blobSet<Record<string, SharedLink>>('shared-links', sharedLinks);
  await fsWrite<Record<string, SharedLink>>('shared-links', sharedLinks);
}

export async function getFavorites(): Promise<string[]> {
  const fromBlob = await blobGet<string[]>('favorites');
  if (fromBlob) return fromBlob;
  return fsRead<string[]>('favorites', []);
}

export async function setFavorites(favorites: string[]): Promise<void> {
  await blobSet<string[]>('favorites', favorites);
  await fsWrite<string[]>('favorites', favorites);
}


