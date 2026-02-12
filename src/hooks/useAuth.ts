import { useAuth as useCustomAuth } from '../../app/AuthProvider';

// Compatibility hook that mimics NextAuth's useSession
export function useSession() {
  const { user, loading } = useCustomAuth();

  return {
    data: user
      ? {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      : null,
    status: loading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
  };
}

// Compatibility functions that mimic NextAuth's signIn/signOut
export async function signIn(_provider?: string, _options?: any) {
  // For now, just redirect to signin page
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
}

export async function signOut(_options?: any) {
  // For now, just redirect since we can't call hooks outside components
  if (typeof window !== 'undefined') {
    window.location.href = '/api/auth/logout';
  }
}
