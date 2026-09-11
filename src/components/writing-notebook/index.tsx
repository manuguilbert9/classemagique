'use client';

import { useContext, useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserContext } from '@/context/user-context';
import { useToast } from '@/hooks/use-toast';
import {
    type FsNode,
    getNodesForUser,
    createNode,
    renameNode,
    deleteNode,
} from '@/services/writing-fs';
import { FileExplorer } from './file-explorer';
import { DocumentEditor } from './document-editor';

export function WritingNotebook() {
    const { student } = useContext(UserContext);
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [nodes, setNodes] = useState<FsNode[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [openFileId, setOpenFileId] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!student) return;
        const userNodes = await getNodesForUser(student.id);
        setNodes(userNodes);
    }, [student]);

    useEffect(() => {
        if (student) {
            refresh().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student]);

    useEffect(() => {
        if (currentFolderId && !nodes.some(n => n.id === currentFolderId)) {
            setCurrentFolderId(null);
        }
    }, [nodes, currentFolderId]);

    const namesInFolder = (parentId: string | null) =>
        new Set(nodes.filter(n => n.parentId === parentId).map(n => n.name.toLowerCase()));

    const handleCreateFolder = async (name: string) => {
        if (!student) return;
        if (namesInFolder(currentFolderId).has(name.toLowerCase())) {
            toast({ variant: 'destructive', title: 'Nom déjà utilisé', description: 'Choisis un autre nom.' });
            return;
        }
        const result = await createNode(student.id, currentFolderId, 'folder', name);
        if (result.success) {
            await refresh();
        } else {
            toast({ variant: 'destructive', title: 'Erreur', description: result.error });
        }
    };

    const handleCreateFile = async (name: string) => {
        if (!student) return;
        if (namesInFolder(currentFolderId).has(name.toLowerCase())) {
            toast({ variant: 'destructive', title: 'Nom déjà utilisé', description: 'Choisis un autre nom.' });
            return;
        }
        const result = await createNode(student.id, currentFolderId, 'file', name);
        if (result.success && result.id) {
            await refresh();
            setOpenFileId(result.id);
        } else {
            toast({ variant: 'destructive', title: 'Erreur', description: result.error });
        }
    };

    const handleRename = async (node: FsNode, name: string) => {
        if (namesInFolder(node.parentId).has(name.toLowerCase()) && name.toLowerCase() !== node.name.toLowerCase()) {
            toast({ variant: 'destructive', title: 'Nom déjà utilisé', description: 'Choisis un autre nom.' });
            return;
        }
        const result = await renameNode(node.id, name);
        if (result.success) {
            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, name } : n));
        } else {
            toast({ variant: 'destructive', title: 'Erreur', description: result.error });
        }
    };

    const handleDelete = async (node: FsNode) => {
        if (!student) return;
        const result = await deleteNode(student.id, node.id);
        if (result.success) {
            toast({ title: 'Supprimé', description: `« ${node.name} » a été supprimé.` });
            if (openFileId === node.id) setOpenFileId(null);
            await refresh();
        } else {
            toast({ variant: 'destructive', title: 'Erreur', description: result.error });
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!student) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-center">Connexion requise</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">
                        Tu dois être connecté pour utiliser le cahier d'écriture.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const openFile = openFileId ? nodes.find(n => n.id === openFileId) : undefined;

    return (
        <div className="w-full mx-auto space-y-4">
            {openFile ? (
                <DocumentEditor
                    key={openFile.id}
                    fileId={openFile.id}
                    fileName={openFile.name}
                    initialContent={openFile.content}
                    onBack={() => setOpenFileId(null)}
                    onRename={(name) => handleRename(openFile, name)}
                />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Mon cahier d'écriture</CardTitle>
                        <CardDescription>
                            Range tes textes dans des dossiers, écris avec toutes les options de mise en forme, ajoute des tableaux et des pictogrammes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FileExplorer
                            nodes={nodes}
                            currentFolderId={currentFolderId}
                            onNavigate={setCurrentFolderId}
                            onOpenFile={(node) => setOpenFileId(node.id)}
                            onCreateFolder={handleCreateFolder}
                            onCreateFile={handleCreateFile}
                            onRename={handleRename}
                            onDelete={handleDelete}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
