import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

type UploadResult = {
  key: string;
  url: string | null;
  contentType: string;
  size: number;
};

let s3Client: S3Client | null = null;

const requiredEnv = [
  'B2_ENDPOINT',
  'B2_REGION',
  'B2_BUCKET',
  'B2_KEY_ID',
  'B2_APP_KEY',
];

function isConfigured(): boolean {
  return requiredEnv.every(name => !!process.env[name]);
}

function ensureConfigured() {
  if (!isConfigured()) {
    const missing = requiredEnv.filter(name => !process.env[name]);
    throw new Error(
      `Backblaze B2 not configured. Missing: ${missing.join(', ')}`,
    );
  }
}

function getClient(): S3Client {
  ensureConfigured();
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.B2_REGION!,
      endpoint: process.env.B2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APP_KEY!,
      },
      forcePathStyle: false,
    });
  }
  return s3Client;
}

function extFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  return map[contentType] || 'bin';
}

function buildKey(prefix: string | undefined, contentType: string): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const ext = extFromContentType(contentType);
  const id = randomUUID();
  const safePrefix = (prefix || 'images').replace(/^\/+|\/+$/g, '');
  return `${safePrefix}/${yyyy}/${mm}/${dd}/${id}.${ext}`;
}

function buildBaseKey(prefix: string | undefined): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const id = randomUUID();
  const safePrefix = (prefix || 'images').replace(/^\/+|\/+$/g, '');
  return `${safePrefix}/${yyyy}/${mm}/${dd}/${id}`;
}

function getPublicUrl(key: string): string | null {
  const base = process.env.B2_PUBLIC_URL || '';
  if (!base) return null;
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${trimmed}/${key}`;
}

function parseDataUrl(dataUrl: string): {
  contentType: string;
  buffer: Buffer;
} {
  const match = /^data:([^;]+);base64,(.*)$/i.exec(dataUrl);
  if (!match) throw new Error('Invalid data URL');
  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  return { contentType, buffer };
}

export const backblazeStorage = {
  isConfigured,
  ensureConfigured,

  async uploadBuffer(
    buffer: Buffer,
    contentType: string,
    options?: { keyPrefix?: string; key?: string },
  ): Promise<UploadResult> {
    const client = getClient();
    const bucket = process.env.B2_BUCKET!;
    const key = options?.key || buildKey(options?.keyPrefix, contentType);

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return {
      key,
      url: getPublicUrl(key),
      contentType,
      size: buffer.length,
    };
  },

  async uploadDataUrl(
    dataUrl: string,
    options?: { keyPrefix?: string; key?: string },
  ): Promise<UploadResult> {
    const { contentType, buffer } = parseDataUrl(dataUrl);
    return this.uploadBuffer(buffer, contentType, options);
  },

  async uploadImageVariantsFromDataUrl(
    dataUrl: string,
    options?: { keyPrefix?: string; webpQuality?: number; thumbWidth?: number },
  ): Promise<{
    url: string | null;
    thumbUrl: string | null;
    key: string;
    thumbKey: string;
    contentType: string;
  }> {
    const { buffer } = parseDataUrl(dataUrl);
    const quality = Math.max(50, Math.min(95, options?.webpQuality ?? 82));
    const thumbWidth = Math.max(
      160,
      Math.min(1024, options?.thumbWidth ?? 480),
    );

    // Transcode to WebP
    const mainWebp = await sharp(buffer).webp({ quality }).toBuffer();
    const thumbWebp = await sharp(buffer)
      .resize({ width: thumbWidth, withoutEnlargement: true })
      .webp({ quality: Math.max(50, Math.min(90, Math.floor(quality * 0.9))) })
      .toBuffer();

    const baseKey = buildBaseKey(options?.keyPrefix);
    const mainKey = `${baseKey}.webp`;
    const thumbKey = `${baseKey}_thumb.webp`;

    const client = getClient();
    const bucket = process.env.B2_BUCKET!;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: mainKey,
        Body: mainWebp,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: thumbKey,
        Body: thumbWebp,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return {
      url: getPublicUrl(mainKey),
      thumbUrl: getPublicUrl(thumbKey),
      key: mainKey,
      thumbKey,
      contentType: 'image/webp',
    };
  },

  async uploadVideoFromUrl(
    videoUrl: string,
    options?: { keyPrefix?: string; contentType?: string },
  ): Promise<UploadResult> {
    // Fetch the video from the URL
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch video: ${response.status} ${response.statusText}`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType =
      options?.contentType ||
      response.headers.get('content-type') ||
      'video/mp4';

    const client = getClient();
    const bucket = process.env.B2_BUCKET!;
    const key = buildKey(options?.keyPrefix || 'videos', contentType);

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return {
      key,
      url: getPublicUrl(key),
      contentType,
      size: buffer.length,
    };
  },
};
