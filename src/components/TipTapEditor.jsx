import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Custom Image Node View with Draggable Positioning
const ResizableImageNode = ({ node, updateAttributes, selected }) => {
    const { src, alt, width, height, marginLeft, marginTop } = node.attrs;
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const onResizeStop = (e, direction, ref, d) => {
        updateAttributes({
            width: ref.style.width,
            height: ref.style.height,
        });
    };

    const handleDragStart = (e) => {
        // Only start drag if clicking on the image itself, not resize handles
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
            setDragStart({
                x: e.clientX,
                y: e.clientY
            });
            setDragOffset({ x: 0, y: 0 });
        }
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            // Use CSS transform for smooth dragging without re-renders
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            setDragOffset({ x: deltaX, y: deltaY });
        };

        const handleMouseUp = (e) => {
            // Only update attributes once at the end
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;

            updateAttributes({
                marginLeft: (marginLeft || 0) + deltaX,
                marginTop: (marginTop || 0) + deltaY
            });

            setIsDragging(false);
            setDragOffset({ x: 0, y: 0 });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, marginLeft, marginTop, updateAttributes]);

    return (
        <NodeViewWrapper className="inline-block my-4">
            <div
                ref={containerRef}
                className={`inline-block group transition-all ${selected ? 'ring-2 ring-blue-400' : ''} ${isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab'}`}
                style={{
                    marginLeft: `${marginLeft || 0}px`,
                    marginTop: `${marginTop || 0}px`,
                    transform: isDragging ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : 'none',
                    position: 'relative',
                    zIndex: isDragging ? 1000 : 1
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={handleDragStart}
            >
                <Resizable
                    size={{ width: width || 300, height: height || 'auto' }}
                    onResizeStop={onResizeStop}
                    enable={{
                        top: false, right: false, bottom: false, left: false,
                        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
                    }}
                    className="relative"
                    handleClasses={{
                        topRight: "opacity-0 group-hover:opacity-100 w-2 h-2 absolute -top-1 -right-1 bg-blue-500 cursor-nesw-resize z-30 rounded-full border-2 border-white shadow-md transition-opacity",
                        bottomRight: "opacity-0 group-hover:opacity-100 w-2 h-2 absolute -bottom-1 -right-1 bg-blue-500 cursor-nwse-resize z-30 rounded-full border-2 border-white shadow-md transition-opacity",
                        bottomLeft: "opacity-0 group-hover:opacity-100 w-2 h-2 absolute -bottom-1 -left-1 bg-blue-500 cursor-nesw-resize z-30 rounded-full border-2 border-white shadow-md transition-opacity",
                        topLeft: "opacity-0 group-hover:opacity-100 w-2 h-2 absolute -top-1 -left-1 bg-blue-500 cursor-nwse-resize z-30 rounded-full border-2 border-white shadow-md transition-opacity"
                    }}
                >
                    <img
                        src={src}
                        alt={alt}
                        className="block max-w-full h-auto rounded-md shadow-lg"
                        style={{
                            width: '100%',
                            height: '100%',
                            pointerEvents: isDragging ? 'none' : 'auto',
                            userSelect: 'none',
                            imageRendering: 'crisp-edges',
                            filter: 'contrast(1.05) brightness(1.02)',
                            WebkitFontSmoothing: 'antialiased'
                        }}
                        draggable={false}
                    />
                </Resizable>
            </div>
        </NodeViewWrapper>
    );
};

// Custom Image Extension to support resizing and draggable positioning
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
            marginLeft: {
                default: 0,
            },
            marginTop: {
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
    const [contextMenu, setContextMenu] = useState(null);

    // Handle context menu
    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
        });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    useEffect(() => {
        if (contextMenu) {
            window.addEventListener('click', closeContextMenu);
            window.addEventListener('scroll', closeContextMenu);
            return () => {
                window.removeEventListener('click', closeContextMenu);
                window.removeEventListener('scroll', closeContextMenu);
            };
        }
    }, [contextMenu, closeContextMenu]);

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
                            const blob = items[i].getAsFile();
                            if (blob) {
                                // Create a temporary file path for the blob
                                const reader = new FileReader();
                                reader.onload = async (e) => {
                                    try {
                                        // Convert blob to base64 and save
                                        const base64Data = e.target.result;
                                        const result = await window.electronAPI.saveImageFromClipboard(base64Data);
                                        if (result.success) {
                                            const { schema } = view.state;
                                            const { selection } = view.state;
                                            const node = schema.nodes.image.create({ src: `local-resource://${result.filename}` });
                                            const transaction = view.state.tr.insert(selection.from, node);
                                            view.dispatch(transaction);
                                        }
                                    } catch (error) {
                                        console.error('Failed to paste image:', error);
                                    }
                                };
                                reader.readAsDataURL(blob);
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

    const handleContextMenuAction = (action) => {
        if (!editor) return;

        switch (action) {
            case 'cut':
                document.execCommand('cut');
                break;
            case 'copy':
                document.execCommand('copy');
                break;
            case 'paste':
                document.execCommand('paste');
                break;
            case 'selectAll':
                editor.chain().focus().selectAll().run();
                break;
            case 'undo':
                editor.chain().focus().undo().run();
                break;
            case 'redo':
                editor.chain().focus().redo().run();
                break;
            case 'bold':
                editor.chain().focus().toggleBold().run();
                break;
            case 'italic':
                editor.chain().focus().toggleItalic().run();
                break;
            case 'underline':
                editor.chain().focus().toggleUnderline().run();
                break;
        }
        closeContextMenu();
    };

    return (
        <div className="flex flex-col h-full bg-app-bg-secondary">
            <MenuBar editor={editor} onAiAction={onAiAction} />
            <div
                className="flex-1 overflow-y-auto bg-app-bg-secondary"
                onContextMenu={handleContextMenu}
            >
                <EditorContent editor={editor} />
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-app-bg-primary border border-border rounded-lg shadow-lg py-1 min-w-[180px]"
                    style={{
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`,
                    }}
                >
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-app-text-primary hover:bg-app-bg-tertiary flex items-center gap-2"
                        onClick={() => handleContextMenuAction('cut')}
                    >
                        <span className="text-xs">✂️</span> Cut
                        <span className="ml-auto text-xs text-app-text-muted">Ctrl+X</span>
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-app-text-primary hover:bg-app-bg-tertiary flex items-center gap-2"
                        onClick={() => handleContextMenuAction('copy')}
                    >
                        <span className="text-xs">📋</span> Copy
                        <span className="ml-auto text-xs text-app-text-muted">Ctrl+C</span>
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-app-text-primary hover:bg-app-bg-tertiary flex items-center gap-2"
                        onClick={() => handleContextMenuAction('paste')}
                    >
                        <span className="text-xs">📄</span> Paste
                        <span className="ml-auto text-xs text-app-text-muted">Ctrl+V</span>
                    </button>
                    <div className="border-t border-border my-1"></div>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-app-text-primary hover:bg-app-bg-tertiary flex items-center gap-2"
                        onClick={() => handleContextMenuAction('selectAll')}
                    >
                        <span className="text-xs">📝</span> Select All
                        <span className="ml-auto text-xs text-app-text-muted">Ctrl+A</span>
                    </button>
                    <div className="border-t border-border my-1"></div>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-app-text-primary hover:bg-app-bg-tertiary flex items-center gap-2"
                        onClick={() => handleContextMenuAction('bold')}
                        disabled={!editor?.can().chain().focus().toggleBold().run()}
                    >
                        <Bold className="w-3 h-3" /> Bold
                        <span className="ml-auto text-xs text-app-text-muted">Ctrl+B</span>
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-app-text-primary hover:bg-app-bg-tertiary flex items-center gap-2"
                        onClick={() => handleContextMenuAction('italic')}
                        disabled={!editor?.can().chain().focus().toggleItalic().run()}
                    >
                        <Italic className="w-3 h-3" /> Italic
                        <span className="ml-auto text-xs text-app-text-muted">Ctrl+I</span>
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-app-text-primary hover:bg-app-bg-tertiary flex items-center gap-2"
                        onClick={() => handleContextMenuAction('underline')}
                    >
                        <UnderlineIcon className="w-3 h-3" /> Underline
                        <span className="ml-auto text-xs text-app-text-muted">Ctrl+U</span>
                    </button>
                    <div className="border-t border-border my-1"></div>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-app-text-primary hover:bg-app-bg-tertiary flex items-center gap-2"
                        onClick={() => handleContextMenuAction('undo')}
                        disabled={!editor?.can().chain().focus().undo().run()}
                    >
                        <Undo className="w-3 h-3" /> Undo
                        <span className="ml-auto text-xs text-app-text-muted">Ctrl+Z</span>
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-app-text-primary hover:bg-app-bg-tertiary flex items-center gap-2"
                        onClick={() => handleContextMenuAction('redo')}
                        disabled={!editor?.can().chain().focus().redo().run()}
                    >
                        <Redo className="w-3 h-3" /> Redo
                        <span className="ml-auto text-xs text-app-text-muted">Ctrl+Y</span>
                    </button>
                </div>
            )}
        </div>
    );
}
