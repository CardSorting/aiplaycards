import crypto from 'crypto';

interface BackblazeConfig {
  applicationKeyId: string;
  applicationKey: string;
  bucketId?: string; // Optional, will be fetched if not provided
  bucketName: string;
}

interface BackblazeAuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  accountId: string;
}

interface BackblazeUploadUrlResponse {
  uploadUrl: string;
  authorizationToken: string;
}

// Removed unused interface BackblazeUploadResponse

// Removed unused interface BackblazeBucket

class BackblazeStorage {
  private config: BackblazeConfig;
  private authToken: string | null = null;
  private apiUrl: string | null = null;
  private downloadUrl: string | null = null;
  private accountId: string | null = null;
  private bucketId: string | null = null;

  constructor(config: BackblazeConfig) {
    this.config = config;
    this.bucketId = config.bucketId || null;
  }

  private async authenticate(): Promise<void> {
    const credentials = Buffer.from(
      `${this.config.applicationKeyId}:${this.config.applicationKey}`,
    ).toString('base64');

    const response = await fetch(
      'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Backblaze authentication failed: ${response.statusText}`,
      );
    }

    const data: BackblazeAuthResponse = await response.json();
    this.authToken = data.authorizationToken;
    this.apiUrl = data.apiUrl;
    this.downloadUrl = data.downloadUrl;
    this.accountId = data.accountId;
  }

  private async getBucketId(): Promise<string> {
    if (this.bucketId) {
      return this.bucketId;
    }

    // If we have a bucket ID configured, use it
    if (this.config.bucketId) {
      this.bucketId = this.config.bucketId;
      return this.bucketId;
    }

    // For application keys with restricted permissions, we may not be able to list buckets
    // Try to get upload URL directly using bucket name - this will fail if bucket doesn't exist
    // but will give us a more specific error
    throw new Error(
      `Bucket ID not configured. Please add B2_BUCKET_ID to your environment variables. ` +
        `You can find this in your Backblaze B2 console for bucket "${this.config.bucketName}".`,
    );
  }

  private async getUploadUrl(): Promise<BackblazeUploadUrlResponse> {
    if (!this.authToken || !this.apiUrl) {
      await this.authenticate();
    }

    const bucketId = await this.getBucketId();

    const response = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        Authorization: this.authToken!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bucketId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }

    return response.json();
  }

  public async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType = 'application/octet-stream',
  ): Promise<string> {
    const uploadUrlData = await this.getUploadUrl();
    const sha1Hash = crypto.createHash('sha1').update(fileBuffer).digest('hex');

    const response = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: uploadUrlData.authorizationToken,
        'X-Bz-File-Name': encodeURIComponent(fileName),
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'X-Bz-Content-Sha1': sha1Hash,
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.statusText}`);
    }

    // Upload response is not used, but we need to await it to ensure upload completes
    await response.json();

    // Return the public download URL using configured public URL or fallback to API URL
    const publicUrl =
      process.env.B2_PUBLIC_URL ||
      `${this.downloadUrl}/file/${this.config.bucketName}`;
    return `${publicUrl}/${fileName}`;
  }

  public async uploadBase64Image(
    base64Data: string,
    fileName: string,
  ): Promise<string> {
    // Extract the base64 data without the data URL prefix
    const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid base64 data URL format');
    }

    const mimeType = base64Match[1];
    const base64Content = base64Match[2];
    const fileBuffer = Buffer.from(base64Content, 'base64');

    return this.uploadFile(fileBuffer, fileName, mimeType);
  }
}

// Create and export a singleton instance
const backblazeConfig: BackblazeConfig = {
  applicationKeyId: process.env.B2_KEY_ID || '',
  applicationKey: process.env.B2_APP_KEY || '',
  bucketId: process.env.B2_BUCKET_ID, // Optional bucket ID if known
  bucketName: process.env.B2_BUCKET || '',
};

export const backblazeStorage = new BackblazeStorage(backblazeConfig);

export function validateBackblazeConfig(): void {
  const requiredVars = ['B2_KEY_ID', 'B2_APP_KEY', 'B2_BUCKET'];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Backblaze environment variables: ${missing.join(', ')}`,
    );
  }
}

export function generateImageFileName(
  userId: string,
  cardName: string,
  type: 'background' | 'layer',
): string {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const sanitizedName = cardName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();

  return `cards/${userId}/${type}_${sanitizedName}_${timestamp}_${randomId}.jpg`;
}

export function generateYugiohCardFileName(
  userId: string,
  cardName: string,
): string {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const sanitizedName = cardName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();

  return `yugioh-cards/${userId}/yugioh_${sanitizedName}_${timestamp}_${randomId}.png`;
}

export function generateMTGCardFileName(
  userId: string,
  cardName: string,
): string {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const sanitizedName = cardName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();

  return `mtg-cards/${userId}/mtg_${sanitizedName}_${timestamp}_${randomId}.png`;
}
