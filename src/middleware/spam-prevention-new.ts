import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../auth';
import {
  SpamPreventionConfig,
  SpamPreventionError,
  SpamPreventionOptions,
} from '../types/spam-prevention';
import { defaultSpamConfig } from '../config/spam-prevention';
import {
  analyzeUserBehavior,
  checkRateLimit,
  getUserBehaviorAnalytics,
  getUserRateLimitStatus,
  isUserSuspicious,
  markUserSuspicious,
  resetUserBehavior,
  updateUserProfile,
  validateContent,
} from '../utils/spam-prevention';

/**
 * Spam prevention middleware wrapper
 * Provides comprehensive protection against spam, abuse, and suspicious behavior
 */
export async function withSpamPrevention(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  config: SpamPreventionConfig = defaultSpamConfig,
  options: SpamPreventionOptions = {},
) {
  const {
    requireAuth = true,
    validateContent: shouldValidateContent = true,
    contentField = 'description',
  } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Authentication check
      let user = null;
      if (requireAuth) {
        const session = await auth();
        if (!session?.user?.id) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 },
          );
        }
        user = session.user;
      }

      // Enhanced user behavior analysis
      if (user && user.id) {
        const behavior = analyzeUserBehavior(user.id, request, config);
        if (behavior.suspicious) {
          console.warn(
            `[SpamPrevention] Suspicious behavior detected for user ${
              user.id
            }: ${behavior.reason || 'Unknown reason'}${
              behavior.anomalyScore
                ? ` (Anomaly: ${behavior.anomalyScore})`
                : ''
            }`,
          );

          // Update user profile with suspicious action
          updateUserProfile(
            user.id,
            false,
            undefined,
            behavior.reason || 'suspicious_behavior',
          );

          // Return appropriate error response
          return NextResponse.json(
            {
              error: 'Suspicious activity detected',
              message:
                'Your request has been flagged for review. Please try again later.',
              reason: behavior.reason || 'Unknown reason',
              anomalyScore: behavior.anomalyScore,
            },
            { status: 403 },
          );
        }
      }

      // Intelligent rate limiting with adaptive thresholds
      if (user && user.id) {
        const rateLimit = checkRateLimit(user.id, config);
        if (!rateLimit.allowed) {
          const retryAfter = Math.ceil(
            (rateLimit.resetTime - Date.now()) / 1000,
          );

          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              message:
                'Too many requests. Please wait before making more requests.',
              retryAfter,
              resetTime: rateLimit.resetTime,
            },
            {
              status: 429,
              headers: {
                'X-RateLimit-Reset': rateLimit.resetTime.toString(),
                'Retry-After': retryAfter.toString(),
              },
            },
          );
        }
      }

      // Intelligent content validation with quality scoring and profanity detection
      if (shouldValidateContent && request.method === 'POST') {
        try {
          const body = await request.json();
          const content =
            body[contentField || 'content'] ||
            body.content ||
            body.text ||
            body.description;

          if (content) {
            const contentValidation = validateContent(
              content,
              config,
              user?.id,
            );
            if (!contentValidation.isValid) {
              // Update user profile with failed validation
              if (user && user.id) {
                updateUserProfile(
                  user.id,
                  false,
                  contentValidation.qualityScore,
                  'content_validation_failed',
                );
              }

              // Check if profanity was detected
              let errorMessage = 'Content validation failed';
              let errorDetails = contentValidation.errors;

              if (contentValidation.profanityCheck?.hasProfanity) {
                if (contentValidation.profanityCheck.action === 'block') {
                  errorMessage = 'Content contains inappropriate language';
                  errorDetails = contentValidation.errors.filter(
                    (error: string) => error.includes('inappropriate language'),
                  );
                } else if (contentValidation.profanityCheck.action === 'warn') {
                  errorMessage =
                    'Content validation failed - please review for inappropriate language';
                }
              }

              return NextResponse.json(
                {
                  error: errorMessage,
                  message: 'Content does not meet quality standards',
                  details: errorDetails,
                  qualityScore: contentValidation.qualityScore,
                  profanityDetected:
                    contentValidation.profanityCheck?.hasProfanity || false,
                  profaneWords:
                    contentValidation.profanityCheck?.profaneWords || [],
                },
                { status: 400 },
              );
            }

            // Update user profile with successful validation
            if (
              user &&
              user.id &&
              contentValidation.qualityScore !== undefined
            ) {
              updateUserProfile(user.id, true, contentValidation.qualityScore);
            }

            // Log profanity detection for monitoring (even if not blocked)
            if (
              contentValidation.profanityCheck?.hasProfanity &&
              contentValidation.profanityCheck.action === 'flag'
            ) {
              console.warn(
                `[SpamPrevention] Profanity flagged for user ${
                  user?.id
                }: ${contentValidation.profanityCheck.profaneWords.join(', ')}`,
              );
            }
          }
        } catch (error: any) {
          // If JSON parsing fails, continue (might be form data)
          console.warn(
            '[SpamPrevention] Failed to parse request body for content validation:',
            error,
          );
        }
      }

      // Call the actual handler
      const response = await handler(request, user);

      // Update user profile with successful request
      if (user && user.id) {
        updateUserProfile(user.id, true);
      }

      return response;
    } catch (error: any) {
      console.error(
        '[SpamPrevention] Error in spam prevention middleware:',
        error,
      );

      if (error instanceof SpamPreventionError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            retryAfter: error.retryAfter,
          },
          {
            status: error.statusCode,
            headers: error.retryAfter
              ? { 'Retry-After': error.retryAfter.toString() }
              : {},
          },
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  };
}

// Re-export utility functions for external use
export {
  isUserSuspicious,
  markUserSuspicious,
  resetUserBehavior,
  getUserRateLimitStatus,
  getUserBehaviorAnalytics,
};

// Re-export defaultSpamConfig for external use
export { defaultSpamConfig } from '../config/spam-prevention';
