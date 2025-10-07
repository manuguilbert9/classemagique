

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, deleteDoc, doc, updateDoc, setDoc, WriteBatch, writeBatch } from 'firebase/firestore';
import type { StoryOutput, StoryInput } from '@/ai/flows/story-flow';
import type { Student } from './students';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface SavedStory {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  authorShowPhoto?: boolean;
  title: string;
  content: StoryOutput;
  imageUrl?: string;
  emojis?: string[];
  description?: string;
  createdAt: string; // ISO string
}

/**
 * Saves or updates a generated story in the database.
 * If an existing story ID is provided, it updates it. Otherwise, it creates a new one.
 */
export async function saveStory(
    author: Student, 
    storyData: StoryOutput, 
    storyInput: StoryInput, 
    imageUrl: string | null
): Promise<{ success: boolean; id: string; error?: string }> {
    if (!author) {
        return { success: false, id: '', error: "Author is required." };
    }

    try {
        const storiesCollection = collection(db, 'saved_stories');
        
        // Query to find if a story with the same title by the same author already exists
        const q = query(
            storiesCollection,
            where('authorId', '==', author.id),
            where('title', '==', storyData.title)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Story exists, update it
            const existingDoc = querySnapshot.docs[0];
            const storyId = existingDoc.id;
            const docRef = doc(db, 'saved_stories', storyId);

            await updateDoc(docRef, {
                // Update fields that might change, like the image or content
                content: storyData,
                imageUrl: imageUrl,
                emojis: storyInput.emojis || [],
                description: storyInput.description || '',
                // Keep original author info and creation date
            }).catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: `saved_stories/${storyId}`,
                    operation: 'update',
                    requestResourceData: { imageUrl },
                }));
                throw error; // Propagate error
            });

            return { success: true, id: storyId };

        } else {
            // Story doesn't exist, create a new one
            const dataToSave = {
                authorId: author.id,
                authorName: author.name,
                authorPhotoURL: author.photoURL || null,
                authorShowPhoto: author.showPhoto ?? false,
                title: storyData.title,
                content: storyData,
                imageUrl: imageUrl || null,
                emojis: storyInput.emojis || [],
                description: storyInput.description || '',
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(storiesCollection, dataToSave).catch(error => {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: 'saved_stories',
                    operation: 'create',
                    requestResourceData: dataToSave,
                }));
                throw error; // Propagate error
            });

            return { success: true, id: docRef.id };
        }
    } catch (error) {
        console.error("Error saving story to Firestore:", error);
        if (error instanceof Error) {
            return { success: false, id: '', error: error.message };
        }
        return { success: false, id: '', error: 'An unknown error occurred.' };
    }
}


/**
 * Retrieves all saved stories from the database, sorted by creation date.
 */
export async function getSavedStories(): Promise<SavedStory[]> {
  try {
    const q = query(collection(db, "saved_stories"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const stories: SavedStory[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        stories.push({
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as SavedStory);
    });
    return stories;
  } catch (error) {
    console.error("Error loading stories from Firestore:", error);
    errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: 'saved_stories',
            operation: 'list',
        })
    );
    return [];
  }
}

/**
 * Deletes a story from the database.
 */
export async function deleteStory(storyId: string): Promise<{ success: boolean; error?: string }> {
    if (!storyId) {
        return { success: false, error: 'Story ID is required.' };
    }
    try {
        const docRef = doc(db, 'saved_stories', storyId);
        await deleteDoc(docRef)
            .catch(error => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: `saved_stories/${storyId}`,
                        operation: 'delete',
                    })
                );
            });
        return { success: true };
    } catch (error) {
        console.error("Error deleting story:", error);
        if (error instanceof Error) return { success: false, error: error.message };
        return { success: false, error: 'An unknown error occurred.' };
    }
}
