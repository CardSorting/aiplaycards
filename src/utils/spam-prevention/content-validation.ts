import {
  ContentQualityMetrics,
  ContentValidationResult,
  ProfanityCheckResult,
  SpamPreventionConfig,
} from '../../types/spam-prevention';
import { getUserProfile } from './storage';
import { check } from 'leo-profanity';

/**
 * Validate content with intelligent quality scoring and profanity detection
 */
export function validateContent(
  content: string,
  config: SpamPreventionConfig,
  userId?: string,
): ContentValidationResult {
  const errors: string[] = [];

  if (!content || typeof content !== 'string') {
    errors.push('Content is required and must be a string');
    return { isValid: false, errors };
  }

  const trimmedContent = content.trim();

  // Basic validation
  if (trimmedContent.length < config.minContentLength) {
    errors.push(
      `Content must be at least ${config.minContentLength} characters long`,
    );
  }

  if (trimmedContent.length > config.maxContentLength) {
    errors.push(
      `Content must be ${config.maxContentLength} characters or less`,
    );
  }

  // Intelligent content quality scoring
  let qualityScore: number | undefined;
  if (config.enableContentQualityScoring) {
    const qualityMetrics = calculateContentQuality(trimmedContent);
    qualityScore = qualityMetrics.overallScore;

    // Adaptive quality threshold based on user reputation
    if (userId) {
      const profile = getUserProfile(userId);
      const requiredQuality =
        profile.adaptiveThresholds.contentQualityThreshold;

      if (qualityScore < requiredQuality) {
        errors.push(
          `Content quality score (${qualityScore}) is below the required threshold (${requiredQuality})`,
        );
      }
    }
  }

  // Enhanced pattern detection with machine learning concepts
  if (config.enableAnomalyDetection) {
    // Check for repetitive characters with adaptive thresholds
    const repetitiveCharThreshold = content.length > 100 ? 6 : 4; // Longer content gets more lenient
    if (
      new RegExp(`(.)\\1{${repetitiveCharThreshold},}`).test(trimmedContent)
    ) {
      errors.push(
        `Content contains too many repeated characters (max: ${repetitiveCharThreshold})`,
      );
    }

    // Check for suspicious patterns with weighted scoring
    let patternScore = 0;
    config.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(trimmedContent)) {
        patternScore += (index + 1) * 10; // Weight patterns by importance
      }
    });

    if (patternScore > 50) {
      errors.push('Content matches multiple suspicious patterns');
    }
  }

  // Spam keyword detection with context awareness
  const contentLower = trimmedContent.toLowerCase();
  const foundSpamKeywords = config.spamKeywords.filter(keyword =>
    contentLower.includes(keyword.toLowerCase()),
  );

  // Adaptive keyword threshold based on content length
  const keywordThreshold = Math.max(1, Math.floor(content.length / 100));
  if (foundSpamKeywords.length >= keywordThreshold) {
    errors.push(
      `Content contains too many spam keywords: ${foundSpamKeywords.join(
        ', ',
      )}`,
    );
  }

  // Intelligent repetitive word detection
  const words = trimmedContent.split(/\s+/);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniqueRatio = words.length > 0 ? uniqueWords.size / words.length : 1;

  // Adaptive threshold based on content length
  const minUniqueRatio =
    words.length > 20 ? 0.4 : words.length > 10 ? 0.5 : 0.6;
  if (uniqueRatio < minUniqueRatio) {
    errors.push('Content appears to contain repetitive words');
  }

  // Profanity detection
  const profanityCheck = detectProfanity(trimmedContent, config);

  if (profanityCheck.hasProfanity) {
    if (profanityCheck.action === 'block') {
      errors.push(
        `Content contains inappropriate language: ${profanityCheck.profaneWords.join(
          ', ',
        )}`,
      );
    } else if (profanityCheck.action === 'warn') {
      errors.push(
        `Content contains inappropriate language. Please review your submission.`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    qualityScore,
    profanityCheck,
  };
}

/**
 * Detect profanity in content using leo-profanity
 */
function detectProfanity(
  content: string,
  config: SpamPreventionConfig,
): ProfanityCheckResult {
  if (!config.enableProfanityFilter) {
    return { hasProfanity: false, profaneWords: [], action: 'warn' };
  }

  // Check for profanity using leo-profanity
  const profaneWords: string[] = [];
  const words = content.toLowerCase().split(/\s+/);

  words.forEach(word => {
    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord && check(cleanWord)) {
      profaneWords.push(cleanWord);
    }
  });

  const hasProfanity = profaneWords.length > config.profanityThreshold;

  return {
    hasProfanity,
    profaneWords: [...new Set(profaneWords)], // Remove duplicates
    action: config.profanityAction,
  };
}

/**
 * Calculate content quality score using multiple metrics
 */
function calculateContentQuality(content: string): ContentQualityMetrics {
  const words = content.trim().split(/\s+/);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));

  // Readability score (Flesch Reading Ease approximation)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const syllables = content.toLowerCase().replace(/[^a-z]/g, '').length * 0.4; // Approximation
  const readability = Math.max(
    0,
    Math.min(
      100,
      206.835 -
        (1.015 * words.length) / sentences.length -
        (84.6 * syllables) / words.length,
    ),
  );

  // Uniqueness score (vocabulary diversity)
  const uniqueness =
    words.length > 0 ? (uniqueWords.size / words.length) * 100 : 0;

  // Complexity score (word length and variety)
  const avgWordLength =
    words.reduce((sum, word) => sum + word.length, 0) / words.length;
  const complexity = Math.min(
    100,
    (avgWordLength - 3) * 20 + (uniqueWords.size / words.length) * 50,
  );

  // Relevance score (based on content length and structure)
  const relevance = Math.min(
    100,
    Math.max(
      0,
      (content.length / 100) * 30 +
        (sentences.length / 5) * 20 +
        (uniqueWords.size / 10) * 50,
    ),
  );

  // Overall score (weighted average)
  const overallScore =
    readability * 0.25 +
    uniqueness * 0.25 +
    complexity * 0.25 +
    relevance * 0.25;

  return {
    readability: Math.round(readability),
    uniqueness: Math.round(uniqueness),
    complexity: Math.round(complexity),
    relevance: Math.round(relevance),
    overallScore: Math.round(overallScore),
  };
}
