'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Folder, FileText, FolderPlus, FilePlus, MoreVertical, Pencil, Trash2, Home, ChevronRight } from 'lucide-react';
import type { FsNode } from '@/services/writing-fs';
import { cn } from '@/lib/utils';

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

function NewNodeDialog({
    title, description, placeholder, onCreate,
}: { title: string; description: string; placeholder: string; onCreate: (name: string) => void }) {
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
                <Button variant="outline" size="sm" className="gap-1.5">
                    {title === 'Nouveau dossier' ? <FolderPlus className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
                    {title}
                </Button>
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

function RenameDialog({ node, onRename }: { node: FsNode; onRename: (node: FsNode, name: string) => void }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(node.name);

    const submit = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onRename(node, trimmed);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setValue(node.name); }}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="mr-2 h-4 w-4" /> Renommer
                </DropdownMenuItem>
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

export function FileExplorer({
    nodes, currentFolderId, onNavigate, onOpenFile, onCreateFolder, onCreateFile, onRename, onDelete,
}: FileExplorerProps) {
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

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 text-sm">
                    <button
                        onClick={() => onNavigate(null)}
                        className={cn('flex items-center gap-1 rounded px-2 py-1 hover:bg-muted', currentFolderId === null && 'font-semibold')}
                    >
                        <Home className="h-4 w-4" /> Mes fichiers
                    </button>
                    {breadcrumbs.map((crumb) => (
                        <span key={crumb.id} className="flex items-center gap-1">
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <button
                                onClick={() => onNavigate(crumb.id)}
                                className={cn('rounded px-2 py-1 hover:bg-muted', crumb.id === currentFolderId && 'font-semibold')}
                            >
                                {crumb.name}
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <NewNodeDialog
                        title="Nouveau dossier"
                        description="Choisis un nom pour ton nouveau dossier."
                        placeholder="ex : Mes histoires"
                        onCreate={onCreateFolder}
                    />
                    <NewNodeDialog
                        title="Nouveau fichier"
                        description="Choisis un nom pour ton nouveau texte."
                        placeholder="ex : Ma poésie"
                        onCreate={onCreateFile}
                    />
                </div>
            </div>

            {children.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-16 text-muted-foreground">
                    <Folder className="h-10 w-10" />
                    <p>Ce dossier est vide. Crée un dossier ou un fichier pour commencer !</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {children.map((node) => (
                        <div
                            key={node.id}
                            className="group relative flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center hover:border-primary hover:shadow-sm cursor-pointer"
                            onClick={() => node.type === 'folder' ? onNavigate(node.id) : onOpenFile(node)}
                        >
                            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <RenameDialog node={node} onRename={onRename} />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                </DropdownMenuItem>
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
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {node.type === 'folder'
                                ? <Folder className="h-10 w-10 text-amber-500 fill-amber-100" />
                                : <FileText className="h-10 w-10 text-sky-500 fill-sky-100" />}
                            <span className="line-clamp-2 text-sm font-medium break-words w-full">{node.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
