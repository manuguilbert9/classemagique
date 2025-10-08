
'use server';

import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file from a data URI to Firebase Cloud Storage.
 * @param dataURI The data URI of the file (e.g., "data:image/png;base64,...").
 * @param path The path in Cloud Storage where the file will be saved (e.g., "story-images").
 * @returns The public URL of the uploaded file.
 */
export async function uploadDataURI(dataURI: string, path: string): Promise<string> {
  if (!dataURI.startsWith('data:')) {
    throw new Error('Invalid data URI provided.');
  }

  // Extract mime type to determine file extension
  const mimeType = dataURI.substring(dataURI.indexOf(':') + 1, dataURI.indexOf(';'));
  const extension = mimeType.split('/')[1] || 'bin';

  // Create a unique filename for the file
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  // The 'data_url' format for uploadString handles the data URI directly.
  const snapshot = await uploadString(storageRef, dataURI, 'data_url');
  
  // Get the public URL of the uploaded file.
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}
