/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Bold, Italic, Code, Link, List, ListOrdered, Quote, Hash, Image, Eye, EyeOff, Undo, Redo } from 'lucide-react';
import { toast } from 'sonner';

interface SyntaxEditorProps {
  content: string;
  onChange: (content: string) => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
}

export function SyntaxEditor({ content, onChange, isPreviewMode, onTogglePreview }: SyntaxEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<string[]>([content]);
  const historyIndexRef = useRef(0);

  // Update history when content changes
  useEffect(() => {
    const history = historyRef.current;
    const currentIndex = historyIndexRef.current;
    
    // Don't add to history if it's the same as current content
    if (history[currentIndex] !== content) {
      // Remove any future history if we're not at the end
      historyRef.current = [...history.slice(0, currentIndex + 1), content];
      historyIndexRef.current = historyRef.current.length - 1;
      
      // Limit history to last 50 entries
      if (historyRef.current.length > 50) {
        historyRef.current = historyRef.current.slice(-50);
        historyIndexRef.current = historyRef.current.length - 1;
      }
    }
  }, [content]);

  const undo = useCallback(() => {
    const history = historyRef.current;
    const currentIndex = historyIndexRef.current;
    
    if (currentIndex > 0) {
      historyIndexRef.current = currentIndex - 1;
      const historyItem = history[historyIndexRef.current];
      if (historyItem) {
        onChange(historyItem);
        toast.success('Undid last action');
      }
    } else {
      toast.info('Nothing to undo');
    }
  }, [onChange]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    const currentIndex = historyIndexRef.current;
    
    if (currentIndex < history.length - 1) {
      historyIndexRef.current = currentIndex + 1;
      const historyItem = history[historyIndexRef.current];
      if (historyItem) {
        onChange(historyItem);
        toast.success('Redid last action');
      }
    } else {
      toast.info('Nothing to redo');
    }
  }, [onChange]);

  const formatText = useCallback((format: string) => {
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
          replacement = `\`\`\`\n${selectedText || 'code'}\n\`\`\``;
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
    onChange(newContent);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = selectedText ? start + replacement.length : cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);

    toast.success(`Applied ${format} formatting`);
  }, [content, onChange]);

  // Handle content changes with real-time updates
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onChange(newContent);
  }, [onChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when the textarea is focused
      if (e.target !== textareaRef.current) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            formatText('bold');
            break;
          case 'i':
            e.preventDefault();
            formatText('italic');
            break;
          case 'k':
            e.preventDefault();
            formatText('link');
            break;
          case 'e':
            e.preventDefault();
            formatText('code');
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'a':
            // Allow default Ctrl/Cmd+A behavior for selecting all text
            // Don't prevent default here
            break;
          default:
            // Don't prevent other shortcuts
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formatText, undo, redo]);

  const formatButtons = [
    { icon: Hash, action: () => formatText('header'), label: 'Header (##)', shortcut: '' },
    { icon: Bold, action: () => formatText('bold'), label: 'Bold (**)', shortcut: '⌘B' },
    { icon: Italic, action: () => formatText('italic'), label: 'Italic (*)', shortcut: '⌘I' },
    { icon: Code, action: () => formatText('code'), label: 'Code (`)', shortcut: '⌘E' },
    { icon: Link, action: () => formatText('link'), label: 'Link ([]())', shortcut: '⌘K' },
    { icon: Image, action: () => formatText('image'), label: 'Image (![](...))', shortcut: '' },
    { icon: List, action: () => formatText('list'), label: 'Bullet List (-)', shortcut: '' },
    { icon: ListOrdered, action: () => formatText('orderedList'), label: 'Numbered List (1.)', shortcut: '' },
    { icon: Quote, action: () => formatText('quote'), label: 'Quote (>)', shortcut: '' },
  ];

  const insertTable = () => {
    const tableTemplate = `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
`;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const newContent = content.substring(0, start) + tableTemplate + content.substring(start);
      onChange(newContent);
      
      // Position cursor after the table
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tableTemplate.length, start + tableTemplate.length);
      }, 0);
      
      toast.success('Table template inserted');
    }
  };

  const insertHorizontalRule = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const hr = '\n---\n';
      const newContent = content.substring(0, start) + hr + content.substring(start);
      onChange(newContent);
      
      // Position cursor after the HR
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + hr.length, start + hr.length);
      }, 0);
      
      toast.success('Horizontal rule inserted');
    }
  };

  const selectAllText = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.select();
      toast.success('All text selected');
    }
  };

  return (
    <div className="h-full bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Editor</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Markdown
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePreview}
              className="h-7 px-2 text-xs"
            >
              {isPreviewMode ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            className="h-7 w-7 p-0 shrink-0"
            title="Undo (⌘Z)"
          >
            <Undo className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            className="h-7 w-7 p-0 shrink-0"
            title="Redo (⌘⇧Z)"
          >
            <Redo className="h-3 w-3" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Formatting buttons */}
          {formatButtons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={button.action}
              className="h-7 w-7 p-0 shrink-0"
              title={`${button.label} ${button.shortcut}`}
            >
              <button.icon className="h-3 w-3" />
            </Button>
          ))}
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Additional tools */}
          <Button
            variant="ghost"
            size="sm"
            onClick={insertTable}
            className="h-7 px-2 text-xs shrink-0"
            title="Insert Table"
          >
            Table
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertHorizontalRule}
            className="h-7 px-2 text-xs shrink-0"
            title="Insert Horizontal Rule"
          >
            HR
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAllText}
            className="h-7 px-2 text-xs shrink-0"
            title="Select All (⌘A)"
          >
            All
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Write your documentation in Markdown...

Press Ctrl/Cmd + B for bold, Ctrl/Cmd + I for italic, Ctrl/Cmd + K for links...
Press Ctrl/Cmd + A to select all text..."
          className="w-full h-full p-4 bg-slate-900 text-green-400 font-mono text-sm resize-none border-0 outline-none placeholder:text-slate-500"
          style={{
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            lineHeight: '1.5',
            tabSize: 2,
          }}
          spellCheck={false}
          autoFocus
        />
        
        {/* Editor status */}
        <div className="absolute top-4 right-4 opacity-60">
          <Badge variant="outline" className="text-xs bg-slate-800 text-slate-300 border-slate-600">
            Live Editor
          </Badge>
        </div>
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex justify-between">
        <span>
          {content.split('\n').length} lines • {content.length} characters
        </span>
        <span>
          ⌘A to select all • Real-time updates
        </span>
      </div>
    </div>
  );
}