/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Eye, Copy, ExternalLink, Download, CheckCircle, AlertCircle, Zap, List } from 'lucide-react';
import { toast } from 'sonner';

interface PreviewPanelProps {
  content: string;
  projectName: string;
  isVisible: boolean;
}

export function PreviewPanel({ content, projectName, isVisible }: PreviewPanelProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [showToc, setShowToc] = useState(false);

  // Update timestamp when content changes to show real-time updates
  useEffect(() => {
    if (content) {
      setLastUpdateTime(new Date().toLocaleTimeString());
    }
  }, [content]);

  // Check if content has headers for TOC
  const hasHeaders = /^#{1,3}\s+/m.test(content);

  const copyContent = async () => {
    if (!content.trim()) {
      toast.error('No content to copy', {
        description: 'Add some content to your documentation first'
      });
      return;
    }

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard', {
        description: 'You can now paste it anywhere',
        icon: <CheckCircle className="h-4 w-4" />
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast.success('Content copied to clipboard', {
        description: 'You can now paste it anywhere',
        icon: <CheckCircle className="h-4 w-4" />
      });
    } finally {
      setIsCopying(false);
    }
  };

  const downloadMarkdown = () => {
    if (!content.trim()) {
      toast.error('No content to download', {
        description: 'Add some content to your documentation first'
      });
      return;
    }

    setIsDownloading(true);
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-readme.md`;
      
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
    } finally {
      setIsDownloading(false);
    }
  };

  const openInNewWindow = () => {
    if (!content.trim()) {
      toast.error('No content to preview', {
        description: 'Add some content to your documentation first'
      });
      return;
    }

    const newWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
    if (newWindow) {
      // Convert markdown to basic HTML for the new window
      let html = content;
      
      // Headers with IDs for anchor links
      html = html.replace(/^### (.*$)/gm, (match, headerText) => {
        const id = headerText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        return `<h3 id="${id}">${headerText}</h3>`;
      });
      html = html.replace(/^## (.*$)/gm, (match, headerText) => {
        const id = headerText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        return `<h2 id="${id}">${headerText}</h2>`;
      });
      html = html.replace(/^# (.*$)/gm, (match, headerText) => {
        const id = headerText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        return `<h1 id="${id}">${headerText}</h1>`;
      });
      
      // Code blocks
      html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
      
      // Bold and italic
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Links - handle anchor links properly
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        if (url.startsWith('#')) {
          return `<a href="${url}" onclick="document.getElementById('${url.substring(1)}')?.scrollIntoView({behavior: 'smooth'}); return false;">${linkText}</a>`;
        } else {
          return `<a href="${url}" target="_blank">${linkText}</a>`;
        }
      });
      
      // Lists
      html = html.replace(/^[*-] (.+)$/g, '<li>$1</li>');
      html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
      
      // Paragraphs
      html = html.replace(/\n\n/g, '</p><p>');
      html = '<p>' + html + '</p>';
      html = html.replace(/<p><\/p>/g, '');

      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${projectName} - README Preview</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              max-width: 900px;
              margin: 0 auto;
              padding: 2rem;
              color: #333;
              background: #fff;
              scroll-behavior: smooth;
            }
            h1 { 
              color: #2d3748; 
              border-bottom: 2px solid #e2e8f0; 
              padding-bottom: 0.5rem; 
              margin-top: 2rem;
              margin-bottom: 1rem;
              scroll-margin-top: 1rem;
            }
            h2 { 
              color: #2d3748; 
              border-bottom: 1px solid #e2e8f0; 
              padding-bottom: 0.3rem; 
              margin-top: 1.5rem;
              margin-bottom: 0.8rem;
              scroll-margin-top: 1rem;
            }
            h3 { 
              color: #4a5568; 
              margin-top: 1.2rem;
              margin-bottom: 0.6rem;
              scroll-margin-top: 1rem;
            }
            code { 
              background: #f7fafc; 
              padding: 0.2rem 0.4rem; 
              border-radius: 3px; 
              font-size: 0.9em; 
              font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
            }
            pre { 
              background: #f7fafc; 
              padding: 1rem; 
              border-radius: 6px; 
              overflow-x: auto; 
              margin: 1rem 0;
            }
            pre code {
              background: none;
              padding: 0;
            }
            blockquote { 
              border-left: 4px solid #cbd5e0; 
              padding-left: 1rem; 
              margin: 1rem 0; 
              font-style: italic; 
              color: #718096; 
            }
            a { 
              color: #3182ce; 
              text-decoration: none;
              cursor: pointer;
            }
            a:hover { 
              text-decoration: underline; 
            }
            ul, ol { 
              padding-left: 2rem; 
              margin: 1rem 0;
            }
            li { 
              margin: 0.3rem 0; 
            }
            p {
              margin: 1rem 0;
            }
            .header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid #e2e8f0;
              padding: 1rem 2rem;
              z-index: 1000;
            }
            .content {
              margin-top: 80px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h4 style="margin: 0; color: #4a5568;">📄 ${projectName} - README Preview</h4>
          </div>
          <div class="content">
            ${html}
          </div>
        </body>
        </html>
      `);
      newWindow.document.close();
      
      toast.success('Preview opened in new window', {
        description: 'Your documentation is now displayed in a new tab with working anchor links'
      });
    } else {
      toast.error('Failed to open preview', {
        description: 'Please check if popups are blocked',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Preview</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Real-time
            </Badge>
            {hasHeaders && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowToc(!showToc)}
                className="h-7 px-2 text-xs"
                title="Toggle Table of Contents"
              >
                <List className="h-3 w-3 mr-1" />
                TOC
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyContent}
              disabled={isCopying || !content.trim()}
              className="h-7 px-2 text-xs"
            >
              {isCopying ? (
                <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {isCopying ? 'Copying...' : 'Copy'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadMarkdown}
              disabled={isDownloading || !content.trim()}
              className="h-7 px-2 text-xs"
            >
              {isDownloading ? (
                <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewWindow}
              disabled={!content.trim()}
              className="h-7 px-2 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content - Fixed scrolling area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {content.trim() ? (
              <div className="max-w-none">
                <MarkdownRenderer 
                  content={content} 
                  showTableOfContents={showToc}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Start writing to see preview...</p>
                <p className="text-xs mt-1">Your markdown will be rendered here in real-time</p>
                <p className="text-xs mt-2 text-primary">Press Ctrl/Cmd+A in editor to select all text</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex-shrink-0">
        {content.trim() ? (
          <div className="flex justify-between items-center">
            <span>
              Rendered from {content.split('\n').length} lines • {content.length} characters
              {hasHeaders && ' • Navigation enabled'}
            </span>
            {lastUpdateTime && (
              <span className="text-green-600">
                Last updated: {lastUpdateTime}
              </span>
            )}
          </div>
        ) : (
          'Ready to render your markdown in real-time with smooth anchor navigation'
        )}
      </div>
    </div>
  );
}