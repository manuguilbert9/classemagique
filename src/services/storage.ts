
'use server';

import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

/**
 * Uploads an image from a data URI to Firebase Cloud Storage.
 * @param dataURI The data URI of the image (e.g., "data:image/png;base64,...").
 * @param path The path in Cloud Storage where the image will be saved (e.g., "story-images").
 * @returns The public URL of the uploaded image.
 */
export async function uploadImageFromDataURI(dataURI: string, path: string): Promise<string> {
  if (!dataURI.startsWith('data:image')) {
    throw new Error('Invalid data URI provided.');
  }

  // Create a unique filename for the image
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.png`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  // The 'data_url' format for uploadString handles the data URI directly.
  const snapshot = await uploadString(storageRef, dataURI, 'data_url');
  
  // Get the public URL of the uploaded file.
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}
