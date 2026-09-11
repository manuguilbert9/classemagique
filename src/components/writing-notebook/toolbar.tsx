'use client';

import type { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { PictoPicker } from './picto-picker';
import {
    Bold, Italic, Underline, Strikethrough, Undo2, Redo2,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Quote, Minus, TableIcon,
    Rows3, Columns3, Trash2, PaintBucket, Baseline, Link2, Link2Off,
} from 'lucide-react';

const FONT_FAMILIES = [
    { label: 'Standard', value: '' },
    { label: 'Andika', value: 'var(--font-andika), sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Comic Sans MS', value: '"Comic Sans MS", "Comic Sans", cursive' },
    { label: 'Courier New', value: '"Courier New", monospace' },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px'];

const TEXT_COLORS = ['#1f2937', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777', '#ffffff'];
const HIGHLIGHT_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff', 'transparent'];

function ToolbarButton({
    onClick, active, disabled, title, children,
}: { onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode }) {
    return (
        <Button
            type="button"
            variant={active ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={onClick}
            disabled={disabled}
            title={title}
        >
            {children}
        </Button>
    );
}

function ColorSwatchRow({ colors, onPick, title }: { colors: string[]; onPick: (c: string) => void; title: string }) {
    return (
        <div className="flex flex-wrap gap-1 p-2" role="group" aria-label={title}>
            {colors.map((c) => (
                <button
                    type="button"
                    key={c}
                    onClick={() => onPick(c)}
                    className="h-6 w-6 rounded-full border shadow-sm"
                    style={{ backgroundColor: c === 'transparent' ? '#fff' : c }}
                    title={c === 'transparent' ? 'Aucune' : c}
                >
                    {c === 'transparent' && <span className="block h-full w-full text-[10px] leading-6 text-center">∅</span>}
                </button>
            ))}
        </div>
    );
}

interface ToolbarProps {
    editor: Editor | null;
}

export function WritingToolbar({ editor }: ToolbarProps) {
    if (!editor) return null;

    const headingValue = editor.isActive('heading', { level: 1 }) ? 'h1'
        : editor.isActive('heading', { level: 2 }) ? 'h2'
        : editor.isActive('heading', { level: 3 }) ? 'h3'
        : 'p';

    const inTable = editor.isActive('table');

    return (
        <div className="flex flex-wrap items-center gap-1 rounded-t-md border-b bg-muted/40 p-1.5">
            <ToolbarButton title="Annuler" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                <Undo2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Rétablir" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                <Redo2 className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Select
                value={headingValue}
                onValueChange={(v) => {
                    const chain = editor.chain().focus();
                    if (v === 'p') chain.setParagraph().run();
                    else chain.setHeading({ level: Number(v.replace('h', '')) as 1 | 2 | 3 }).run();
                }}
            >
                <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="p">Texte normal</SelectItem>
                    <SelectItem value="h1">Titre 1</SelectItem>
                    <SelectItem value="h2">Titre 2</SelectItem>
                    <SelectItem value="h3">Titre 3</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value="reset"
                onValueChange={(v) => v === 'reset'
                    ? editor.chain().focus().unsetFontFamily().run()
                    : editor.chain().focus().setFontFamily(v).run()}
            >
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Police" /></SelectTrigger>
                <SelectContent>
                    {FONT_FAMILIES.map(f => (
                        <SelectItem key={f.label} value={f.value || 'reset'}>
                            <span style={{ fontFamily: f.value || undefined }}>{f.label}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value="reset"
                onValueChange={(v) => v === 'reset'
                    ? editor.chain().focus().unsetFontSize().run()
                    : editor.chain().focus().setFontSize(v).run()}
            >
                <SelectTrigger className="h-8 w-[80px] text-xs"><SelectValue placeholder="Taille" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="reset">Standard</SelectItem>
                    {FONT_SIZES.map(s => (
                        <SelectItem key={s} value={s}>{s.replace('px', '')}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <ToolbarButton title="Gras" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Italique" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Souligné" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <Underline className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Barré" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
                <Strikethrough className="h-4 w-4" />
            </ToolbarButton>

            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Couleur du texte">
                        <Baseline className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <ColorSwatchRow title="Couleur du texte" colors={TEXT_COLORS} onPick={(c) => editor.chain().focus().setColor(c).run()} />
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Surligner">
                        <PaintBucket className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <ColorSwatchRow
                        title="Couleur de surlignage"
                        colors={HIGHLIGHT_COLORS}
                        onPick={(c) => c === 'transparent'
                            ? editor.chain().focus().unsetHighlight().run()
                            : editor.chain().focus().toggleHighlight({ color: c }).run()}
                    />
                </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <ToolbarButton title="Aligner à gauche" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Centrer" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Aligner à droite" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Justifier" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
                <AlignJustify className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <ToolbarButton title="Liste à puces" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Liste numérotée" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Citation" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Ligne horizontale" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                <Minus className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                title="Lien"
                active={editor.isActive('link')}
                onClick={() => {
                    if (editor.isActive('link')) {
                        editor.chain().focus().unsetLink().run();
                        return;
                    }
                    const url = window.prompt('Adresse du lien (https://...)');
                    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                }}
            >
                {editor.isActive('link') ? <Link2Off className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <ToolbarButton
                title="Insérer un tableau"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
                <TableIcon className="h-4 w-4" />
            </ToolbarButton>

            <PictoPicker onSelect={(src, alt) => editor.chain().focus().setImage({ src, alt }).run()} />

            {inTable && (
                <>
                    <Separator orientation="vertical" className="mx-1 h-6" />
                    <ToolbarButton title="Ajouter une colonne" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                        <Columns3 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Ajouter une ligne" onClick={() => editor.chain().focus().addRowAfter().run()}>
                        <Rows3 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Supprimer la colonne" onClick={() => editor.chain().focus().deleteColumn().run()}>
                        <Columns3 className="h-4 w-4 text-destructive" />
                    </ToolbarButton>
                    <ToolbarButton title="Supprimer la ligne" onClick={() => editor.chain().focus().deleteRow().run()}>
                        <Rows3 className="h-4 w-4 text-destructive" />
                    </ToolbarButton>
                    <ToolbarButton title="Supprimer le tableau" onClick={() => editor.chain().focus().deleteTable().run()}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </ToolbarButton>
                </>
            )}
        </div>
    );
}

