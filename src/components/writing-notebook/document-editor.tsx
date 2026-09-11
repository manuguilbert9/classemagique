'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { TableKit } from '@tiptap/extension-table';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { updateFileContent } from '@/services/writing-fs';
import { WritingToolbar } from './toolbar';
import { cn } from '@/lib/utils';

interface DocumentEditorProps {
    fileId: string;
    fileName: string;
    initialContent: string;
    onBack: () => void;
    onRename: (name: string) => void;
}

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export function DocumentEditor({ fileId, fileName, initialContent, onBack, onRename }: DocumentEditorProps) {
    const [name, setName] = useState(fileName);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestContent = useRef(initialContent);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ link: { openOnClick: false } }),
            TextStyleKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: true }),
            TableKit.configure({ table: { resizable: true } }),
            Image.configure({ inline: false, allowBase64: true }),
            Placeholder.configure({ placeholder: 'Écris ton texte ici...' }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'writing-doc-content',
            },
        },
        onUpdate: ({ editor }) => {
            latestContent.current = editor.getHTML();
            setSaveStatus('unsaved');
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                void doSave();
            }, 1500);
        },
    });

    const doSave = useCallback(async () => {
        setSaveStatus('saving');
        const result = await updateFileContent(fileId, latestContent.current);
        setSaveStatus(result.success ? 'saved' : 'error');
    }, [fileId]);

    useEffect(() => {
        return () => {
            if (saveTimer.current) {
                clearTimeout(saveTimer.current);
                void updateFileContent(fileId, latestContent.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileId]);

    const handleBack = async () => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        if (saveStatus === 'unsaved' || saveStatus === 'saving') {
            await doSave();
        }
        onBack();
    };

    const handleNameBlur = () => {
        const trimmed = name.trim();
        if (trimmed && trimmed !== fileName) {
            onRename(trimmed);
        } else {
            setName(fileName);
        }
    };

    return (
        <div className="flex flex-col overflow-hidden rounded-md border shadow-sm">
            {/* Barre de titre façon Word */}
            <div className="flex items-center gap-2 bg-[#2b579a] px-2 py-1.5 text-white">
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 shrink-0 text-white hover:bg-white/15 hover:text-white" title="Retour à mes fichiers">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <FileText className="h-4 w-4 shrink-0 opacity-90" />
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    className="h-7 max-w-xs border-none bg-white/10 text-center font-medium text-white placeholder:text-white/70 focus-visible:bg-white/20 focus-visible:ring-1 focus-visible:ring-white/60"
                />
                <div className="ml-auto flex items-center gap-1.5 whitespace-nowrap text-xs text-white/90">
                    {saveStatus === 'saving' && <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement...</>}
                    {saveStatus === 'saved' && <><CheckCircle2 className="h-3.5 w-3.5" /> Enregistré</>}
                    {saveStatus === 'unsaved' && <>Modifications non enregistrées</>}
                    {saveStatus === 'error' && <><AlertCircle className="h-3.5 w-3.5" /> Erreur d'enregistrement</>}
                </div>
            </div>

            <WritingToolbar editor={editor} />

            {/* Zone de la page, façon Word */}
            <div className="max-h-[70vh] overflow-y-auto bg-[#e5e5e5] px-3 py-6 sm:px-8">
                <div
                    className={cn(
                        'mx-auto min-h-[65vh] max-w-[850px] bg-white px-6 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.2),0_6px_20px_rgba(0,0,0,0.12)] sm:px-16 sm:py-12'
                    )}
                    onClick={() => editor?.chain().focus().run()}
                >
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
}
