import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Resizable } from 're-resizable';
import {
    Bold, Italic, Strikethrough, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, CheckSquare,
    Heading1, Heading2, Heading3,
    Image as ImageIcon, Link as LinkIcon,
    Undo, Redo, X, Sparkles, Wand2, Tag, FileText, Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom Image Node View with Free Positioning
const ResizableImageNode = ({ node, updateAttributes, selected }) => {
    const { src, alt, width, height, x, y } = node.attrs;
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const onResizeStop = (e, direction, ref, d) => {
        updateAttributes({
            width: ref.style.width,
            height: ref.style.height,
        });
    };

    const handleMouseDown = (e) => {
        if (e.target.tagName === 'IMG') {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - (x || 0),
                y: e.clientY - (y || 0)
            });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            updateAttributes({ x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart]);

    return (
        <NodeViewWrapper className="relative inline-block">
            <div
                className={`absolute group transition-all ${selected ? 'ring-2 ring-blue-500' : ''} ${isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab'}`}
                style={{
                    left: `${x || 0}px`,
                    top: `${y || 0}px`,
                    zIndex: isDragging ? 1000 : 10
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={handleMouseDown}
            >
                <Resizable
                    size={{ width: width || 'auto', height: height || 'auto' }}
                    onResizeStop={onResizeStop}
                    enable={{
                        top: true, right: true, bottom: true, left: true,
                        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
                    }}
                    className="relative"
                    handleClasses={{
                        top: "hidden group-hover:block w-full h-2 absolute top-0 left-0 bg-blue-500/30 cursor-ns-resize z-20",
                        right: "hidden group-hover:block w-2 h-full absolute top-0 right-0 bg-blue-500/30 cursor-ew-resize z-20",
                        bottom: "hidden group-hover:block w-full h-2 absolute bottom-0 left-0 bg-blue-500/30 cursor-ns-resize z-20",
                        left: "hidden group-hover:block w-2 h-full absolute top-0 left-0 bg-blue-500/30 cursor-ew-resize z-20",
                        topRight: "hidden group-hover:block w-3 h-3 absolute top-0 right-0 bg-blue-500 cursor-nesw-resize z-30 rounded-bl",
                        bottomRight: "hidden group-hover:block w-3 h-3 absolute bottom-0 right-0 bg-blue-500 cursor-nwse-resize z-30 rounded-tl",
                        bottomLeft: "hidden group-hover:block w-3 h-3 absolute bottom-0 left-0 bg-blue-500 cursor-nesw-resize z-30 rounded-tr",
                        topLeft: "hidden group-hover:block w-3 h-3 absolute top-0 left-0 bg-blue-500 cursor-nwse-resize z-30 rounded-br"
                    }}
                >
                    <img
                        src={src}
                        alt={alt}
                        className="block max-w-full h-auto rounded-md shadow-lg"
                        style={{ width: '100%', height: '100%', pointerEvents: isDragging ? 'none' : 'auto' }}
                        draggable={false}
                    />
                </Resizable>
            </div>
        </NodeViewWrapper>
    );
};

// Custom Image Extension to support resizing and free positioning
const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
            },
            height: {
                default: null,
            },
            x: {
                default: 0,
            },
            y: {
                default: 0,
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageNode);
    },
});

const MenuBar = ({ editor, onAiAction }) => {
    if (!editor) {
        return null;
    }

    const addImage = async () => {
        // ... (same as before)
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const filePath = window.electronAPI.getPathForFile(file);
                if (filePath) {
                    const result = await window.electronAPI.saveImage(filePath);
                    if (result.success) {
                        editor.chain().focus().setImage({ src: `local-resource://${result.filename}` }).run();
                    }
                }
            }
        };
        input.click();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-app-bg-primary sticky top-0 z-10">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <Bold className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <Italic className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <UnderlineIcon className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <Strikethrough className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <Heading1 className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <Heading2 className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <Heading3 className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <List className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={editor.isActive('taskList') ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <CheckSquare className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'bg-app-bg-tertiary text-app-text-primary' : 'text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary'}
            >
                <AlignRight className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={addImage}
                className="text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary"
            >
                <ImageIcon className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* AI Controls */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                    >
                        <Sparkles className="w-4 h-4 mr-1" />
                        AI Tools
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-app-bg-secondary border-border">
                    <DropdownMenuItem onClick={() => onAiAction('fix')} className="text-app-text-primary hover:bg-app-bg-tertiary cursor-pointer">
                        <Wand2 className="w-4 h-4 mr-2 text-purple-500" />
                        Fix & Improve Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAiAction('format')} className="text-app-text-primary hover:bg-app-bg-tertiary cursor-pointer">
                        <Type className="w-4 h-4 mr-2 text-orange-500" />
                        Auto Format
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAiAction('summarize')} className="text-app-text-primary hover:bg-app-bg-tertiary cursor-pointer">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Summarize Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAiAction('tags')} className="text-app-text-primary hover:bg-app-bg-tertiary cursor-pointer">
                        <Tag className="w-4 h-4 mr-2 text-green-500" />
                        Auto Title & Tags
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary"
            >
                <Undo className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="text-app-text-secondary hover:bg-app-bg-tertiary hover:text-app-text-primary"
            >
                <Redo className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default function TipTapEditor({ content, onChange, onSave, onAiAction }) {
    // ... (useEditor config remains the same)
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            CustomImage,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: 'Start writing your note...',
            }),
            Link.configure({
                openOnClick: false,
            }),
            Underline,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-8 py-6 text-app-text-primary',
            },
            handlePaste: (view, event, slice) => {
                const items = event.clipboardData?.items;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                            event.preventDefault();
                            const file = items[i].getAsFile();
                            if (file) {
                                const filePath = window.electronAPI.getPathForFile(file);
                                if (filePath) {
                                    window.electronAPI.saveImage(filePath).then((result) => {
                                        if (result.success) {
                                            const { schema } = view.state;
                                            const { selection } = view.state;
                                            const node = schema.nodes.image.create({ src: `local-resource://${result.filename}` });
                                            const transaction = view.state.tr.insert(selection.from, node);
                                            view.dispatch(transaction);
                                        }
                                    });
                                }
                            }
                            return true;
                        }
                    }
                }
                return false;
            },
            handleDOMEvents: {
                dragover: (view, event) => {
                    event.preventDefault();
                    const editorElement = view.dom;
                    editorElement.classList.add('drag-over');
                    return false;
                },
                dragleave: (view, event) => {
                    const editorElement = view.dom;
                    editorElement.classList.remove('drag-over');
                    return false;
                },
                drop: (view, event) => {
                    const editorElement = view.dom;
                    editorElement.classList.remove('drag-over');
                    return false;
                },
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        event.preventDefault();
                        const filePath = window.electronAPI.getPathForFile(file);
                        if (filePath) {
                            window.electronAPI.saveImage(filePath).then((result) => {
                                if (result.success) {
                                    const { schema } = view.state;
                                    const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                    const node = schema.nodes.image.create({ src: `local-resource://${result.filename}` });
                                    const transaction = view.state.tr.insert(coordinates.pos, node);
                                    view.dispatch(transaction);
                                }
                            });
                        }
                        return true;
                    }
                }
                return false;
            },
        },
    });

    // ... (useEffect remains the same)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="flex flex-col h-full bg-app-bg-secondary">
            <MenuBar editor={editor} onAiAction={onAiAction} />
            <div className="flex-1 overflow-y-auto bg-app-bg-secondary">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
