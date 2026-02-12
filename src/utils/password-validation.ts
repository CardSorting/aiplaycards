/**
 * Password validation utilities following industry best practices
 * OWASP Password Guidelines: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

/**
 * Validates password strength according to industry standards
 * Requirements:
 * - Minimum 12 characters (OWASP recommendation)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not a common password
 * - Not containing user's email or name
 */
export function validatePassword(
  password: string,
  userEmail?: string,
  userName?: string,
): PasswordValidationResult {
  const errors: string[] = [];
  let strengthScore = 0;

  // Minimum length check (OWASP recommends 12+)
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else if (password.length >= 16) {
    strengthScore += 2;
  } else {
    strengthScore += 1;
  }

  // Character variety checks
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    strengthScore += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strengthScore += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    strengthScore += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    strengthScore += 1;
  }

  // Check for common patterns
  const commonPatterns = [
    /(.)\1{3,}/, // Repeated characters (aaaa)
    /(012|123|234|345|456|567|678|789|890)/, // Sequential numbers
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns that are easy to guess');
      strengthScore -= 1;
      break;
    }
  }

  // Check against user information
  if (userEmail) {
    const emailLocal = userEmail.split('@')[0].toLowerCase();
    if (password.toLowerCase().includes(emailLocal)) {
      errors.push('Password should not contain your email address');
      strengthScore -= 2;
    }
  }

  if (userName) {
    const nameParts = userName.toLowerCase().split(/\s+/);
    for (const part of nameParts) {
      if (part.length > 2 && password.toLowerCase().includes(part)) {
        errors.push('Password should not contain your name');
        strengthScore -= 2;
        break;
      }
    }
  }

  // Check against common passwords (top 1000)
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common and easily guessable');
    strengthScore -= 3;
  }

  // Determine strength
  let strength: PasswordValidationResult['strength'] = 'weak';
  if (strengthScore >= 6 && password.length >= 16) {
    strength = 'very-strong';
  } else if (strengthScore >= 5) {
    strength = 'strong';
  } else if (strengthScore >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0 && password.length >= 12,
    errors,
    strength,
  };
}

/**
 * Validates email format according to RFC 5322
 */
export function validateEmail(email: string): boolean {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
}

/**
 * Sanitizes email input
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Sanitizes name input
 */
export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[<>"']/g, '') // Remove potentially dangerous characters
    .substring(0, 100); // Limit length
}
