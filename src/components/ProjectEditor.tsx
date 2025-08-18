/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { DocumentMetrics } from './DocumentMetrics';
import { ArrowLeft, Share2, Eye, Edit, Copy, Save, Download, FileText, Users, CheckCircle, AlertCircle, Clock, ExternalLink, Check, Command, Keyboard, BarChart3, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { SectionsPanel } from './SectionsPanel';
import { SyntaxEditor } from './SyntaxEditor';
import { PreviewPanel } from './PreviewPanel';
import { storageService } from '@/lib/storage';


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

interface Section {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  isCustom?: boolean;
  order: number;
}

interface ProjectEditorProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectEditor({ projectId, onBack }: ProjectEditorProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [fullContent, setFullContent] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [shareAccessType, setShareAccessType] = useState<'view' | 'edit'>('view');
  const [shareExpiryDays, setShareExpiryDays] = useState('7');
  const [shareLinks, setShareLinks] = useState<any[]>([]);
  const [newlyCreatedLink, setNewlyCreatedLink] = useState<string | null>(null);
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [customAlias, setCustomAlias] = useState<string>('');

  useEffect(() => {
    loadProject();
    loadShareLinks();
  }, [projectId]);

  // Real-time content generation whenever sections change
  useEffect(() => {
    generateFullContent();
  }, [sections]);

  // REMOVED: Problematic useEffect that was checking for unsaved changes
  // This was causing navigation issues by changing state too frequently
  // useEffect(() => {
  //   // Check for unsaved changes
  //   if (project && fullContent !== project.content) {
  //     setHasUnsavedChanges(true);
  //   } else {
  //     setHasUnsavedChanges(false);
  //   }
  // }, [fullContent, project]);

  // Save before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadProject = async () => {
    const projects = await storageService.getProjects();
    const currentProject = projects.find((p: Project) => p.id === projectId);
    if (currentProject) {
      setProject(currentProject);
      setLastSaved(currentProject.lastModified);
      
      // Load sections from project or create default
      if (currentProject.sections && currentProject.sections.length > 0) {
        const sortedSections = currentProject.sections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setSections(sortedSections);
        const activeSection = sortedSections.find((s: any) => s.isActive) || sortedSections[0];
        if (activeSection) {
          setActiveSection(activeSection);
        }
      } else {
        // Create default section from content
        const defaultSection: Section = {
          id: '1',
          name: 'Title and Description',
          content: currentProject.content,
          isActive: true,
          order: 0
        };
        setSections([defaultSection]);
        setActiveSection(defaultSection);
      }
    }
  };

  const loadShareLinks = async () => {
    const allSharedLinks = await storageService.getSharedLinks();
    const entries = Object.entries(allSharedLinks)
      .filter(([, data]: [string, any]) => (data as any).projectId === projectId)
      .map(([token, data]: [string, any]) => ({ token, ...(data as any) }));

    // Deduplicate: keep one link per (accessType, expiresAt) preferring short tokens
    const isShort = (t: string) => /^[0-9A-Za-z]{8,14}$/.test(t);
    const byKey = new Map<string, { token: string } & any>();
    for (const item of entries) {
      const key = `${item.accessType}|${item.expiresAt}`;
      const chosen = byKey.get(key);
      if (!chosen) {
        byKey.set(key, item);
      } else if ((chosen.alias ? 0 : 1) > (item.alias ? 0 : 1)) {
        // Prefer alias over token
        byKey.set(key, item);
      } else if (!chosen.alias && !isShort(chosen.token) && isShort(item.token)) {
        byKey.set(key, item);
      }
    }
    const deduped = Array.from(byKey.values());
    setShareLinks(deduped);

    // Optionally persist cleanup by removing duplicate tokens for this project
    try {
      const desiredTokens = new Set(deduped.map((d) => d.token));
      const cleaned: Record<string, any> = { ...allSharedLinks } as any;
      for (const [token, data] of Object.entries(allSharedLinks)) {
        const d = data as any;
        if (d.projectId === projectId && !desiredTokens.has(token)) {
          delete (cleaned as any)[token];
        }
      }
      await storageService.saveSharedLinks(cleaned as any);
    } catch {
      // ignore persistence cleanup errors
    }
  };

  // Real-time content generation - SIMPLIFIED to avoid excessive state changes
  const generateFullContent = useCallback(() => {
    if (sections.length === 0) return;
    
    const content = sections
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(section => section.content)
      .join('\n\n');
    
    // Only update if content actually changed
    if (content !== fullContent) {
      setFullContent(content);
    }
  }, [sections, fullContent]);

  const saveProject = useCallback(async (showToast = true) => {
    if (!project) return;

    setIsSaving(true);
    setAutoSaveStatus('saving');
    
    try {
      const projects = await storageService.getProjects();
      const now = new Date().toISOString();
      
      const updatedProject: Project = {
        ...project,
        content: fullContent,
        lastModified: now,
        sections: sections.map((section, index) => ({
          ...section,
          order: index
        })),
        metadata: {
          version: '1.0',
          author: 'Doc0',
          tags: []
        }
      };

      const updatedProjects = projects.map((p: Project) => 
        p.id === projectId ? updatedProject : p
      );

      await storageService.saveProjects(updatedProjects);
      setProject(updatedProject);
      setLastSaved(now);
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
      
      if (showToast) {
        toast.success('Project saved successfully', {
          description: `${sections.length} sections saved with full content`,
          icon: <CheckCircle className="h-4 w-4" />
        });
      }

      // Reset status after 3 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    } catch (error) {
      setAutoSaveStatus('error');
      if (showToast) {
        toast.error('Failed to save project', {
          description: 'Please try again',
          icon: <AlertCircle className="h-4 w-4" />
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [project, projectId, fullContent, sections]);

  // Auto-save after short inactivity
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || !project) return;

    const timeoutId = setTimeout(() => {
      void saveProject(false); // silent auto-save
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [hasUnsavedChanges, isSaving, project, fullContent, sections, saveProject]);

  // Debounced content change handler - mark unsaved changes only
  const handleContentChange = useCallback((newContent: string) => {
    if (!activeSection) return;
    
    const updatedSection = { ...activeSection, content: newContent };
    setSections(prev => prev.map(s => s.id === activeSection.id ? updatedSection : s));
    setActiveSection(updatedSection);
    setHasUnsavedChanges(true);
  }, [activeSection]);

  const handleSectionClick = useCallback((section: Section) => {
    // Deactivate all sections first
    setSections(prev => prev.map(s => ({ ...s, isActive: false })));
    
    // Activate the clicked section
    const updatedSection = { ...section, isActive: true };
    setSections(prev => prev.map(s => s.id === section.id ? updatedSection : s));
    setActiveSection(updatedSection);
  }, []);

  const handleAddCustomSection = useCallback((name: string, content: string) => {
    const newSection: Section = {
      id: Date.now().toString(),
      name,
      content,
      isActive: true,
      isCustom: true,
      order: sections.length
    };

    // Deactivate all sections and add new one
    setSections(prev => [
      ...prev.map(s => ({ ...s, isActive: false })),
      newSection
    ]);
    setActiveSection(newSection);
  }, [sections.length]);

  const handleRemoveSection = useCallback((sectionId: string) => {
    setSections(prev => {
      const newSections = prev.filter(s => s.id !== sectionId);
      
      // If we removed the active section, activate the first available section
      const removedSection = prev.find(s => s.id === sectionId);
      if (removedSection?.isActive && newSections.length > 0) {
        const firstSection = newSections[0];
        if (firstSection) {
          firstSection.isActive = true;
          setActiveSection(firstSection);
        }
      } else if (newSections.length === 0) {
        setActiveSection(null);
      }
      
      // Reorder sections
      return newSections.map((section, index) => ({ ...section, order: index }));
    });
  }, []);

  const handleResetSections = useCallback(() => {
    const defaultSection: Section = {
      id: '1',
      name: 'Title and Description',
      content: `# ${project?.name || 'Project Title'}\n\nBrief description of what this project does and who it's for.\n\n## Description\n\nDetailed description of your project.`,
      isActive: true,
      order: 0
    };
    setSections([defaultSection]);
    setActiveSection(defaultSection);
  }, [project]);

  const downloadMarkdown = () => {
    if (!fullContent.trim()) {
      toast.error('No content to download', {
        description: 'Add some content to your documentation first'
      });
      return;
    }

    try {
      const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const filename = `${project?.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'readme'}.md`;
      
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('README.md downloaded', {
        description: `File saved as ${filename}`,
        icon: <Download className="h-4 w-4" />
      });
    } catch (error) {
      toast.error('Download failed', {
        description: 'There was an error downloading your file',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
  };

  const createShareLink = async () => {
    // Save project first to ensure latest content is available
    void saveProject(false);
    
    // Prefer short token mapping for friendly URLs; keep stateless token as fallback key if needed
    const generateShortToken = (length = 10) => {
      const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let out = '';
      const cryptoObj = window.crypto || (window as any).msCrypto;
      const bytes = new Uint8Array(length);
      cryptoObj.getRandomValues(bytes);
      for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
      return out;
    };
    const base64urlEncode = (input: string) =>
      btoa(unescape(encodeURIComponent(input)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/,'');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(shareExpiryDays));

    const linkData = {
      projectId,
      accessType: shareAccessType,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      projectName: project?.name || 'Unknown Project'
    };

    // Create a short token and store mapping server-side
    let shortToken = (customAlias || '').trim();
    if (shortToken) {
      // Validate alias
      shortToken = shortToken.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      if (shortToken.length < 3) {
        toast.error('Slug too short', { description: 'Use at least 3 characters' });
        return;
      }
      // Check collision
      const existing = await storageService.getSharedLinks();
      if (existing[shortToken]) {
        // Append timestamp to ensure uniqueness rather than rejecting
        const suffix = Date.now().toString(36);
        shortToken = `${shortToken}-${suffix}`;
      }
    } else {
      // Derive from project name; ensure uniqueness by appending time if needed
      const slugify = (s: string) => s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/--+/g, '-');
      const base = project?.name ? slugify(project.name) : '';
      shortToken = base && base.length >= 3 ? base : generateShortToken(8);
      try {
        const existing = await storageService.getSharedLinks();
        if (existing[shortToken]) {
          const suffix = Date.now().toString(36);
          shortToken = `${base}-${suffix}`;
          if (existing[shortToken]) {
            shortToken = `${base}-${Date.now()}`;
          }
        }
      } catch {
        // ignore
      }
    }
    // Best-effort save so the editor can list active links and short links work
    try {
      const allSharedLinks = await storageService.getSharedLinks();
      (allSharedLinks as any)[shortToken] = { ...linkData };
      // Cleanup any older long tokens for same (accessType, expiresAt)
      const isShort = (t: string) => /^[0-9A-Za-z]{8,14}$/.test(t);
      for (const [token, data] of Object.entries(allSharedLinks)) {
        const d = data as any;
        if (
          d.projectId === projectId &&
          d.accessType === linkData.accessType &&
          d.expiresAt === linkData.expiresAt &&
          !isShort(token)
        ) {
          delete (allSharedLinks as any)[token];
        }
      }
      await storageService.saveSharedLinks(allSharedLinks as any);
    } catch {
      // ignore
    }

    const shareUrl = `${window.location.origin}/u/${encodeURIComponent(shortToken)}`;
    setNewlyCreatedLink(shareUrl);
    
    loadShareLinks();
    
    toast.success('Share link created!', {
      description: `Link expires in ${shareExpiryDays} days with ${shareAccessType} access`,
      icon: <ExternalLink className="h-4 w-4" />
    });
  };

  const copyShareLink = (link: string) => {
    try {
      navigator.clipboard.writeText(link);
      setCopiedLinks(new Set([...copiedLinks, link]));
      toast.success('Link copied to clipboard', {
        description: 'You can now share this link'
      });
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const removeShareLink = async (token: string) => {
    const allSharedLinks = await storageService.getSharedLinks();
    delete (allSharedLinks as any)[token];
    await storageService.saveSharedLinks(allSharedLinks as any);
    loadShareLinks();
    toast.success('Share link removed');
  };

  const openShareLink = (url: string) => {
    try {
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to open link');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSaveButtonText = () => {
    if (isSaving) return 'Saving...';
    if (hasUnsavedChanges) return 'Save Changes';
    return 'Saved';
  };

  const getSaveButtonIcon = () => {
    if (isSaving) {
      return <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />;
    }
    if (hasUnsavedChanges) {
      return <Save className="h-4 w-4 mr-2" />;
    }
    return <CheckCircle className="h-4 w-4 mr-2" />;
  };

  const getAutoSaveIndicator = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center text-xs text-blue-600">
            <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Saving...
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center text-xs text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Saved
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-xs text-red-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Save failed
          </div>
        );
      default:
        if (hasUnsavedChanges) {
          return (
            <div className="flex items-center text-xs text-amber-600">
              <Clock className="h-3 w-3 mr-1" />
              Auto-save in 2s
            </div>
          );
        }
        return null;
    }
  };

  // Reset newly created link when modal closes
  const handleShareModalClose = (open: boolean) => {
    setIsShareModalOpen(open);
    if (!open) {
      setNewlyCreatedLink(null);
      setCopiedLinks(new Set());
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCreateProject={() => {}} // Not applicable in editor
        onOpenProject={() => {}} // Not applicable in editor
        projects={[]}
        currentView="editor"
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onCommandPalette={() => setIsCommandPaletteOpen(true)}
        onSave={() => saveProject(true)}
        onDownload={downloadMarkdown}
        onShare={() => setIsShareModalOpen(true)}
        onTogglePreview={() => setIsPreviewVisible(!isPreviewVisible)}
        currentView="editor"
      />

      {/* Header */}
      <div className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-medium">{project.name}</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-muted-foreground">
                    Last saved: {formatDate(lastSaved)}
                  </p>
                  {getAutoSaveIndicator()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMetrics(!showMetrics)}
              title="Toggle document metrics"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommandPaletteOpen(true)}
              title="Command Palette (Ctrl+K)"
            >
              <Command className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => saveProject(true)}
              disabled={isSaving}
              title="Save Project (Ctrl+S)"
            >
              {isSaving ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadMarkdown}
              disabled={!fullContent.trim()}
              title="Download Markdown (Ctrl+E)"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Dialog open={isShareModalOpen} onOpenChange={handleShareModalClose}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" title="Share Project (Ctrl+Shift+S)">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Share Project Documentation</DialogTitle>
                  <DialogDescription>
                    Create secure links to share your documentation with team members and clients
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-auto space-y-6 py-4">
                  {/* Newly Created Link Section */}
                  {newlyCreatedLink && (
                    <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Share Link Created Successfully!</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Input
                            readOnly
                            value={newlyCreatedLink}
                            className="font-mono text-xs bg-background flex-1 min-w-0"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyShareLink(newlyCreatedLink)}
                            className="flex-shrink-0"
                          >
                            {copiedLinks.has(newlyCreatedLink) ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openShareLink(newlyCreatedLink)}
                            className="flex-shrink-0"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          You can now share this link with others. Copy the link or open it in a new tab to test.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Create New Link Section */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="text-sm font-medium mb-3">Create New Share Link</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Access Type</label>
                        <Select value={shareAccessType} onValueChange={(value: 'view' | 'edit') => setShareAccessType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-2" />
                                View Only
                              </div>
                            </SelectItem>
                            <SelectItem value="edit">
                              <div className="flex items-center">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Access
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Expires In</label>
                        <Select value={shareExpiryDays} onValueChange={setShareExpiryDays}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Day</SelectItem>
                            <SelectItem value="7">7 Days</SelectItem>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Custom Alias (optional)</label>
                        <Input
                          placeholder="e.g., my-project-docs"
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value)}
                          className="font-mono text-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          If you provide a custom alias, it will be used in the share URL.
                          Otherwise, a random token will be generated.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-medium">Custom Slug (optional)</label>
                      <div className="grid grid-cols-[auto,1fr] gap-2 items-center">
                        <div className="text-xs text-muted-foreground">/u/</div>
                        <Input
                          placeholder="my-client-review"
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-z0-9-]/gi, '-').toLowerCase())}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">If provided, the link will be /u/your-slug</p>
                    </div>
                    <Button onClick={createShareLink} className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Create Share Link
                    </Button>
                  </div>

                  {/* Existing Links Section */}
                  {shareLinks.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Active Share Links ({shareLinks.length})</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {shareLinks.map((link) => {
                          const isShort = /^[0-9A-Za-z]{8,14}$/.test(link.token);
                          const shareUrl = isShort
                            ? `${window.location.origin}/u/${link.token}`
                            : `${window.location.origin}/u?share=${link.token}`;
                          const isExpired = new Date(link.expiresAt) < new Date();
                          
                          return (
                            <div key={link.token} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg ${isExpired ? 'opacity-50 bg-muted/50' : ''}`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  {link.accessType === 'view' ? (
                                    <Eye className="h-4 w-4 flex-shrink-0" />
                                  ) : (
                                    <Edit className="h-4 w-4 flex-shrink-0" />
                                  )}
                                  <Badge variant={link.accessType === 'view' ? 'secondary' : 'default'} className="text-xs">
                                    {link.accessType === 'view' ? 'View Only' : 'Edit Access'}
                                  </Badge>
                                  {isExpired && (
                                    <Badge variant="destructive" className="text-xs">
                                      Expired
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate font-mono">
                                  {shareUrl}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {isExpired ? 'Expired' : 'Expires'}: {formatDate(link.expiresAt)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                {!isExpired && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyShareLink(shareUrl)}
                                      className="h-8"
                                    >
                                      {copiedLinks.has(shareUrl) ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openShareLink(shareUrl)}
                                      className="h-8"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeShareLink(link.token)}
                                  className="text-destructive hover:text-destructive h-8 px-3"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Share links allow controlled access to your documentation without requiring authentication.
                  </p>
                  <Button variant="outline" onClick={() => setIsShareModalOpen(false)} className="w-full sm:w-auto">
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={() => saveProject(true)}
              disabled={isSaving || !hasUnsavedChanges}
              variant={hasUnsavedChanges ? 'default' : 'outline'}
              title={`Save Project (Ctrl+S) ${hasUnsavedChanges ? '• Unsaved changes' : ''}`}
            >
              {getSaveButtonIcon()}
              {getSaveButtonText()}
            </Button>
          </div>
        </div>
      </div>

      {/* Document Metrics Panel */}
      {showMetrics && (
        <div className="border-b border-border bg-muted/20 px-6 py-3">
          <DocumentMetrics 
            content={fullContent} 
            isVisible={true} 
            showTrends={true}
          />
        </div>
      )}

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0">
          <SectionsPanel
            sections={sections}
            onSectionClick={handleSectionClick}
            onAddCustomSection={handleAddCustomSection}
            onRemoveSection={handleRemoveSection}
            onResetSections={handleResetSections}
          />
        </div>

        <div className={`flex-1 ${isPreviewVisible ? '' : 'border-r border-border'}`}>
          <SyntaxEditor
            content={activeSection?.content || ''}
            onChange={handleContentChange}
            isPreviewMode={isPreviewVisible}
            onTogglePreview={() => setIsPreviewVisible(!isPreviewVisible)}
          />
        </div>

        {isPreviewVisible && (
          <div className="w-1/2 flex-shrink-0">
            <PreviewPanel
              content={fullContent}
              projectName={project.name}
              isVisible={isPreviewVisible}
            />
          </div>
        )}
      </div>
    </div>
  );
}