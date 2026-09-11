'use client';

import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FsNode } from '@/services/writing-fs';
import { sanitizeWritingHtml } from '@/lib/sanitize-html';

interface WritingFilesViewerProps {
    nodes: FsNode[];
}

/**
 * Read-only view, for the teacher dashboard, of one student's writing-notebook files.
 * Folders only exist to build each file's display path; they are not browsable here.
 */
export function WritingFilesViewer({ nodes }: WritingFilesViewerProps) {
    const files = useMemo(() => {
        const byId = new Map(nodes.map(n => [n.id, n]));
        const pathOf = (node: FsNode): string => {
            const segments: string[] = [];
            let cursor: FsNode | undefined = node.parentId ? byId.get(node.parentId) : undefined;
            while (cursor) {
                segments.unshift(cursor.name);
                cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
            }
            return segments.length ? segments.join(' / ') : 'Mes fichiers';
        };

        return nodes
            .filter(n => n.type === 'file')
            .map(n => ({ node: n, path: pathOf(n) }))
            .sort((a, b) => new Date(b.node.updatedAt).getTime() - new Date(a.node.updatedAt).getTime());
    }, [nodes]);

    if (files.length === 0) {
        return <p className="text-center text-sm text-muted-foreground py-4">Aucun fichier dans le cahier d'écriture.</p>;
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {files.map(({ node, path }) => (
                <AccordionItem value={node.id} key={node.id}>
                    <AccordionTrigger>
                        <div className="flex flex-col items-start text-left">
                            <span className="flex items-center gap-1.5 font-medium">
                                <FileText className="h-4 w-4 text-sky-500" /> {node.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {path} · modifié le {format(new Date(node.updatedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div
                            className="writing-doc-content rounded-md border bg-muted/30 p-4"
                            style={{ fontSize: '13pt' }}
                            dangerouslySetInnerHTML={{ __html: sanitizeWritingHtml(node.content) || '<p class="text-muted-foreground">(vide)</p>' }}
                        />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
