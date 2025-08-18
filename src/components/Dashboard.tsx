/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { DocumentMetrics } from './DocumentMetrics';
import { Plus, FileText, Users, Calendar, LogOut, Trash2, AlertTriangle, CheckCircle, Database, Clock, FolderOpen, Edit3, MoreVertical, Search, Command, Star, Zap, Layers, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { storageService } from '@/lib/storage';

interface Section {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  isCustom?: boolean;
  order: number;
}

interface Project {
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

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  sections: Omit<Section, 'id' | 'isActive'>[];
}

interface DashboardProps {
  onOpenProject: (projectId: string) => void;
  onLogout: () => void;
}

export function Dashboard({ onOpenProject, onLogout }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [dataStats, setDataStats] = useState<{totalSize: string, totalProjects: number, totalSections: number}>({
    totalSize: '0 KB',
    totalProjects: 0,
    totalSections: 0
  });

  const templates: ProjectTemplate[] = [
    {
      id: 'blank',
      name: 'Blank Project',
      description: 'Start with a clean slate',
      icon: <FileText className="h-5 w-5" />,
      content: '# Project Title\n\nBrief description of your project.\n\n## Getting Started\n\nAdd your documentation here...',
      sections: [
        {
          name: 'Title and Description',
          content: '# Project Title\n\nBrief description of your project.\n\n## Getting Started\n\nAdd your documentation here...',
          isCustom: false,
          order: 0
        }
      ]
    },
    {
      id: 'api',
      name: 'API Documentation',
      description: 'Document your API endpoints and usage',
      icon: <Database className="h-5 w-5" />,
      content: '# API Documentation\n\n## Overview\n\nThis API provides...\n\n## Authentication\n\n```bash\ncurl -H "Authorization: Bearer YOUR_TOKEN"\n```\n\n## Endpoints\n\n### GET /api/users\n\nRetrieve a list of users.\n\n**Parameters:**\n- `limit` (optional): Number of users to return\n- `offset` (optional): Number of users to skip\n\n**Response:**\n```json\n{\n  "users": [...],\n  "total": 100\n}\n```',
      sections: [
        {
          name: 'Overview',
          content: '# API Documentation\n\n## Overview\n\nThis API provides comprehensive access to our platform features.',
          isCustom: false,
          order: 0
        },
        {
          name: 'Authentication',
          content: '## Authentication\n\nAll API requests require authentication using Bearer tokens.\n\n```bash\ncurl -H "Authorization: Bearer YOUR_TOKEN" \\\n  https://api.example.com/v1/endpoint\n```',
          isCustom: true,
          order: 1
        },
        {
          name: 'Endpoints',
          content: '## Endpoints\n\n### GET /api/users\n\nRetrieve a list of users.\n\n**Parameters:**\n- `limit` (optional): Number of users to return\n- `offset` (optional): Number of users to skip',
          isCustom: true,
          order: 2
        }
      ]
    },
    {
      id: 'readme',
      name: 'README Template',
      description: 'Perfect for GitHub repositories',
      icon: <Edit3 className="h-5 w-5" />,
      content: '# Project Name\n\n> Brief description of what this project does and who it\'s for.\n\n## Features\n\n- ✨ Feature 1\n- 🚀 Feature 2\n- 💡 Feature 3\n\n## Installation\n\n```bash\nnpm install project-name\n```\n\n## Usage\n\n```javascript\nimport { ProjectName } from \'project-name\';\n\nconst project = new ProjectName();\nproject.start();\n```\n\n## Contributing\n\nContributions are welcome! Please feel free to submit a Pull Request.\n\n## License\n\nThis project is licensed under the MIT License.',
      sections: [
        {
          name: 'Header & Description',
          content: '# Project Name\n\n> Brief description of what this project does and who it\'s for.\n\n![Build Status](https://img.shields.io/badge/build-passing-brightgreen)\n![Version](https://img.shields.io/badge/version-1.0.0-blue)',
          isCustom: false,
          order: 0
        },
        {
          name: 'Features & Installation',
          content: '## Features\n\n- ✨ Feature 1: Amazing functionality\n- 🚀 Feature 2: Lightning fast performance\n- 💡 Feature 3: Intuitive design\n\n## Installation\n\n```bash\nnpm install project-name\n# or\nyarn add project-name\n```',
          isCustom: true,
          order: 1
        },
        {
          name: 'Usage & Examples',
          content: '## Usage\n\n```javascript\nimport { ProjectName } from \'project-name\';\n\nconst project = new ProjectName();\nproject.start();\n```\n\n### Advanced Usage\n\n```javascript\nconst project = new ProjectName({\n  option1: \'value1\',\n  option2: true\n});\n```',
          isCustom: true,
          order: 2
        },
        {
          name: 'Contributing & License',
          content: '## Contributing\n\nContributions are welcome! Please feel free to submit a Pull Request.\n\n### Development Setup\n\n1. Fork the repository\n2. Clone your fork\n3. Install dependencies: `npm install`\n4. Make your changes\n5. Submit a pull request\n\n## License\n\nThis project is licensed under the MIT License.',
          isCustom: true,
          order: 3
        }
      ]
    },
    {
      id: 'user-guide',
      name: 'User Guide',
      description: 'Comprehensive user documentation',
      icon: <Users className="h-5 w-5" />,
      content: '# User Guide\n\nWelcome to our application! This guide will help you get started.\n\n## Quick Start\n\n1. Create an account\n2. Set up your profile\n3. Start using the features\n\n## Features Overview\n\n### Feature 1: Getting Started\n\nDetailed explanation of Feature 1...\n\n### Feature 2: Advanced Usage\n\nHow to use advanced features...\n\n## Troubleshooting\n\n### Common Issues\n\n**Issue 1:** Cannot log in\n- Check your credentials\n- Reset password if needed\n\n**Issue 2:** Feature not working\n- Clear browser cache\n- Contact support\n\n## Support\n\nNeed help? Contact us at support@example.com',
      sections: [
        {
          name: 'Introduction',
          content: '# User Guide\n\nWelcome to our application! This comprehensive guide will help you get the most out of our platform.\n\n## What You\'ll Learn\n\n- How to set up your account\n- Core features and functionality\n- Advanced tips and tricks\n- Troubleshooting common issues',
          isCustom: false,
          order: 0
        },
        {
          name: 'Quick Start',
          content: '## Quick Start\n\nGet up and running in just a few minutes:\n\n1. **Create an account** - Sign up with your email\n2. **Verify your email** - Check your inbox for verification\n3. **Set up your profile** - Add your details and preferences\n4. **Take the tour** - Familiarize yourself with the interface\n5. **Start using features** - Begin with the basics',
          isCustom: true,
          order: 1
        },
        {
          name: 'Features Guide',
          content: '## Features Overview\n\n### Core Features\n\n#### Feature 1: Dashboard\n- Overview of your activity\n- Quick access to common tasks\n- Customizable widgets\n\n#### Feature 2: Projects\n- Create and manage projects\n- Collaborate with team members\n- Track progress and milestones',
          isCustom: true,
          order: 2
        },
        {
          name: 'Troubleshooting',
          content: '## Troubleshooting\n\n### Common Issues\n\n**Issue: Cannot log in**\n- Verify your email and password\n- Check if Caps Lock is on\n- Try password reset if needed\n- Clear browser cookies\n\n**Issue: Features not loading**\n- Refresh the page\n- Clear browser cache\n- Check internet connection\n- Try a different browser\n\n### Getting Help\n\nStill need assistance? We\'re here to help!\n\n- 📧 Email: support@example.com\n- 💬 Live chat: Available 9 AM - 5 PM EST\n- 📖 Knowledge base: help.example.com',
          isCustom: true,
          order: 3
        }
      ]
    }
  ];

  useEffect(() => {
    loadProjects();
    loadFavorites();
    calculateDataStats();
  }, []);

  const loadProjects = async () => {
    try {
              const savedProjects = await storageService.getProjects();
      if (savedProjects && savedProjects.length > 0) {
        const parsedProjects = [...savedProjects];
        parsedProjects.sort((a: Project, b: Project) => 
          new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        );
        setProjects(parsedProjects);
      }
    } catch (error) {
      toast.error('Failed to load projects', {
        description: 'There was an error loading your projects'
      });
    }
  };

  const loadFavorites = async () => {
    try {
              const favs = await storageService.getFavorites();
      setFavorites(new Set(favs));
    } catch (error) {
      toast.error('Failed to load favorites', {
        description: 'There was an error loading your favorites'
      });
    }
  };

  const toggleFavorite = (projectId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(projectId)) {
      newFavorites.delete(projectId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(projectId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
    void storageService.saveFavorites(Array.from(newFavorites));
  };

  const calculateDataStats = async () => {
    try {
      const stats = storageService.getStorageStats();
      const projects = await storageService.getProjects();
      const totalSections = projects.reduce((sum: number, project: Project) => {
        return sum + (project.sections?.length || 0);
      }, 0);

      setDataStats({
        totalSize: stats.totalSize,
        totalProjects: projects.length,
        totalSections
      });
    } catch (error) {
      toast.error('Failed to calculate data stats', {
        description: 'There was an error calculating statistics'
      });
    }
  };

  const createProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Project name is required', {
        description: 'Please enter a name for your project'
      });
      return;
    }

    try {
      const now = new Date().toISOString();
      const projectId = Date.now().toString();
      const template = templates.find(t => t.id === selectedTemplate) || templates[0];
      
      if (!template) {
        throw new Error('No template found');
      }
      
      // Create sections from template
      const projectSections: Section[] = template.sections.map((section, index) => ({
        ...section,
        id: (index + 1).toString(),
        isActive: index === 0
      }));

      const newProject: Project = {
        id: projectId,
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        createdAt: now,
        lastModified: now,
        content: template.content.replace('Project Title', newProjectName.trim()),
        sections: projectSections,
        metadata: {
          version: '1.0',
          author: 'Doc0',
          tags: []
        }
      };

      const updatedProjects = [newProject, ...projects]; // Add to beginning for newest first
      setProjects(updatedProjects);
      void storageService.saveProjects(updatedProjects);

      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedTemplate('blank');
      setIsCreateModalOpen(false);
      calculateDataStats();

      toast.success('Project created successfully', {
        description: `"${newProject.name}" is ready for editing with ${projectSections.length} sections`,
        icon: <CheckCircle className="h-4 w-4" />
      });
    } catch (error) {
      toast.error('Failed to create project', {
        description: 'There was an error creating your project'
      });
    }
  };

  const deleteProject = async (project: Project) => {
    try {
      const updatedProjects = projects.filter(p => p.id !== project.id);
      setProjects(updatedProjects);
      void storageService.saveProjects(updatedProjects);

      // Remove from favorites if it exists
      const newFavorites = new Set(favorites);
      newFavorites.delete(project.id);
      setFavorites(newFavorites);
      void storageService.saveFavorites(Array.from(newFavorites));

      // Also clean up shared links for this project
      const sharedLinks = await storageService.getSharedLinks();
      const updatedLinks = Object.fromEntries(
        Object.entries(sharedLinks).filter(([, data]: [string, any]) => (data as any).projectId !== project.id)
      );
      await storageService.saveSharedLinks(updatedLinks as any);

      setProjectToDelete(null);
      calculateDataStats();
      
      toast.success('Project deleted successfully', {
        description: `"${project.name}" and all its ${project.sections?.length || 0} sections have been permanently removed`,
        icon: <CheckCircle className="h-4 w-4" />
      });
    } catch (error) {
      toast.error('Failed to delete project', {
        description: 'There was an error deleting your project'
      });
    }
  };

  const exportAllData = () => {
    try {
      const exportJson = storageService.exportAllData();
      const blob = new Blob([exportJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const filename = `doc0-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully', {
        description: `Complete backup saved as ${filename}`,
        icon: <Database className="h-4 w-4" />
      });
    } catch (error) {
      toast.error('Export failed', {
        description: 'There was an error exporting your data'
      });
    }
  };

  const handleCreateProjectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createProject();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
      return formatDate(dateString);
    } catch (error) {
      return 'Unknown';
    }
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.content.toLowerCase().includes(query)
    );
  });

  const favoriteProjects = filteredProjects.filter(p => favorites.has(p.id));
  const recentProjects = filteredProjects.filter(p => !favorites.has(p.id)).slice(0, 6);
  const otherProjects = filteredProjects.filter(p => !favorites.has(p.id)).slice(6);

  const getProjectStats = () => {
    if (projects.length === 0) return null;
    
    const totalProjects = projects.length;
    const recentProjects = projects.filter(p => {
      const lastModified = new Date(p.lastModified);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastModified > weekAgo;
    }).length;

    return { totalProjects, recentProjects };
  };

  const stats = getProjectStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCreateProject={() => setIsCreateModalOpen(true)}
        onOpenProject={onOpenProject}
        projects={projects}
        currentView="dashboard"
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onCommandPalette={() => setIsCommandPaletteOpen(true)}
        onCreateProject={() => setIsCreateModalOpen(true)}
        currentView="dashboard"
      />

      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-foreground">Doc0</h1>
                <p className="text-sm text-muted-foreground">Documentation Management Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 bg-muted/30"
                  />
                  <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <Command className="h-3 w-3" />K
                  </kbd>
                </div>
              </div>

              {stats && (
                <div className="hidden sm:flex items-center space-x-4 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <FolderOpen className="h-3 w-3" />
                    <span>{stats.totalProjects} projects</span>
                  </div>
                  <Separator orientation="vertical" className="h-3" />
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{stats.recentProjects} recent</span>
                  </div>
                  <Separator orientation="vertical" className="h-3" />
                  <div className="flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>{dataStats.totalSize}</span>
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={exportAllData} className="hidden sm:flex">
                <Database className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-medium text-foreground">Project Documentation</h2>
            <p className="text-muted-foreground mt-1">Manage all your project documentation with comprehensive section management and advanced features</p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Create New Project</span>
                </DialogTitle>
                <DialogDescription>
                  Choose a template to get started quickly or create a blank project from scratch
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="projectName" className="text-sm font-medium">
                      Project Name *
                    </label>
                    <Input
                      id="projectName"
                      placeholder="Enter project name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={handleCreateProjectKeyDown}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="projectDescription" className="text-sm font-medium">
                      Description (Optional)
                    </label>
                    <Input
                      id="projectDescription"
                      placeholder="Brief project description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      onKeyDown={handleCreateProjectKeyDown}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4" />
                    <label className="text-sm font-medium">Choose Template</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-md ${
                            selectedTemplate === template.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {template.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{template.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                            <div className="flex items-center mt-2">
                              <Badge variant="outline" className="text-xs">
                                {template.sections.length} sections
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createProject} disabled={!newProjectName.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Data Statistics */}
        {dataStats.totalProjects > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Projects</p>
                  <p className="text-2xl font-semibold text-blue-900 dark:text-blue-100">{dataStats.totalProjects}</p>
                </div>
                <div className="h-10 w-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Sections</p>
                  <p className="text-2xl font-semibold text-green-900 dark:text-green-100">{dataStats.totalSections}</p>
                </div>
                <div className="h-10 w-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-5 w-5 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Data Storage</p>
                  <p className="text-2xl font-semibold text-purple-900 dark:text-purple-100">{dataStats.totalSize}</p>
                </div>
                <div className="h-10 w-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="text-center py-16 border-dashed border-2 border-muted-foreground/25">
            <CardContent className="pt-6">
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first documentation project to get started with Doc0&apos;s advanced features including templates, command palette, and comprehensive section management
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="px-8">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
              <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-muted border rounded text-xs">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-muted border rounded text-xs">K</kbd>
                  <span>Command palette</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-muted border rounded text-xs">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-muted border rounded text-xs">N</kbd>
                  <span>New project</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Search Results or Favorites */}
            {searchQuery && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    Search Results for &quot;{searchQuery}&quot;
                  </h3>
                  <Badge variant="outline">{filteredProjects.length} found</Badge>
                </div>
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No projects found matching &quot;{searchQuery}&quot;</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isFavorite={favorites.has(project.id)}
                        onToggleFavorite={() => toggleFavorite(project.id)}
                        onOpen={() => onOpenProject(project.id)}
                        onDelete={() => setProjectToDelete(project)}
                        formatRelativeTime={formatRelativeTime}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {!searchQuery && (
              <>
                {/* Favorites Section */}
                {favoriteProjects.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <h3 className="text-lg font-medium">Favorites</h3>
                      <Badge variant="outline">{favoriteProjects.length}</Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {favoriteProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          isFavorite={true}
                          onToggleFavorite={() => toggleFavorite(project.id)}
                          onOpen={() => onOpenProject(project.id)}
                          onDelete={() => setProjectToDelete(project)}
                          formatRelativeTime={formatRelativeTime}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Projects */}
                {recentProjects.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">Recent Projects</h3>
                      <Badge variant="outline">{recentProjects.length}</Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {recentProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          isFavorite={favorites.has(project.id)}
                          onToggleFavorite={() => toggleFavorite(project.id)}
                          onOpen={() => onOpenProject(project.id)}
                          onDelete={() => setProjectToDelete(project)}
                          formatRelativeTime={formatRelativeTime}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Other Projects */}
                {otherProjects.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-medium">All Projects</h3>
                      <Badge variant="outline">{otherProjects.length}</Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {otherProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          isFavorite={favorites.has(project.id)}
                          onToggleFavorite={() => toggleFavorite(project.id)}
                          onOpen={() => onOpenProject(project.id)}
                          onDelete={() => setProjectToDelete(project)}
                          formatRelativeTime={formatRelativeTime}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                Delete Project
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;<strong>{projectToDelete?.name}</strong>&quot;? This action cannot be undone. 
                All documentation content, {projectToDelete?.sections?.length || 0} sections, and shared links will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => projectToDelete && deleteProject(projectToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  isFavorite,
  onToggleFavorite,
  onOpen,
  onDelete,
  formatRelativeTime,
  formatDate
}: {
  project: Project;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpen: () => void;
  onDelete: () => void;
  formatRelativeTime: (date: string) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="group relative">
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20">
        {/* Project Header */}
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors font-medium">
                  {project.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Created {formatDate(project.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className={`h-8 w-8 p-0 transition-all ${
                  isFavorite 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-muted-foreground hover:text-yellow-500 opacity-0 group-hover:opacity-100'
                }`}
              >
                <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {project.description && (
            <CardDescription className="line-clamp-2 text-sm leading-relaxed">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>

        {/* Project Metadata */}
        <CardContent className="pt-0 space-y-4">
          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {/* Document Metrics */}
          <div className="space-y-2">
            <DocumentMetrics 
              content={project.content}
              compact={true}
              isVisible={true}
            />
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Edit3 className="h-3 w-3" />
                <span>{project.sections?.length || 0} sections</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(project.lastModified)}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              README
            </Badge>
          </div>
          
          {/* Action Button */}
          <Button 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md" 
            variant="outline"
            onClick={onOpen}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Open Project
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}