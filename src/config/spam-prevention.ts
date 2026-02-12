import { SpamPreventionConfig } from '../types/spam-prevention';

// Default configuration
export const defaultSpamConfig: SpamPreventionConfig = {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100,
  maxRequestsPerDay: 1000,
  minContentLength: 10,
  maxContentLength: 10000,
  maxRepetitiveCharacters: 5,
  maxRepetitiveWords: 3,
  suspiciousPatterns: [
    /(.)\1{5,}/, // 6+ repeated characters
    /(test|spam|fake|dummy|temp|tmp|asdf|qwerty|123|abc){3,}/i, // Repeated spam words
    /^[a-z]+$/i, // All letters (too generic)
    /^[0-9]+$/, // All numbers
  ],
  spamKeywords: [
    'test',
    'spam',
    'fake',
    'dummy',
    'temp',
    'tmp',
    'asdf',
    'qwerty',
    '123',
    'abc',
    'word',
    'text',
    'description',
    'sample',
    'example',
    'placeholder',
  ],
  maxFailedAttempts: 5,
  suspiciousUserAgentPatterns: [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /node/i,
    /postman/i,
    /insomnia/i,
    /httpie/i,
    /httpx/i,
    /requests/i,
  ],
  maxImageSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  enableAdaptiveThresholds: true,
  enableUserReputation: true,
  enableContentQualityScoring: true,
  enableBehavioralAnalysis: true,
  enableAnomalyDetection: true,
  enableProfanityFilter: true,
  profanityAction: 'block',
  profanityThreshold: 0,
};
