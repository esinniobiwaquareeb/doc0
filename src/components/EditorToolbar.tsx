/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Bold, Italic, Code, Link, List, ListOrdered, Quote, Hash, Image, Undo, Redo } from 'lucide-react';

interface EditorToolbarProps {
  onFormat: (format: string, value?: string) => void;
}

export function EditorToolbar({ onFormat }: EditorToolbarProps) {
  const formatButtons = [
    {
      icon: Hash,
      label: 'Header',
      action: () => onFormat('header')
    },
    {
      icon: Bold,
      label: 'Bold',
      action: () => onFormat('bold')
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => onFormat('italic')
    },
    {
      icon: Code,
      label: 'Inline Code',
      action: () => onFormat('code')
    },
    {
      icon: Link,
      label: 'Link',
      action: () => onFormat('link')
    },
    {
      icon: Image,
      label: 'Image',
      action: () => onFormat('image')
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => onFormat('list')
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => onFormat('orderedList')
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => onFormat('quote')
    }
  ];

  return (
    <div className="flex items-center space-x-1 p-2 border-b bg-muted/30">
      <div className="flex items-center space-x-1">
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
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center space-x-1">
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
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center space-x-1">
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
  );
}