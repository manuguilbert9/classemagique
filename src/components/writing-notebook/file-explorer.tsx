'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator,
} from '@/components/ui/context-menu';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Folder, FileText, FolderPlus, FilePlus, MoreVertical, Pencil, Trash2, Home,
    ChevronRight, FolderOpen,
} from 'lucide-react';
import type { FsNode } from '@/services/writing-fs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FileExplorerProps {
    nodes: FsNode[];
    currentFolderId: string | null;
    onNavigate: (folderId: string | null) => void;
    onOpenFile: (node: FsNode) => void;
    onCreateFolder: (name: string) => void;
    onCreateFile: (name: string) => void;
    onRename: (node: FsNode, name: string) => void;
    onDelete: (node: FsNode) => void;
}

function ToolbarCommand({
    icon: Icon, label, onClick,
}: { icon: React.ComponentType<{ className?: string }>; label: string; onClick?: () => void }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="h-8 gap-1.5 rounded-sm px-2.5 text-[13px] font-normal hover:bg-[#e5f1fb]"
        >
            <Icon className="h-4 w-4 text-slate-600" />
            {label}
        </Button>
    );
}

function NewNodeDialog({
    icon: Icon, title, description, placeholder, onCreate,
}: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; placeholder: string; onCreate: (name: string) => void }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');

    const submit = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onCreate(trimmed);
        setValue('');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setValue(''); }}>
            <DialogTrigger asChild>
                <ToolbarCommand icon={Icon} label={title} />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
                    autoFocus
                />
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={submit} disabled={!value.trim()}>Créer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RenameDialog({
    node, onRename, asContextItem,
}: { node: FsNode; onRename: (node: FsNode, name: string) => void; asContextItem?: boolean }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(node.name);

    const submit = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onRename(node, trimmed);
        setOpen(false);
    };

    const ItemComponent = asContextItem ? ContextMenuItem : DropdownMenuItem;

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setValue(node.name); }}>
            <DialogTrigger asChild>
                <ItemComponent onSelect={(e) => e.preventDefault()}>
                    <Pencil className="mr-2 h-4 w-4" /> Renommer
                </ItemComponent>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Renommer</DialogTitle>
                </DialogHeader>
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
                    autoFocus
                />
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={submit} disabled={!value.trim()}>Enregistrer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteConfirm({
    node, onDelete, asContextItem,
}: { node: FsNode; onDelete: (node: FsNode) => void; asContextItem?: boolean }) {
    const ItemComponent = asContextItem ? ContextMenuItem : DropdownMenuItem;
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <ItemComponent onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </ItemComponent>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer « {node.name} » ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {node.type === 'folder'
                            ? 'Ce dossier et tout ce qu\'il contient seront supprimés définitivement.'
                            : 'Ce fichier sera supprimé définitivement.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(node)}>Supprimer</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function FileExplorer({
    nodes, currentFolderId, onNavigate, onOpenFile, onCreateFolder, onCreateFile, onRename, onDelete,
}: FileExplorerProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const byParent = useMemo(() => {
        const map = new Map<string | null, FsNode[]>();
        for (const node of nodes) {
            const key = node.parentId;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(node);
        }
        return map;
    }, [nodes]);

    const byId = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

    const breadcrumbs = useMemo(() => {
        const trail: FsNode[] = [];
        let cursor = currentFolderId ? byId.get(currentFolderId) : undefined;
        while (cursor) {
            trail.unshift(cursor);
            cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
        }
        return trail;
    }, [byId, currentFolderId]);

    const children = (byParent.get(currentFolderId) ?? [])
        .slice()
        .sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name, 'fr');
        });

    const openNode = (node: FsNode) => node.type === 'folder' ? onNavigate(node.id) : onOpenFile(node);

    return (
        <div className="overflow-hidden rounded-md border bg-white shadow-sm" onClick={() => setSelectedId(null)}>
            {/* Barre de commandes façon Explorateur Windows */}
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-[#f3f3f3] px-1.5 py-1" onClick={(e) => e.stopPropagation()}>
                <NewNodeDialog
                    icon={FolderPlus}
                    title="Nouveau dossier"
                    description="Choisis un nom pour ton nouveau dossier."
                    placeholder="ex : Mes histoires"
                    onCreate={onCreateFolder}
                />
                <NewNodeDialog
                    icon={FilePlus}
                    title="Nouveau fichier"
                    description="Choisis un nom pour ton nouveau texte."
                    placeholder="ex : Ma poésie"
                    onCreate={onCreateFile}
                />
            </div>

            {/* Barre d'adresse */}
            <div className="flex items-center gap-2 border-b bg-white px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-full border bg-[#f3f3f3] px-1 py-1 text-sm">
                    <button
                        onClick={() => onNavigate(null)}
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 hover:bg-white',
                            currentFolderId === null && 'bg-white font-medium shadow-sm'
                        )}
                    >
                        <Home className="h-3.5 w-3.5" /> Mes fichiers
                    </button>
                    {breadcrumbs.map((crumb) => (
                        <span key={crumb.id} className="flex shrink-0 items-center gap-1">
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <button
                                onClick={() => onNavigate(crumb.id)}
                                className={cn(
                                    'rounded-full px-2.5 py-1 hover:bg-white',
                                    crumb.id === currentFolderId && 'bg-white font-medium shadow-sm'
                                )}
                            >
                                {crumb.name}
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {children.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                    <FolderOpen className="h-10 w-10" />
                    <p>Ce dossier est vide. Crée un dossier ou un fichier pour commencer !</p>
                </div>
            ) : (
                <div>
                    {/* En-têtes de colonnes façon vue "Détails" */}
                    <div className="hidden grid-cols-[1fr_150px_130px_2rem] gap-2 border-b bg-[#f9f9f9] px-3 py-1.5 text-xs font-medium text-muted-foreground sm:grid">
                        <span>Nom</span>
                        <span>Modifié le</span>
                        <span>Type</span>
                        <span />
                    </div>
                    <div className="divide-y" onClick={(e) => e.stopPropagation()}>
                        {children.map((node) => (
                            <ContextMenu key={node.id}>
                                <ContextMenuTrigger asChild>
                                    <div
                                        className={cn(
                                            'grid cursor-default select-none grid-cols-[1fr_auto] items-center gap-2 px-3 py-1.5 text-sm sm:grid-cols-[1fr_150px_130px_2rem]',
                                            selectedId === node.id ? 'bg-[#cce8ff] hover:bg-[#cce8ff]' : 'hover:bg-[#e5f1fb]'
                                        )}
                                        onClick={() => setSelectedId(node.id)}
                                        onDoubleClick={() => openNode(node)}
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            {node.type === 'folder'
                                                ? <Folder className="h-5 w-5 shrink-0 text-amber-500 fill-amber-300" />
                                                : <FileText className="h-5 w-5 shrink-0 text-sky-600 fill-sky-100" />}
                                            <span className="truncate">{node.name}</span>
                                        </span>
                                        <span className="hidden truncate text-xs text-muted-foreground sm:block">
                                            {format(new Date(node.updatedAt), "d MMM yyyy HH:mm", { locale: fr })}
                                        </span>
                                        <span className="hidden truncate text-xs text-muted-foreground sm:block">
                                            {node.type === 'folder' ? 'Dossier de fichiers' : 'Document texte'}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => openNode(node)}>
                                                    {node.type === 'folder' ? <FolderOpen className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                                                    Ouvrir
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <RenameDialog node={node} onRename={onRename} />
                                                <DeleteConfirm node={node} onDelete={onDelete} />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-48">
                                    <ContextMenuItem onSelect={() => openNode(node)}>
                                        {node.type === 'folder' ? <FolderOpen className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                                        Ouvrir
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <RenameDialog node={node} onRename={onRename} asContextItem />
                                    <DeleteConfirm node={node} onDelete={onDelete} asContextItem />
                                </ContextMenuContent>
                            </ContextMenu>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t bg-[#f3f3f3] px-3 py-1 text-xs text-muted-foreground">
                {children.length} élément{children.length > 1 ? 's' : ''}
            </div>
        </div>
    );
}
