// Stub auth module for compatibility
// Since auth is not being used in this React + Express app,
// this module provides mock implementations to satisfy imports

export interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

export interface Session {
    user?: User;
}

/**
 * Mock auth function that returns null session
 * Replace with actual auth implementation when needed
 */
export async function auth(): Promise<Session | null> {
    // Return null to indicate no authenticated user
    // API routes should handle this by checking for userId in request body/query
    return null;
}

/**
 * Mock signIn function
 */
export async function signIn(
    provider: string,
    options?: Record<string, unknown>
): Promise<{ error?: string; url?: string }> {
    return { error: 'Auth not implemented' };
}

/**
 * Mock signOut function
 */
export async function signOut(
    options?: Record<string, unknown>
): Promise<void> {
    // No-op
}

export default auth;
