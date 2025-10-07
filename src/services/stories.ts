
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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
 */
export async function saveStory(author: Student, storyData: StoryOutput, storyInput: StoryInput, imageUrl: string | null): Promise<{ success: boolean; error?: string }> {
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
      imageUrl: imageUrl || null,
      emojis: storyInput.emojis || [],
      description: storyInput.description || '',
      createdAt: Timestamp.now()
    };
    
    // Check if a story by this author with this title already exists today to avoid duplicates from regeneration
    const q = query(
        collection(db, 'saved_stories'), 
        where('authorId', '==', author.id),
        where('title', '==', storyData.title),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    let existingStoryId: string | null = null;
    if (!querySnapshot.empty) {
        const latestDoc = querySnapshot.docs[0];
        const latestDate = (latestDoc.data().createdAt as Timestamp).toDate();
        const today = new Date();
        // Check if the latest story is from today
        if (latestDate.getDate() === today.getDate() &&
            latestDate.getMonth() === today.getMonth() &&
            latestDate.getFullYear() === today.getFullYear()) {
            existingStoryId = latestDoc.id;
        }
    }

    if (existingStoryId) {
      // Update the existing story (e.g., to add the image URL)
      const docRef = doc(db, 'saved_stories', existingStoryId);
      updateDoc(docRef, { imageUrl: imageUrl || null })
        .catch(error => {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                    path: `saved_stories/${existingStoryId}`,
                    operation: 'update',
                    requestResourceData: { imageUrl: imageUrl || null },
                })
            );
        });
    } else {
      // Add a new story
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
    }

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
