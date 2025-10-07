
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
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
  emojis?: string[];
  description?: string;
  createdAt: string; // ISO string
}

/**
 * Saves a generated story to the database.
 */
export async function saveStory(author: Student, storyData: StoryOutput, storyInput: StoryInput): Promise<{ success: boolean; error?: string }> {
  if (!author) {
    return { success: false, error: "Author is required." };
  }
  try {
    const dataToSave = {
      authorId: author.id,
      authorName: author.name,
      authorPhotoURL: author.photoURL || null,
      authorShowPhoto: author.showPhoto ?? false,
      title: storyData.title,
      content: storyData,
      emojis: storyInput.emojis || [],
      description: storyInput.description || '',
      createdAt: Timestamp.now()
    };
    
    addDoc(collection(db, 'saved_stories'), dataToSave)
        .catch(error => {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                    path: 'saved_stories',
                    operation: 'create',
                    requestResourceData: dataToSave,
                })
            );
        });

    return { success: true };
  } catch (error) {
    console.error("Error saving story to Firestore:", error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred.' };
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
        deleteDoc(docRef)
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
