/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { List, X, ChevronRight } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  showTableOfContents?: boolean;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function MarkdownRenderer({ content, showTableOfContents = false }: MarkdownRendererProps) {
  const [showToc, setShowToc] = useState(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  useEffect(() => {
    // Add click event listener for smooth scrolling to anchor links
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if the clicked element is an anchor link
      if (target.tagName === 'A') {
        const anchor = target as HTMLAnchorElement;
        const href = anchor.getAttribute('href');
        
        // Check if it's an internal anchor link (starts with #)
        if (href && href.startsWith('#')) {
          event.preventDefault();
          
          // Get the target element by ID (remove the # from href)
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            // Smooth scroll to the target element
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
            
            // Update URL without triggering navigation
            if (window.history.replaceState) {
              const newUrl = `${window.location.pathname}${window.location.search}${href}`;
              window.history.replaceState(null, '', newUrl);
            }
          }
        }
      }
    };

    // Add event listener to document
    document.addEventListener('click', handleLinkClick);
    
    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  useEffect(() => {
    // Extract table of contents from content
    if (showTableOfContents && content) {
      const toc: TocItem[] = [];
      const headerRegex = /^(#{1,6})\s+(.*$)/gm;
      let match;

      while ((match = headerRegex.exec(content)) !== null) {
        if (match[1] && match[2]) {
          const level = match[1].length;
          const text = match[2].trim();
          const id = generateId(text);
          toc.push({ id, text, level });
        }
      }

      setTocItems(toc);
    }
  }, [content, showTableOfContents]);

  const generateId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      setShowToc(false); // Close TOC on mobile after clicking
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return '';
    
    let html = text;

    // Headers (process in order from h6 to h1 to avoid conflicts)
    // Add IDs to headers for anchor linking
    html = html.replace(/^###### (.*$)/gm, (match, headerText) => {
      const id = generateId(headerText);
      return `<h6 id="${id}" class="text-sm font-medium mt-4 mb-2 pb-1 border-b border-border/50 scroll-mt-4">${headerText}</h6>`;
    });
    
    html = html.replace(/^##### (.*$)/gm, (match, headerText) => {
      const id = generateId(headerText);
      return `<h5 id="${id}" class="text-base font-medium mt-5 mb-2 pb-1 border-b border-border/50 scroll-mt-4">${headerText}</h5>`;
    });
    
    html = html.replace(/^#### (.*$)/gm, (match, headerText) => {
      const id = generateId(headerText);
      return `<h4 id="${id}" class="text-base font-medium mt-6 mb-3 pb-2 border-b border-border scroll-mt-4">${headerText}</h4>`;
    });
    
    html = html.replace(/^### (.*$)/gm, (match, headerText) => {
      const id = generateId(headerText);
      return `<h3 id="${id}" class="text-lg font-medium mt-6 mb-3 pb-2 border-b border-border scroll-mt-4">${headerText}</h3>`;
    });
    
    html = html.replace(/^## (.*$)/gm, (match, headerText) => {
      const id = generateId(headerText);
      return `<h2 id="${id}" class="text-xl font-medium mt-8 mb-4 pb-2 border-b border-border scroll-mt-4">${headerText}</h2>`;
    });
    
    html = html.replace(/^# (.*$)/gm, (match, headerText) => {
      const id = generateId(headerText);
      return `<h1 id="${id}" class="text-2xl font-medium mt-8 mb-6 pb-3 border-b border-border scroll-mt-4">${headerText}</h1>`;
    });

    // Code blocks (process before inline code)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>');

    // Bold and Italic (process bold first to avoid conflicts)
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-semibold"><em class="italic">$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Links - handle internal anchor links differently from external links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      if (url.startsWith('#')) {
        // Internal anchor link - no target="_blank"
        return `<a href="${url}" class="text-primary underline hover:no-underline cursor-pointer transition-colors">${linkText}</a>`;
      } else if (url.startsWith('http') || url.startsWith('//')) {
        // External link - open in new tab
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:no-underline transition-colors">${linkText}</a>`;
      } else {
        // Relative or other links - handle normally
        return `<a href="${url}" class="text-primary underline hover:no-underline transition-colors">${linkText}</a>`;
      }
    });

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4 shadow-sm" />');

    // Unordered lists
    html = html.replace(/^\* (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>');
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>');
    
    // Wrap consecutive list items
    html = html.replace(/(<li class="ml-4 mb-1[^"]*">.*?<\/li>\s*)+/g, '<ul class="my-4 space-y-1">$&</ul>');
    html = html.replace(/(<li class="ml-4 mb-1 list-decimal">.*?<\/li>\s*)+/g, '<ol class="my-4 space-y-1 list-decimal ml-6">$&</ol>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="border-t border-border my-8" />');
    html = html.replace(/^\*\*\*$/gm, '<hr class="border-t border-border my-8" />');

    // Paragraphs (handle line breaks and double line breaks)
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    html = html.replace(/([^>])\n([^<])/g, '$1<br />$2');
    
    // Wrap in initial paragraph if content doesn't start with a block element
    if (html && !html.match(/^<(h[1-6]|div|p|ul|ol|blockquote|pre|hr)/)) {
      html = '<p class="mb-4">' + html + '</p>';
    }

    // Clean up empty paragraphs and extra spaces
    html = html.replace(/<p class="mb-4"><\/p>/g, '');
    html = html.replace(/\s+/g, ' ');

    return html;
  };

  return (
    <div className="relative">
      {/* Table of Contents Button */}
      {showTableOfContents && tocItems.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowToc(!showToc)}
            className="shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            {showToc ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
            {!showToc && <span className="ml-2 hidden sm:inline">Contents</span>}
          </Button>
        </div>
      )}

      {/* Table of Contents Panel */}
      {showTableOfContents && showToc && (
        <div className="fixed top-16 right-4 w-64 max-h-96 z-40 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/30">
            <h4 className="text-sm font-medium">Table of Contents</h4>
          </div>
          <ScrollArea className="max-h-80">
            <div className="p-2">
              {tocItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors hover:bg-muted/50 flex items-start ${
                    item.level === 1 ? 'font-medium' : 
                    item.level === 2 ? 'ml-2 text-muted-foreground' : 
                    'ml-4 text-muted-foreground/80'
                  }`}
                >
                  <ChevronRight className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0 opacity-50" />
                  <span className="line-clamp-2">{item.text}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Rendered Content */}
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        style={{
          lineHeight: '1.6',
          color: 'inherit'
        }}
      />
    </div>
  );
}