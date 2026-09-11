

'use server';

import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    doc,
    deleteDoc,
    updateDoc,
    writeBatch,
} from "firebase/firestore";

export type FsNodeType = 'folder' | 'file';

export interface FsNode {
    id: string;
    userId: string;
    parentId: string | null;
    type: FsNodeType;
    name: string;
    content: string; // HTML content, only meaningful for files
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
}

const COLLECTION_NAME = 'writingFsNodes';

function toFsNode(id: string, data: any): FsNode {
    return {
        id,
        userId: data.userId,
        parentId: data.parentId ?? null,
        type: data.type,
        name: data.name,
        content: data.content ?? '',
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
    };
}

/**
 * Retrieves every folder/file node belonging to a student.
 */
export async function getNodesForUser(userId: string): Promise<FsNode[]> {
    if (!userId) return [];
    try {
        const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(d => toFsNode(d.id, d.data()))
            .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    } catch (error) {
        console.error('Error loading writing file-system nodes:', error);
        return [];
    }
}

/**
 * Retrieves every folder/file node for every student (used by the teacher dashboard).
 */
export async function getAllFsNodes(): Promise<FsNode[]> {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => toFsNode(d.id, d.data()));
    } catch (error) {
        console.error('Error loading all writing file-system nodes:', error);
        return [];
    }
}

export async function createNode(
    userId: string,
    parentId: string | null,
    type: FsNodeType,
    name: string
): Promise<{ success: boolean; id?: string; error?: string }> {
    const trimmedName = name.trim();
    if (!userId || !trimmedName) {
        return { success: false, error: 'Nom invalide.' };
    }
    try {
        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            userId,
            parentId: parentId ?? null,
            type,
            name: trimmedName,
            content: '',
            createdAt: now,
            updatedAt: now,
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating writing file-system node:', error);
        return { success: false, error: 'La création a échoué.' };
    }
}

export async function renameNode(nodeId: string, name: string): Promise<{ success: boolean; error?: string }> {
    const trimmedName = name.trim();
    if (!nodeId || !trimmedName) {
        return { success: false, error: 'Nom invalide.' };
    }
    try {
        await updateDoc(doc(db, COLLECTION_NAME, nodeId), {
            name: trimmedName,
            updatedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error renaming writing file-system node:', error);
        return { success: false, error: 'Le renommage a échoué.' };
    }
}

export async function updateFileContent(nodeId: string, content: string): Promise<{ success: boolean; error?: string }> {
    if (!nodeId) {
        return { success: false, error: 'Fichier invalide.' };
    }
    try {
        await updateDoc(doc(db, COLLECTION_NAME, nodeId), {
            content,
            updatedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving writing file content:', error);
        return { success: false, error: "L'enregistrement a échoué." };
    }
}

/**
 * Deletes a node. If it is a folder, every descendant (sub-folders and files) is deleted too.
 */
export async function deleteNode(userId: string, nodeId: string): Promise<{ success: boolean; error?: string }> {
    if (!userId || !nodeId) {
        return { success: false, error: 'Suppression invalide.' };
    }
    try {
        const allNodes = await getNodesForUser(userId);
        const idsToDelete = new Set<string>([nodeId]);

        // Collect every descendant, folders can be nested arbitrarily deep.
        let added = true;
        while (added) {
            added = false;
            for (const node of allNodes) {
                if (node.parentId && idsToDelete.has(node.parentId) && !idsToDelete.has(node.id)) {
                    idsToDelete.add(node.id);
                    added = true;
                }
            }
        }

        const batch = writeBatch(db);
        idsToDelete.forEach(id => batch.delete(doc(db, COLLECTION_NAME, id)));
        await batch.commit();

        return { success: true };
    } catch (error) {
        console.error('Error deleting writing file-system node:', error);
        return { success: false, error: 'La suppression a échoué.' };
    }
}
