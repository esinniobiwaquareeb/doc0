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
    // For now, we'll use filesystem as primary since blob.get() requires a full URL
    // In production, you'd need to construct the full blob URL
    return null;
  } catch {
    return null;
  }
}

async function blobSet<T>(key: string, value: T): Promise<void> {
  try {
    const jsonString = JSON.stringify(value);
    await put(`${key}.json`, jsonString, {
      access: 'public',
      addRandomSuffix: false
    });
  } catch {
    /* noop */
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
  await blobSet<Project[]>('projects', projects);
  await fsWrite<Project[]>('projects', projects);
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


