/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Project, Section, SharedLink, StorageStats } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export class NextJsStorageService {
  private projectsCache: Project[] = [];
  private sharedLinksCache: Record<string, SharedLink> = {};
  private favoritesCache: string[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      if (!this.isInitialized) {
        await this.loadAllData();
        this.isInitialized = true;
      }
    } catch (error) {
      // Silent initialization error handling
    }
  }

  private async loadAllData() {
    try {
      this.projectsCache = await this.apiGet<Project[]>('/projects');
      this.sharedLinksCache = await this.apiGet<Record<string, SharedLink>>('/shared-links');
      this.favoritesCache = await this.apiGet<string[]>('/favorites');
    } catch (error) {
      // Initialize with empty arrays if loading fails
      this.projectsCache = [];
      this.sharedLinksCache = {};
      this.favoritesCache = [];
    }
  }

  // Generic API methods
  private async apiGet<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  private async apiPost<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  private async apiPut<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  private async apiDelete(endpoint: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
  }

  // Public methods
  async getProjects(): Promise<Project[]> {
    await this.initializeStorage();
    try {
      const fresh = await this.apiGet<Project[]>('/projects');
      this.projectsCache = fresh;
    } catch {
      // keep existing cache on fetch failure
    }
    return this.projectsCache;
  }

  getProjectsSync(): Project[] {
    return this.projectsCache;
  }

  async saveProjects(projects: Project[]): Promise<void> {
    try {
      this.projectsCache = projects;
      await this.apiPost('/projects', { projects });
    } catch (error) {
      // Error handling will be done by the calling component
    }
  }

  async saveProject(project: Project): Promise<void> {
    try {
      const existingIndex = this.projectsCache.findIndex(p => p.id === project.id);
      if (existingIndex >= 0) {
        this.projectsCache[existingIndex] = project;
      } else {
        this.projectsCache.push(project);
      }
      
      await this.apiPut(`/projects/${project.id}`, project);
    } catch (error) {
      // Error handling will be done by the calling component
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      this.projectsCache = this.projectsCache.filter(p => p.id !== projectId);
      await this.apiDelete(`/projects/${projectId}`);
    } catch (error) {
      // Error handling will be done by the calling component
    }
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
      const project = this.projectsCache.find(p => p.id === projectId);
      if (project) {
        return project;
      }
      
      // Try to fetch from API if not in cache
      const fetchedProject = await this.apiGet<Project>(`/projects/${projectId}`);
      if (fetchedProject) {
        this.projectsCache.push(fetchedProject);
        return fetchedProject;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async getSharedLinks(): Promise<Record<string, SharedLink>> {
    await this.initializeStorage();
    return this.sharedLinksCache;
  }

  getSharedLinksSync(): Record<string, SharedLink> {
    return this.sharedLinksCache;
  }

  async saveSharedLinks(sharedLinks: Record<string, SharedLink>): Promise<void> {
    try {
      this.sharedLinksCache = sharedLinks;
      await this.apiPost('/shared-links', { sharedLinks });
    } catch (error) {
      // Error handling will be done by the calling component
    }
  }

  async getFavorites(): Promise<string[]> {
    await this.initializeStorage();
    return this.favoritesCache;
  }

  getFavoritesSync(): string[] {
    return this.favoritesCache;
  }

  async saveFavorites(favorites: string[]): Promise<void> {
    try {
      this.favoritesCache = favorites;
      await this.apiPost('/favorites', { favorites });
    } catch (error) {
      // Error handling will be done by the calling component
    }
  }

  exportAllData(): string {
    try {
      const exportData = {
        projects: this.projectsCache,
        sharedLinks: this.sharedLinksCache,
        favorites: this.favoritesCache,
        exportDate: new Date().toISOString()
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      return '{}';
    }
  }

  getStorageStats(): StorageStats {
    try {
      const projects = this.getProjectsSync();
      const projectsJson = JSON.stringify(projects);
      const totalSize = this.formatBytes(Buffer.byteLength(projectsJson, 'utf8'));
      
      return {
        totalProjects: projects.length,
        totalSize,
        fileSystemSize: totalSize
      };
    } catch (error) {
      return { totalProjects: 0, totalSize: '0 B', fileSystemSize: '0 B' };
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const storageService = new NextJsStorageService();
