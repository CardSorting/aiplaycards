// Spam prevention configuration
export interface SpamPreventionConfig {
  // Rate limiting
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;

  // Content validation
  minContentLength: number;
  maxContentLength: number;
  maxRepetitiveCharacters: number;
  maxRepetitiveWords: number;

  // Suspicious pattern detection
  suspiciousPatterns: RegExp[];
  spamKeywords: string[];

  // User behavior analysis
  maxFailedAttempts: number;
  suspiciousUserAgentPatterns: RegExp[];

  // Image validation
  maxImageSize: number; // in bytes
  allowedImageTypes: string[];

  // Intelligent features
  enableAdaptiveThresholds: boolean;
  enableUserReputation: boolean;
  enableContentQualityScoring: boolean;
  enableBehavioralAnalysis: boolean;
  enableAnomalyDetection: boolean;

  // Profanity detection
  enableProfanityFilter: boolean;
  profanityAction: 'block' | 'flag' | 'warn'; // What to do when profanity is detected
  profanityThreshold: number; // How many profane words before action (0 = any profanity)
}

// Enhanced user behavior tracking with reputation scoring
export interface UserBehaviorProfile {
  userId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  suspiciousFlags: number;
  lastActivity: number;
  reputationScore: number; // 0-100, higher is better
  contentQualityScores: number[]; // Rolling average of content quality
  behavioralPatterns: {
    requestTiming: number[]; // Time between requests
    contentVariety: number; // Diversity of content
    errorPatterns: string[]; // Types of errors encountered
    suspiciousActions: string[]; // Suspicious behaviors detected
  };
  adaptiveThresholds: {
    rateLimitMultiplier: number; // Adjusts rate limits based on reputation
    contentQualityThreshold: number; // Minimum quality score required
    suspiciousFlagThreshold: number; // How many flags before action
  };
}

// Content quality scoring interface
export interface ContentQualityMetrics {
  readability: number; // 0-100
  uniqueness: number; // 0-100
  complexity: number; // 0-100
  relevance: number; // 0-100
  overallScore: number; // 0-100
}

// Anomaly detection interface
export interface AnomalyScore {
  timingAnomaly: number; // 0-100, higher = more anomalous
  contentAnomaly: number; // 0-100, higher = more anomalous
  behaviorAnomaly: number; // 0-100, higher = more anomalous
  overallAnomaly: number; // 0-100, higher = more anomalous
}

// Profanity check result
export interface ProfanityCheckResult {
  hasProfanity: boolean;
  profaneWords: string[];
  action: 'block' | 'flag' | 'warn';
}

// Content validation result
export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  qualityScore?: number;
  profanityCheck?: ProfanityCheckResult;
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// User behavior analysis result
export interface UserBehaviorAnalysisResult {
  suspicious: boolean;
  reason?: string;
  anomalyScore?: number;
}

// Rate limit status with reputation info
export interface UserRateLimitStatus {
  remaining: number;
  resetTime: number;
  suspicious: boolean;
  reputationScore: number;
  contentQualityThreshold: number;
  rateLimitMultiplier: number;
}

// User behavior analytics result
export interface UserBehaviorAnalyticsResult {
  profile: UserBehaviorProfile;
  contentQualityTrend: number[];
  behavioralPatterns: any;
  anomalyScore?: AnomalyScore;
}

// Spam prevention middleware options
export interface SpamPreventionOptions {
  requireAuth?: boolean;
  validateContent?: boolean;
  contentField?: string;
}

// Spam prevention error class
export class SpamPreventionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 429,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'SpamPreventionError';
  }
}
