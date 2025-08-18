/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Command, 
  FileText, 
  Plus, 
  Save, 
  Download, 
  Share2, 
  Search,
  Eye,
  Edit3,
  HelpCircle,
  Keyboard
} from 'lucide-react';

interface KeyboardShortcutsProps {
  onCommandPalette: () => void;
  onCreateProject?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onTogglePreview?: () => void;
  currentView?: 'dashboard' | 'editor' | 'shared';
}

interface Shortcut {
  key: string;
  description: string;
  icon: React.ReactNode;
  category: 'general' | 'navigation' | 'editor' | 'actions';
  context?: 'dashboard' | 'editor' | 'shared' | 'global';
}

export function KeyboardShortcuts({
  onCommandPalette,
  onCreateProject,
  onSave,
  onDownload,
  onShare,
  onTogglePreview,
  currentView = 'dashboard'
}: KeyboardShortcutsProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Global shortcuts
      if (cmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        onCommandPalette();
        return;
      }

      if (cmdOrCtrl && e.key === '/') {
        e.preventDefault();
        setIsHelpOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        if (isHelpOpen) {
          setIsHelpOpen(false);
        }
        return;
      }

      // Context-specific shortcuts
      if (currentView === 'dashboard') {
        if (cmdOrCtrl && e.key === 'n') {
          e.preventDefault();
          onCreateProject?.();
          return;
        }
      }

      if (currentView === 'editor') {
        if (cmdOrCtrl && e.key === 's') {
          e.preventDefault();
          onSave?.();
          return;
        }

        if (cmdOrCtrl && e.key === 'e') {
          e.preventDefault();
          onDownload?.();
          return;
        }

        if (cmdOrCtrl && e.shiftKey && e.key === 'S') {
          e.preventDefault();
          onShare?.();
          return;
        }

        if (cmdOrCtrl && e.key === 'p') {
          e.preventDefault();
          onTogglePreview?.();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    currentView,
    onCommandPalette,
    onCreateProject,
    onSave,
    onDownload,
    onShare,
    onTogglePreview,
    isHelpOpen
  ]);

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts: Shortcut[] = [
    // General
    {
      key: `${cmdKey} K`,
      description: 'Open command palette',
      icon: <Command className="h-4 w-4" />,
      category: 'general',
      context: 'global'
    },
    {
      key: `${cmdKey} /`,
      description: 'Show keyboard shortcuts',
      icon: <HelpCircle className="h-4 w-4" />,
      category: 'general',
      context: 'global'
    },
    {
      key: 'Esc',
      description: 'Close dialogs/modals',
      icon: <HelpCircle className="h-4 w-4" />,
      category: 'general',
      context: 'global'
    },

    // Dashboard
    {
      key: `${cmdKey} N`,
      description: 'Create new project',
      icon: <Plus className="h-4 w-4" />,
      category: 'actions',
      context: 'dashboard'
    },

    // Editor
    {
      key: `${cmdKey} S`,
      description: 'Save project',
      icon: <Save className="h-4 w-4" />,
      category: 'editor',
      context: 'editor'
    },
    {
      key: `${cmdKey} E`,
      description: 'Export/Download markdown',
      icon: <Download className="h-4 w-4" />,
      category: 'editor',
      context: 'editor'
    },
    {
      key: `${cmdKey} Shift S`,
      description: 'Share project',
      icon: <Share2 className="h-4 w-4" />,
      category: 'editor',
      context: 'editor'
    },
    {
      key: `${cmdKey} P`,
      description: 'Toggle preview panel',
      icon: <Eye className="h-4 w-4" />,
      category: 'editor',
      context: 'editor'
    },
    {
      key: `${cmdKey} A`,
      description: 'Select all text in editor',
      icon: <Edit3 className="h-4 w-4" />,
      category: 'editor',
      context: 'editor'
    },

    // Navigation
    {
      key: '↑ ↓',
      description: 'Navigate command palette',
      icon: <Search className="h-4 w-4" />,
      category: 'navigation',
      context: 'global'
    },
    {
      key: '↵ Enter',
      description: 'Execute selected command',
      icon: <Command className="h-4 w-4" />,
      category: 'navigation',
      context: 'global'
    }
  ];

  const getRelevantShortcuts = () => {
    return shortcuts.filter(shortcut => 
      shortcut.context === 'global' || shortcut.context === currentView
    );
  };

  const groupedShortcuts = getRelevantShortcuts().reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category]!.push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const categoryLabels = {
    general: 'General',
    navigation: 'Navigation',
    editor: 'Editor',
    actions: 'Actions'
  };

  const categoryIcons = {
    general: <Keyboard className="h-4 w-4" />,
    navigation: <Search className="h-4 w-4" />,
    editor: <Edit3 className="h-4 w-4" />,
    actions: <FileText className="h-4 w-4" />
  };

  return (
    <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5" />
            <span>Keyboard Shortcuts</span>
            <Badge variant="outline" className="text-xs">
              {currentView === 'dashboard' ? 'Dashboard' : currentView === 'editor' ? 'Editor' : 'Viewer'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts], index) => (
              <div key={category}>
                <div className="flex items-center space-x-2 mb-3">
                  {categoryIcons[category as keyof typeof categoryIcons]}
                  <h3 className="text-sm font-medium">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {shortcuts.map((shortcut, shortcutIndex) => (
                    <div key={shortcutIndex} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border/50 bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div className="text-muted-foreground">
                          {shortcut.icon}
                        </div>
                        <span className="text-sm">
                          {shortcut.description}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs font-mono bg-background">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {index < Object.entries(groupedShortcuts).length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className="text-xs font-mono">
                {cmdKey} /
              </Badge>
              <span>Show this help</span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className="text-xs font-mono">
                Esc
              </Badge>
              <span>Close</span>
            </div>
          </div>
          <span className="text-muted-foreground">
            {getRelevantShortcuts().length} shortcuts available
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}