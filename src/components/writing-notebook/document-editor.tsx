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
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    Mes fichiers
                </Button>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    className="h-9 max-w-xs text-center font-semibold"
                />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[110px] justify-end">
                    {saveStatus === 'saving' && <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement...</>}
                    {saveStatus === 'saved' && <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Enregistré</>}
                    {saveStatus === 'unsaved' && <>Modifications non enregistrées</>}
                    {saveStatus === 'error' && <><AlertCircle className="h-3.5 w-3.5 text-destructive" /> Erreur d'enregistrement</>}
                </div>
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <WritingToolbar editor={editor} />
                <div
                    className={cn('max-h-[65vh] min-h-[50vh] overflow-y-auto bg-white p-6')}
                    onClick={() => editor?.chain().focus().run()}
                >
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
}
