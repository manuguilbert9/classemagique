
'use server';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import * as path from 'path';
import * as fs from 'fs';

const bucketName = 'classemagique2.firebasestorage.app';

// Initialize Firebase Admin with minimal config
// In production (Firebase Hosting/Cloud Functions), credentials are auto-detected
// In development, we look for serviceAccountKey.json
function getAdminStorage() {
  try {
    if (!getApps().length) {
      // Check if we're in development and have a service account key
      const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

      if (fs.existsSync(serviceAccountPath)) {
        // Development: Use service account key
        console.log('Using service account key for Firebase Admin');
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        initializeApp({
          credential: cert(serviceAccount),
          storageBucket: bucketName,
        });
      } else {
        // Production or using GOOGLE_APPLICATION_CREDENTIALS
        console.log('Using default credentials for Firebase Admin');
        initializeApp({
          projectId: 'classemagique2',
          storageBucket: bucketName,
        });
      }
    }
    return getStorage().bucket();
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error(
      'Storage service not available. ' +
      'In development, please create a serviceAccountKey.json file. ' +
      'See SETUP_SERVICE_ACCOUNT.md for instructions.'
    );
  }
}

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

  // Extract mime type and base64 data
  const matches = dataURI.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid data URI format.');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extension = mimeType.split('/')[1] || 'bin';

  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Create a unique filename for the file
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
  const filePath = `${path}/${fileName}`;

  try {
    const bucket = getAdminStorage();
    const file = bucket.file(filePath);

    // Upload the file
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
      public: true,
    });

    // Make the file publicly accessible
    await file.makePublic();

    // Return the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;

    return publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}


/**
 * Deletes a file from Firebase Cloud Storage using its public URL.
 * @param fileUrl The public download URL of the file to delete.
 */
export async function deleteFileFromUrl(fileUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!fileUrl) {
    return { success: true }; // Nothing to delete
  }

  try {
    // Extract the file path from the URL
    // URL format: https://storage.googleapis.com/bucket-name/path/to/file
    const urlPattern = new RegExp(`https://storage\\.googleapis\\.com/${bucketName}/(.+)`);
    const matches = fileUrl.match(urlPattern);

    if (!matches) {
      console.warn(`Invalid storage URL format: ${fileUrl}`);
      return { success: false, error: 'Invalid storage URL format' };
    }

    const filePath = matches[1];

    const bucket = getAdminStorage();
    const file = bucket.file(filePath);

    // Delete the file
    await file.delete();

    return { success: true };
  } catch (error: any) {
    // It's common to try to delete a file that doesn't exist, which is not a critical failure.
    if (error.code === 404) {
      console.warn(`File not found for deletion, but this is okay: ${fileUrl}`);
      return { success: true };
    }
    console.error(`Error deleting file from URL ${fileUrl}:`, error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred during file deletion.' };
  }
}
