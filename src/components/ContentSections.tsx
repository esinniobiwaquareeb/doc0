/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, GripVertical, Edit2, Trash2, Hash, Type, List, Code, Image } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ContentBlock {
  id: string;
  type: 'header' | 'paragraph' | 'list' | 'code' | 'image';
  title: string;
  content: string;
  level?: number; // for headers
}

interface ContentSectionsProps {
  onContentChange: (content: string) => void;
  initialContent: string;
}

const BLOCK_TEMPLATES = {
  header: (level: number = 1, title: string = 'New Header') => `${'#'.repeat(level)} ${title}\n\n`,
  paragraph: (_level: number = 1, title: string = 'New Section') => `## ${title}\n\nAdd your content here...\n\n`,
  list: (_level: number = 1, title: string = 'List Items') => `## ${title}\n\n- Item 1\n- Item 2\n- Item 3\n\n`,
  code: (_level: number = 1, title: string = 'Code Example') => `## ${title}\n\n\`\`\`\n// Your code here\n\`\`\`\n\n`,
  image: (_level: number = 1, title: string = 'Image') => `## ${title}\n\n![Image description](image-url)\n\n`
};

interface DraggableBlockProps {
  block: ContentBlock;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (block: ContentBlock) => void;
  onDelete: (id: string) => void;
}

function DraggableBlock({ block, index, moveBlock, onEdit, onDelete }: DraggableBlockProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'block',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveBlock(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const getIcon = () => {
    switch (block.type) {
      case 'header': return <Hash className="h-4 w-4" />;
      case 'paragraph': return <Type className="h-4 w-4" />;
      case 'list': return <List className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`group flex items-center p-3 border rounded-lg cursor-move ${
        isDragging ? 'opacity-50' : 'hover:bg-muted/50'
      }`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground mr-2" />
      <div className="flex items-center space-x-2 flex-1">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{block.title}</p>
          <Badge variant="secondary" className="text-xs">
            {block.type}
          </Badge>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(block)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(block.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function ContentSections({ onContentChange, initialContent }: ContentSectionsProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [newBlockType, setNewBlockType] = useState<ContentBlock['type']>('paragraph');
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockLevel, setNewBlockLevel] = useState(1);

  useEffect(() => {
    parseContentIntoBlocks(initialContent);
  }, [initialContent]);

  useEffect(() => {
    generateContent();
  }, [blocks]);

  const parseContentIntoBlocks = (content: string) => {
    if (!content.trim()) return;

    const lines = content.split('\n');
    const newBlocks: ContentBlock[] = [];
    let currentBlock: Partial<ContentBlock> | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.match(/^#{1,6}\s/)) {
        // Save previous block
        if (currentBlock) {
          newBlocks.push({
            ...currentBlock,
            content: currentContent.join('\n').trim()
          } as ContentBlock);
        }

        // Start new header block
        const level = (line.match(/^#+/) || [''])[0].length;
        const title = line.replace(/^#+\s/, '');
        currentBlock = {
          id: Date.now().toString() + Math.random(),
          type: 'header',
          title,
          level,
        };
        currentContent = [line];
      } else if (line.trim() === '' && currentBlock) {
        currentContent.push(line);
      } else if (currentBlock) {
        currentContent.push(line);
      } else if (line.trim()) {
        // Start new paragraph block
        currentBlock = {
          id: Date.now().toString() + Math.random(),
          type: 'paragraph',
          title: 'Content Block',
        };
        currentContent = [line];
      }
    }

    // Save last block
    if (currentBlock) {
      newBlocks.push({
        ...currentBlock,
        content: currentContent.join('\n').trim()
      } as ContentBlock);
    }

    setBlocks(newBlocks);
  };

  const generateContent = () => {
    const content = blocks.map(block => block.content).join('\n\n');
    onContentChange(content);
  };

  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[dragIndex];
    if (draggedBlock) {
      newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      setBlocks(newBlocks);
    }
  };

  const addBlock = () => {
    if (!newBlockTitle.trim()) return;

    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type: newBlockType,
      title: newBlockTitle,
      content: BLOCK_TEMPLATES[newBlockType](
        newBlockType === 'header' ? newBlockLevel : undefined,
        newBlockTitle
      ),
      ...(newBlockType === 'header' && { level: newBlockLevel })
    };

    setBlocks([...blocks, newBlock]);
    setNewBlockTitle('');
    setNewBlockType('paragraph');
    setNewBlockLevel(1);
    setIsAddModalOpen(false);
  };

  const editBlock = (block: ContentBlock) => {
    setEditingBlock(block);
  };

  const saveEditedBlock = () => {
    if (!editingBlock) return;

    setBlocks(blocks.map(block => 
      block.id === editingBlock.id ? editingBlock : block
    ));
    setEditingBlock(null);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sections</CardTitle>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Section</DialogTitle>
                  <DialogDescription>
                    Create a new content block for your documentation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label>Section Title</label>
                    <Input
                      placeholder="Enter section title"
                      value={newBlockTitle}
                      onChange={(e) => setNewBlockTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Content Type</label>
                    <Select value={newBlockType} onValueChange={(value: ContentBlock['type']) => setNewBlockType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="code">Code Block</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newBlockType === 'header' && (
                    <div className="space-y-2">
                      <label>Header Level</label>
                      <Select value={newBlockLevel.toString()} onValueChange={(value) => setNewBlockLevel(Number(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">H1</SelectItem>
                          <SelectItem value="2">H2</SelectItem>
                          <SelectItem value="3">H3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addBlock}>
                    Add Section
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {blocks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Type className="h-8 w-8 mx-auto mb-2" />
              <p>No sections yet</p>
              <p className="text-sm">Add sections to organize your content</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <DraggableBlock
                key={block.id}
                block={block}
                index={index}
                moveBlock={moveBlock}
                onEdit={editBlock}
                onDelete={deleteBlock}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Block Modal */}
      {editingBlock && (
        <Dialog open={!!editingBlock} onOpenChange={() => setEditingBlock(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>Title</label>
                <Input
                  value={editingBlock.title}
                  onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label>Content</label>
                <textarea
                  className="w-full h-48 p-3 border rounded-lg font-mono text-sm resize-none"
                  value={editingBlock.content}
                  onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingBlock(null)}>
                Cancel
              </Button>
              <Button onClick={saveEditedBlock}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DndProvider>
  );
}