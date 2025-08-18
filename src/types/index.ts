export interface Section {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  isCustom?: boolean;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  content: string;
  sections?: Section[];
  metadata?: {
    version: string;
    author: string;
    tags: string[];
  };
}

export interface SharedLink {
  projectId: string;
  accessType: 'view' | 'edit';
  createdAt: string;
  expiresAt: string;
  projectName: string;
}

export interface StorageStats {
  totalProjects: number;
  totalSize: string;
  fileSystemSize: string;
}
