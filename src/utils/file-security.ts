import crypto from 'crypto';

/**
 * Comprehensive file security utilities
 * Provides protection against malicious file uploads and validation
 */

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    fileType: string;
    size: number;
    dimensions?: { width: number; height: number };
    hash: string;
  };
}

// Allowed MIME types for different file categories
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain'] as const;

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB for images
  document: 5 * 1024 * 1024, // 5MB for documents
  avatar: 2 * 1024 * 1024, // 2MB for avatars
} as const;

// Magic bytes for file type detection
const FILE_SIGNATURES = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // Actually checks for RIFF format
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
} as const;

/**
 * Validate file based on multiple security criteria
 */
export async function validateFile(
  fileData: Buffer | string,
  fileName: string,
  expectedType: 'image' | 'document' | 'avatar',
): Promise<FileValidationResult> {
  const result: FileValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Convert base64 to buffer if needed
    let buffer: Buffer;
    if (typeof fileData === 'string') {
      if (fileData.startsWith('data:')) {
        // Extract base64 data from data URL
        const base64Data = fileData.split(',')[1];
        if (!base64Data) {
          result.errors.push('Invalid data URL format');
          result.isValid = false;
          return result;
        }
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        buffer = Buffer.from(fileData, 'base64');
      }
    } else {
      buffer = fileData;
    }

    // 1. File size validation
    const maxSize = MAX_FILE_SIZES[expectedType];
    if (buffer.length > maxSize) {
      result.errors.push(
        `File size ${buffer.length} exceeds maximum allowed size ${maxSize}`,
      );
      result.isValid = false;
    }

    if (buffer.length === 0) {
      result.errors.push('File is empty');
      result.isValid = false;
      return result;
    }

    // 2. File name validation
    const fileNameErrors = validateFileName(fileName);
    if (fileNameErrors.length > 0) {
      result.errors.push(...fileNameErrors);
      result.isValid = false;
    }

    // 3. File signature/magic bytes validation
    const detectedType = detectFileType(buffer);
    if (!detectedType) {
      result.errors.push('Could not determine file type from content');
      result.isValid = false;
      return result;
    }

    // 4. Validate against expected types
    const allowedTypes =
      expectedType === 'image' || expectedType === 'avatar'
        ? ALLOWED_IMAGE_TYPES
        : ALLOWED_DOCUMENT_TYPES;

    if (!(allowedTypes as readonly string[]).includes(detectedType)) {
      result.errors.push(
        `File type ${detectedType} not allowed for ${expectedType} uploads`,
      );
      result.isValid = false;
    }

    // 5. Additional image-specific validation
    if (
      (expectedType === 'image' || expectedType === 'avatar') &&
      detectedType.startsWith('image/')
    ) {
      const imageValidation = await validateImageContent(buffer, detectedType);
      if (!imageValidation.isValid) {
        result.errors.push(...imageValidation.errors);
        result.warnings.push(...imageValidation.warnings);
        result.isValid = false;
      }

      // Avatar-specific constraints
      if (expectedType === 'avatar' && imageValidation.dimensions) {
        const { width, height } = imageValidation.dimensions;
        if (width > 1024 || height > 1024) {
          result.warnings.push(
            'Avatar image is larger than recommended 1024x1024',
          );
        }
        if (width < 64 || height < 64) {
          result.warnings.push(
            'Avatar image is smaller than recommended 64x64',
          );
        }
      }
    }

    // 6. Scan for embedded malicious content
    const malwareCheck = scanForMaliciousContent(buffer);
    if (!malwareCheck.isClean) {
      result.errors.push(...malwareCheck.issues);
      result.isValid = false;
    }

    // 7. Generate file hash for integrity
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    result.metadata = {
      fileType: detectedType,
      size: buffer.length,
      hash,
    };
  } catch (error) {
    result.errors.push(
      `File validation failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
    result.isValid = false;
  }

  return result;
}

/**
 * Validate file name for security
 */
function validateFileName(fileName: string): string[] {
  const errors: string[] = [];

  if (!fileName || fileName.trim().length === 0) {
    errors.push('File name is required');
    return errors;
  }

  // Check for path traversal attempts
  if (
    fileName.includes('..') ||
    fileName.includes('/') ||
    fileName.includes('\\')
  ) {
    errors.push('File name contains invalid path characters');
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];
  const baseName = fileName.split('.')[0].toUpperCase();
  if (reservedNames.includes(baseName)) {
    errors.push('File name uses reserved system name');
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*\u0000-\u001f]/;
  if (invalidChars.test(fileName)) {
    errors.push('File name contains invalid characters');
  }

  // Length check
  if (fileName.length > 255) {
    errors.push('File name is too long (max 255 characters)');
  }

  // Extension validation
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension) {
    errors.push('File must have an extension');
  } else {
    const allowedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'webp',
      'gif',
      'pdf',
      'txt',
    ];
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }

  return errors;
}

/**
 * Detect file type using magic bytes
 */
function detectFileType(buffer: Buffer): string | null {
  // Check PNG
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  // Check JPEG
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'image/jpeg';
  }

  // Check GIF
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46
  ) {
    return 'image/gif';
  }

  // Check WebP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  // Check PDF
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'application/pdf';
  }

  return null;
}

/**
 * Validate image content for additional security
 */
async function validateImageContent(
  buffer: Buffer,
  mimeType: string,
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dimensions?: { width: number; height: number };
}> {
  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  };

  try {
    // Basic image dimension extraction (simplified)
    let dimensions: { width: number; height: number } | undefined;

    if (mimeType === 'image/png') {
      dimensions = extractPNGDimensions(buffer);
    } else if (mimeType === 'image/jpeg') {
      dimensions = extractJPEGDimensions(buffer);
    }

    if (dimensions) {
      // Reasonable size limits
      if (dimensions.width > 10000 || dimensions.height > 10000) {
        result.errors.push('Image dimensions exceed maximum allowed size');
        result.isValid = false;
      }

      if (dimensions.width < 1 || dimensions.height < 1) {
        result.errors.push('Invalid image dimensions');
        result.isValid = false;
      }
    }

    return { ...result, dimensions };
  } catch (error) {
    result.errors.push('Failed to validate image content');
    result.isValid = false;
    return result;
  }
}

/**
 * Extract PNG dimensions
 */
function extractPNGDimensions(
  buffer: Buffer,
): { width: number; height: number } | undefined {
  if (buffer.length < 24) return undefined;

  // PNG IHDR chunk starts at byte 16
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height };
}

/**
 * Extract JPEG dimensions (simplified)
 */
function extractJPEGDimensions(
  buffer: Buffer,
): { width: number; height: number } | undefined {
  let offset = 2;

  while (offset < buffer.length - 4) {
    if (buffer[offset] === 0xff) {
      const marker = buffer[offset + 1];

      // SOF markers
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        if (offset + 9 < buffer.length) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
      }

      // Skip to next marker
      const segmentLength = buffer.readUInt16BE(offset + 2);
      offset += 2 + segmentLength;
    } else {
      offset++;
    }
  }

  return undefined;
}

/**
 * Scan for malicious content patterns
 */
function scanForMaliciousContent(buffer: Buffer): {
  isClean: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Convert buffer to string for pattern matching
  const content = buffer.toString('binary');

  // Check for embedded scripts
  const scriptPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
  ];

  for (const pattern of scriptPatterns) {
    if (pattern.test(content)) {
      issues.push('Potentially malicious script content detected');
      break;
    }
  }

  // Check for PHP code
  if (content.includes('<?php') || content.includes('<?=')) {
    issues.push('PHP code detected in file');
  }

  // Check for suspicious file signatures within the content
  const suspiciousPatterns = [
    'MZ', // PE executable
    'PK', // ZIP archive (could contain malware)
    '\x7fELF', // ELF executable
  ];

  for (const pattern of suspiciousPatterns) {
    if (content.includes(pattern)) {
      issues.push(`Suspicious content pattern detected: ${pattern}`);
    }
  }

  return {
    isClean: issues.length === 0,
    issues,
  };
}

/**
 * Generate secure filename
 */
export function generateSecureFileName(
  originalName: string,
  userId: string,
  prefix?: string,
): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const extension = originalName.split('.').pop()?.toLowerCase() || 'bin';
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);

  const components = [
    prefix,
    userId.substring(0, 8),
    timestamp,
    random,
    sanitizedName,
  ].filter(Boolean);

  return `${components.join('_')}.${extension}`;
}

/**
 * Content-based file type validation
 */
export function validateContentType(
  buffer: Buffer,
  declaredType: string,
): boolean {
  const detectedType = detectFileType(buffer);
  return detectedType === declaredType;
}
