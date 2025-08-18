/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Search, Plus, RotateCcw, FileText, Users, Tag, Palette, Code, Zap, BookOpen, Shield, Gift, GripVertical, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Section {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  isCustom?: boolean;
  order: number;
}

interface SectionsPanelProps {
  sections: Section[];
  onSectionClick: (section: Section) => void;
  onAddCustomSection: (name: string, content: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onResetSections: () => void;
}

const TEMPLATE_SECTIONS = [
  {
    name: 'Title and Description',
    icon: FileText,
    content: `# Project Title

Brief description of what this project does and who it's for.

## Description

Detailed description of your project. Explain what it does, why it exists, and what problems it solves.
`
  },
  {
    name: 'Installation',
    icon: Code,
    content: `## Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Install

\`\`\`bash
npm install project-name
\`\`\`

or

\`\`\`bash
yarn add project-name
\`\`\`
`
  },
  {
    name: 'Usage',
    icon: Zap,
    content: `## Usage

Basic usage example:

\`\`\`javascript
import { Component } from 'project-name';

const example = new Component();
example.run();
\`\`\`

### Advanced Usage

More complex examples and configurations.
`
  },
  {
    name: 'API Reference',
    icon: BookOpen,
    content: `## API Reference

### Methods

#### \`method(param)\`

Description of the method.

**Parameters:**
- \`param\` (string): Description of the parameter

**Returns:**
- (boolean): Description of the return value

**Example:**
\`\`\`javascript
const result = method('example');
\`\`\`
`
  },
  {
    name: 'Contributing',
    icon: Users,
    content: `## Contributing

Contributions are always welcome!

See \`contributing.md\` for ways to get started.

Please adhere to this project's \`code of conduct\`.

### Guidelines

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request
`
  },
  {
    name: 'License',
    icon: Shield,
    content: `## License

[MIT](https://choosealicense.com/licenses/mit/)

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction.
`
  },
  {
    name: 'Acknowledgements',
    icon: Gift,
    content: `## Acknowledgements

 - [Awesome Readme Templates](https://awesomeopensource.com/project/elangosundar/awesome-README-templates)
 - [Awesome README](https://github.com/matiassingers/awesome-readme)
 - [How to write a Good readme](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)
`
  }
];

const ADDITIONAL_SECTIONS = [
  'Authors',
  'Badges', 
  'Color Reference',
  'Demo',
  'Deployment',
  'Environment Variables',
  'FAQ',
  'Features',
  'Feedback',
  'Lessons Learned',
  'Optimizations',
  'Related',
  'Roadmap',
  'Run Locally',
  'Screenshots',
  'Support',
  'Tech Stack',
  'Tests'
];

export function SectionsPanel({ sections, onSectionClick, onAddCustomSection, onRemoveSection, onResetSections }: SectionsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customSectionName, setCustomSectionName] = useState('');
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  const filteredTemplateSections = TEMPLATE_SECTIONS.filter(section =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdditionalSections = ADDITIONAL_SECTIONS.filter(section =>
    section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateClick = (template: typeof TEMPLATE_SECTIONS[0]) => {
    const existingSection = sections.find(s => s.name === template.name);
    if (existingSection) {
      onSectionClick(existingSection);
      toast.success(`Switched to ${template.name} section`);
    } else {
      onAddCustomSection(template.name, template.content);
      toast.success(`Added ${template.name} section`, {
        description: 'Section ready for editing'
      });
    }
  };

  const handleAdditionalSectionClick = (sectionName: string) => {
    const existingSection = sections.find(s => s.name === sectionName);
    if (existingSection) {
      onSectionClick(existingSection);
      toast.success(`Switched to ${sectionName} section`);
    } else {
      const content = `## ${sectionName}\n\nAdd your ${sectionName.toLowerCase()} content here...`;
      onAddCustomSection(sectionName, content);
      toast.success(`Added ${sectionName} section`, {
        description: 'Section ready for editing'
      });
    }
  };

  const handleCustomSectionSubmit = () => {
    if (!customSectionName.trim()) {
      toast.error('Please enter a section name');
      return;
    }

    const existingSection = sections.find(s => s.name.toLowerCase() === customSectionName.toLowerCase());
    if (existingSection) {
      toast.error('Section with this name already exists', {
        description: 'Please choose a different name'
      });
      return;
    }

    const content = `## ${customSectionName}\n\nAdd your content here...`;
    onAddCustomSection(customSectionName, content);
    setCustomSectionName('');
    setIsCustomModalOpen(false);
    toast.success(`Added custom section: ${customSectionName}`, {
      description: 'Section ready for editing'
    });
  };

  const handleReset = () => {
    if (sections.length === 0) {
      toast.info('No sections to reset');
      return;
    }

    onResetSections();
    toast.success('Sections reset to default', {
      description: 'Started with a fresh Title and Description section'
    });
  };

  const handleRemoveSection = (section: Section) => {
    if (sections.length === 1) {
      toast.error('Cannot remove the last section', {
        description: 'You need at least one section in your documentation'
      });
      return;
    }

    onRemoveSection(section.id);
    setSectionToDelete(null);
    toast.success(`Removed "${section.name}" section`, {
      description: 'Section has been permanently deleted'
    });
  };

  const copySection = async (section: Section) => {
    try {
      await navigator.clipboard.writeText(section.content);
      toast.success(`Copied ${section.name} content`, {
        description: 'Content copied to clipboard'
      });
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const duplicateSection = (section: Section) => {
    const newName = `${section.name} (Copy)`;
    const existingCopies = sections.filter(s => s.name.startsWith(newName));
    const finalName = existingCopies.length > 0 ? `${newName} ${existingCopies.length + 1}` : newName;
    
    onAddCustomSection(finalName, section.content);
    toast.success(`Duplicated section as "${finalName}"`, {
      description: 'Section ready for editing'
    });
  };

  return (
    <div className="h-full bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Sections</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 w-7 p-0"
            title="Reset sections"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Click on a section below to edit the contents
        </p>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search for a section"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </div>

      {/* Sections List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Active Sections */}
          {sections.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground py-1">Current Sections ({sections.length})</div>
              {sections.map((section) => (
                <div key={section.id} className="group">
                  <div
                    className={`w-full text-left p-2 rounded-md text-xs transition-colors relative ${
                      section.isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <button
                      onClick={() => onSectionClick(section)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between pr-16">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="flex-1 truncate">{section.name}</span>
                        </div>
                        {section.isCustom && (
                          <Badge variant="outline" className="text-xs h-4 px-1">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </button>
                    
                    {/* Action buttons */}
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copySection(section);
                          }}
                          className="h-5 w-5 p-0"
                          title="Copy content"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSection(section);
                          }}
                          className="h-5 w-5 p-0"
                          title="Duplicate section"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        {sections.length > 1 && (
                          <AlertDialog open={sectionToDelete?.id === section.id} onOpenChange={(open) => !open && setSectionToDelete(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSectionToDelete(section);
                                }}
                                className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                                title="Remove section"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center">
                                  <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                                  Remove Section
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove the &quot;{section.name}&quot; section? This action cannot be undone and all content in this section will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRemoveSection(section)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove Section
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Template Sections */}
          {filteredTemplateSections.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground py-2">
                {sections.length > 0 ? 'Add Section' : 'Choose a Template'}
              </div>
              {filteredTemplateSections.map((section) => {
                const IconComponent = section.icon;
                const isAlreadyAdded = sections.some(s => s.name === section.name);
                return (
                  <button
                    key={section.name}
                    onClick={() => handleTemplateClick(section)}
                    disabled={isAlreadyAdded}
                    className={`w-full text-left p-2 rounded-md text-xs transition-colors ${
                      isAlreadyAdded 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-muted/50 hover:border hover:border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-3 w-3 text-muted-foreground" />
                      <span className="flex-1 truncate">{section.name}</span>
                      {isAlreadyAdded && (
                        <Badge variant="secondary" className="text-xs h-4 px-1">
                          Added
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom Section Button */}
          <div className="pt-2">
            <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs justify-start"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Custom Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Section</DialogTitle>
                  <DialogDescription>
                    Create a custom section for your documentation
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Section name (e.g., 'Performance', 'Architecture')"
                    value={customSectionName}
                    onChange={(e) => setCustomSectionName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomSectionSubmit()}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCustomModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCustomSectionSubmit} disabled={!customSectionName.trim()}>
                    Add Section
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Additional Sections */}
          {filteredAdditionalSections.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground py-2">Quick Add</div>
              {filteredAdditionalSections.map((sectionName) => {
                const isAlreadyAdded = sections.some(s => s.name === sectionName);
                return (
                  <button
                    key={sectionName}
                    onClick={() => handleAdditionalSectionClick(sectionName)}
                    disabled={isAlreadyAdded}
                    className={`w-full text-left p-2 rounded-md text-xs transition-colors ${
                      isAlreadyAdded 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1 truncate">{sectionName}</span>
                      {isAlreadyAdded && (
                        <Badge variant="secondary" className="text-xs h-4 px-1">
                          Added
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer tips */}
          {sections.length > 0 && (
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Hover over sections to see action buttons
              </p>
              <p className="text-xs text-muted-foreground">
                🗑️ <strong>Remove:</strong> Click the trash icon to delete sections
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}