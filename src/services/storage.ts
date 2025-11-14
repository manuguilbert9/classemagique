
'use server';

const bucketName = 'classemagique2.firebasestorage.app';
const apiKey = 'AIzaSyCWxtFBSdvAGiJN06WxRLFtFZ0xGPe9E9Q'; // Firebase API key

/**
 * Uploads a file from a data URI to Firebase Cloud Storage using REST API.
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

  // Upload using Google Cloud Storage REST API
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodeURIComponent(filePath)}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': mimeType,
      'Content-Length': buffer.length.toString(),
    },
    body: buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload file: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // Return the public URL
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;

  return publicUrl;
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

    // Delete using Google Cloud Storage REST API
    const deleteUrl = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o/${encodeURIComponent(filePath)}`;

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
    });

    // 404 is OK - file doesn't exist
    if (response.status === 404) {
      console.warn(`File not found for deletion, but this is okay: ${fileUrl}`);
      return { success: true };
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete file: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting file from URL ${fileUrl}:`, error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred during file deletion.' };
  }
}
