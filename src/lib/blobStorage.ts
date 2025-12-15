// Vercel Blob storage with fallback to local
import type { ResumeUploadPayload } from "@/types";
import { saveResumeFile as saveLocalFile } from "./dataStore";

interface BlobClient {
  put: (filename: string, body: Buffer, options: { access: "public"; addRandomSuffix: boolean }) => Promise<{ url: string }>;
}

let blobClient: BlobClient | null = null;

// Try to import Vercel Blob
try {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const vercelBlob = await import("@vercel/blob");
    blobClient = { put: vercelBlob.put as BlobClient["put"] };
  }
} catch {
  blobClient = null;
}

const IS_BLOB_AVAILABLE = !!blobClient;

/**
 * Upload resume file to Vercel Blob, local storage, or data URL
 */
export async function uploadResume(
  payload: ResumeUploadPayload
): Promise<string> {
  if (IS_BLOB_AVAILABLE && blobClient && payload.base64) {
    try {
      // Convert base64 to Buffer
      const base64Data = payload.base64.split(",")[1] || payload.base64;
      const buffer = Buffer.from(base64Data, "base64");

      // Upload to Vercel Blob
      const blob = await blobClient.put(payload.fileName, buffer, {
        access: "public",
        addRandomSuffix: true,
      });

      console.log("✅ File uploaded to Vercel Blob:", blob.url);
      return blob.url;
    } catch (error) {
      console.error("Vercel Blob upload failed, using fallback:", error);
    }
  }

  // Fallback: local storage (dev) or data URL (serverless)
  // saveLocalFile handles both cases automatically
  return saveLocalFile(payload);
}

/**
 * Check if Vercel Blob is available
 */
export function isBlobStorageAvailable(): boolean {
  return IS_BLOB_AVAILABLE;
}
