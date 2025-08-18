/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { ArrowLeft, Eye, Edit, Save, FileText, Bold, Italic, Code, Link, List, ListOrdered, Quote, Hash, Image, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownRenderer } from './MarkdownRenderer';
import { storageService } from '@/lib/storage';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  content: string;
  sections?: Section[];
}

interface Section {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  isCustom?: boolean;
  order: number;
}

interface SharedProjectViewProps {
  projectId: string;
  accessType: 'view' | 'edit';
  onBack: () => void;
}

export function SharedProjectView({ projectId, accessType, onBack }: SharedProjectViewProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const projects = await storageService.getProjects();
      const currentProject = projects.find((p: Project) => p.id === projectId);
      
      if (currentProject) {
        setProject(currentProject);
        setContent(currentProject.content);
        setOriginalContent(currentProject.content);
        
        // Load sections if available
        if (currentProject.sections && currentProject.sections.length > 0) {
          const sortedSections = currentProject.sections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setSections(sortedSections);
        }
      } else {
        toast.error('Project not found', {
          description: 'This project may have been deleted or is no longer available.'
        });
      }
    } catch (error) {
      toast.error('Error loading project', {
        description: 'There was an error loading the project data.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = useCallback(async () => {
    if (!project || accessType !== 'edit') return;

    try {
      const projects = await storageService.getProjects();
      const now = new Date().toISOString();
      
      const updatedProject = {
        ...project,
        content,
        lastModified: now
      };

      const updatedProjects = projects.map((p: Project) => 
        p.id === projectId ? updatedProject : p
      );

      await storageService.saveProjects(updatedProjects);
      setProject(updatedProject);
      setOriginalContent(content);
      
      toast.success('Changes saved successfully', {
        description: 'Your changes have been saved to the project',
        icon: <CheckCircle className="h-4 w-4" />
      });
    } catch (error) {
      toast.error('Failed to save changes', {
        description: 'There was an error saving your changes. Please try again.',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
  }, [project, projectId, content, accessType]);

  const handleFormat = useCallback((format: string) => {
    if (accessType !== 'edit') return;
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let replacement = '';
    let cursorOffset = 0;

    switch (format) {
      case 'header':
        replacement = selectedText ? `## ${selectedText}` : '## Header';
        cursorOffset = replacement.length;
        break;
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? replacement.length : start + 2;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? replacement.length : start + 1;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          replacement = `\"\"\"\n${selectedText || 'code'}\n\"\"\"`;
          cursorOffset = selectedText ? replacement.length : start + 4;
        } else {
          replacement = `\`${selectedText || 'code'}\``;
          cursorOffset = selectedText ? replacement.length : start + 1;
        }
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`;
        cursorOffset = selectedText ? start + selectedText.length + 3 : start + 11;
        break;
      case 'image':
        replacement = `![${selectedText || 'alt text'}](image-url)`;
        cursorOffset = selectedText ? start + selectedText.length + 4 : start + 12;
        break;
      case 'list':
        if (selectedText) {
          replacement = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        } else {
          replacement = '- List item';
        }
        cursorOffset = replacement.length;
        break;
      case 'orderedList':
        if (selectedText) {
          replacement = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        } else {
          replacement = '1. List item';
        }
        cursorOffset = replacement.length;
        break;
      case 'quote':
        if (selectedText) {
          replacement = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        } else {
          replacement = '> Quote';
        }
        cursorOffset = replacement.length;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = selectedText ? start + replacement.length : cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);

    toast.success(`Applied ${format} formatting`);
  }, [content, accessType]);

  const downloadDocument = () => {
    if (!content.trim()) {
      toast.error('No content to download');
      return;
    }

    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const filename = `${project?.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'shared-document'}.md`;
      
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('Document downloaded', {
        description: `File saved as ${filename}`,
        icon: <Download className="h-4 w-4" />
      });
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const formatButtons = [
    { icon: Hash, action: () => handleFormat('header'), label: 'Header' },
    { icon: Bold, action: () => handleFormat('bold'), label: 'Bold' },
    { icon: Italic, action: () => handleFormat('italic'), label: 'Italic' },
    { icon: Code, action: () => handleFormat('code'), label: 'Code' },
    { icon: Link, action: () => handleFormat('link'), label: 'Link' },
    { icon: Image, action: () => handleFormat('image'), label: 'Image' },
    { icon: List, action: () => handleFormat('list'), label: 'List' },
    { icon: ListOrdered, action: () => handleFormat('orderedList'), label: 'Numbered List' },
    { icon: Quote, action: () => handleFormat('quote'), label: 'Quote' },
  ];

  const hasUnsavedChanges = content !== originalContent;
  const hasHeaders = /^#{1,3}\s+/m.test(content);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared document...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <CardContent className="pt-6">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Document Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This document may have been deleted or the share link has expired.
            </p>
            <Button onClick={onBack}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-medium">{project.name}</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant={accessType === 'view' ? 'secondary' : 'default'}>
                      {accessType === 'view' ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          View Only
                        </>
                      ) : (
                        <>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Access
                        </>
                      )}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Shared by Doc0
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadDocument}
                disabled={!content.trim()}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {accessType === 'edit' && (
                <Button 
                  onClick={saveProject} 
                  disabled={!hasUnsavedChanges}
                  variant={hasUnsavedChanges ? 'default' : 'outline'}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {accessType === 'view' ? (
          // View-only mode
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documentation</CardTitle>
                  {project.description && (
                    <p className="text-muted-foreground mt-1">{project.description}</p>
                  )}
                </div>
                {hasHeaders && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowToc(!showToc)}
                  >
                    <List className="h-4 w-4 mr-2" />
                    {showToc ? 'Hide' : 'Show'} Contents
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[calc(100vh-300px)]">
                <div className="p-6 border rounded-lg bg-muted/30">
                  {content ? (
                    <MarkdownRenderer 
                      content={content} 
                      showTableOfContents={showToc}
                    />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No content available.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          // Edit mode with three-panel layout
          <div className="h-[calc(100vh-200px)] grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Panel */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Editor</CardTitle>
                    {hasUnsavedChanges && (
                      <Badge variant="outline" className="text-xs text-orange-600">
                        Unsaved changes
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                {/* Toolbar */}
                <div className="px-6 pb-2">
                  <div className="flex items-center space-x-1 p-2 border rounded-lg bg-muted/30">
                    {formatButtons.slice(0, 4).map((button) => (
                      <Button
                        key={button.label}
                        variant="ghost"
                        size="sm"
                        onClick={button.action}
                        className="h-8 w-8 p-0"
                        title={button.label}
                      >
                        <button.icon className="h-4 w-4" />
                      </Button>
                    ))}
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    {formatButtons.slice(4, 6).map((button) => (
                      <Button
                        key={button.label}
                        variant="ghost"
                        size="sm"
                        onClick={button.action}
                        className="h-8 w-8 p-0"
                        title={button.label}
                      >
                        <button.icon className="h-4 w-4" />
                      </Button>
                    ))}
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    {formatButtons.slice(6).map((button) => (
                      <Button
                        key={button.label}
                        variant="ghost"
                        size="sm"
                        onClick={button.action}
                        className="h-8 w-8 p-0"
                        title={button.label}
                      >
                        <button.icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                <CardContent className="flex-1 p-0">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your documentation in Markdown..."
                    className="w-full h-full p-4 bg-slate-900 text-green-400 font-mono text-sm resize-none border-0 outline-none placeholder:text-slate-500"
                    style={{
                      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                      lineHeight: '1.5',
                    }}
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Preview</CardTitle>
                    {hasHeaders && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowToc(!showToc)}
                      >
                        <List className="h-4 w-4 mr-1" />
                        TOC
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      {content ? (
                        <MarkdownRenderer 
                          content={content} 
                          showTableOfContents={showToc}
                        />
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <p>Start writing to see preview...</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Powered by Doc0 Documentation Platform</p>
            <p className="mt-1">
              Last modified: {new Date(project.lastModified).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} • Smooth anchor navigation enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}