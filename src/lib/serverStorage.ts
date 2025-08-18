import { promises as fs } from 'fs';
import path from 'path';
import type { Project, SharedLink } from '@/types';
import { kv } from '@vercel/kv';

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

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    return (await kv.get<T>(key)) ?? null;
  } catch {
    return null;
  }
}

async function kvSet<T>(key: string, value: T): Promise<void> {
  try {
    await kv.set(key, value as unknown as string);
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
  const fromKv = await kvGet<Project[]>('projects');
  if (fromKv) return fromKv;
  return fsRead<Project[]>('projects', []);
}

export async function setProjects(projects: Project[]): Promise<void> {
  await kvSet<Project[]>('projects', projects);
  await fsWrite<Project[]>('projects', projects);
}

export async function getSharedLinks(): Promise<Record<string, SharedLink>> {
  const fromKv = await kvGet<Record<string, SharedLink>>('shared-links');
  if (fromKv) return fromKv;
  return fsRead<Record<string, SharedLink>>('shared-links', {});
}

export async function setSharedLinks(sharedLinks: Record<string, SharedLink>): Promise<void> {
  await kvSet<Record<string, SharedLink>>('shared-links', sharedLinks);
  await fsWrite<Record<string, SharedLink>>('shared-links', sharedLinks);
}

export async function getFavorites(): Promise<string[]> {
  const fromKv = await kvGet<string[]>('favorites');
  if (fromKv) return fromKv;
  return fsRead<string[]>('favorites', []);
}

export async function setFavorites(favorites: string[]): Promise<void> {
  await kvSet<string[]>('favorites', favorites);
  await fsWrite<string[]>('favorites', favorites);
}


