/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Search, 
  FileText, 
  Plus, 
  Settings, 
  Download, 
  Share2, 
  Clock, 
  Command,
  ArrowRight,
  Hash,
  Calendar,
  Zap
} from 'lucide-react';
import { storageService } from '@/lib/storage';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  content: string;
  sections?: any[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
  projects: Project[];
  currentView?: string;
}

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'actions' | 'projects' | 'recent' | 'search';
  keywords?: string[];
  shortcut?: string;
}

export function CommandPalette({ 
  isOpen, 
  onClose, 
  onCreateProject, 
  onOpenProject, 
  projects,
  currentView = 'dashboard'
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load recent projects (last 5 accessed)
    const recent = projects
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 5);
    setRecentProjects(recent);
  }, [projects]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getAllCommands = useCallback((): Command[] => {
    const commands: Command[] = [
      // Actions
      {
        id: 'create-project',
        title: 'Create New Project',
        description: 'Start a new documentation project',
        icon: <Plus className="h-4 w-4" />,
        action: () => {
          onClose();
          onCreateProject();
        },
        category: 'actions',
        keywords: ['new', 'create', 'project', 'documentation'],
        shortcut: 'Ctrl+N'
      },
      {
        id: 'export-data',
        title: 'Export All Data',
        description: 'Download complete backup of all projects',
        icon: <Download className="h-4 w-4" />,
        action: () => {
          onClose();
          const exportJson = storageService.exportAllData();
          const blob = new Blob([exportJson], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `doc0-backup-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
        },
        category: 'actions',
        keywords: ['export', 'backup', 'download', 'data'],
        shortcut: 'Ctrl+E'
      }
    ];

    // Add project-specific commands
    projects.forEach(project => {
      // Project search results
      if (query.length > 0) {
        const searchTerms = query.toLowerCase();
        const projectMatches = 
          project.name.toLowerCase().includes(searchTerms) ||
          project.description.toLowerCase().includes(searchTerms) ||
          (project.content && project.content.toLowerCase().includes(searchTerms));

        if (projectMatches) {
          commands.push({
            id: `search-${project.id}`,
            title: project.name,
            description: project.description || 'Open project',
            icon: <Search className="h-4 w-4" />,
            action: () => {
              onClose();
              onOpenProject(project.id);
            },
            category: 'search',
            keywords: [project.name, project.description]
          });
        }
      }

      // Regular project commands (when no search query)
      if (!query) {
        commands.push({
          id: `project-${project.id}`,
          title: project.name,
          description: project.description || 'Open project',
          icon: <FileText className="h-4 w-4" />,
          action: () => {
            onClose();
            onOpenProject(project.id);
          },
          category: 'projects',
          keywords: [project.name, project.description]
        });
      }
    });

    // Recent projects section
    if (!query && recentProjects.length > 0) {
      recentProjects.forEach(project => {
        commands.push({
          id: `recent-${project.id}`,
          title: project.name,
          description: `Modified ${formatDate(project.lastModified)}`,
          icon: <Clock className="h-4 w-4" />,
          action: () => {
            onClose();
            onOpenProject(project.id);
          },
          category: 'recent',
          keywords: [project.name]
        });
      });
    }

    return commands;
  }, [projects, recentProjects, query, onClose, onCreateProject, onOpenProject]);

  const allCommands = getAllCommands();
  const filteredCommands = query
    ? allCommands.filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()) || (cmd.keywords || []).some(k => k.toLowerCase().includes(query.toLowerCase())))
    : allCommands;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filteredCommands[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="flex items-center space-x-3">
            <Command className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={currentView === 'dashboard' ? 'Search projects or actions...' : 'Search actions...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-2">
            {filteredCommands.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No commands found. Try a different query.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={`w-full text-left p-3 rounded-md border hover:bg-muted transition-colors flex items-center space-x-3 ${index === selectedIndex ? 'bg-muted' : ''}`}
                  >
                    <div className="text-muted-foreground">
                      {cmd.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{cmd.title}</span>
                        {cmd.shortcut && (
                          <Badge variant="outline" className="text-2xs font-mono">
                            {cmd.shortcut}
                          </Badge>
                        )}
                      </div>
                      {cmd.description && (
                        <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}