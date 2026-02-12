'use client';

import { useEffect, useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { UserMinusIcon } from '@heroicons/react/24/solid';

interface CollectionFollowButtonProps {
  collectionId: number;
  initialFollowersCount?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
  className?: string;
}

export default function CollectionFollowButton({
  collectionId,
  initialFollowersCount = 0,
  size = 'md',
  variant = 'button',
  className = '',
}: CollectionFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  const fetchFollowStatus = async () => {
    try {
      const response = await fetch(
        `/api/collections/social/follows/status?collectionId=${collectionId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
      }
    } catch (err) {
      console.error('Failed to fetch follow status:', err);
    }
  };

  const handleToggleFollow = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/collections/social/follows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle follow');
      }

      const data = await response.json();
      setIsFollowing(data.following);
      setFollowersCount(prev => (data.following ? prev + 1 : prev - 1));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to follow collection',
      );
      console.error('Follow toggle error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSize = sizeClasses[size];

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        title={isFollowing ? 'Unfollow collection' : 'Follow collection'}
      >
        {isFollowing ? (
          <UserMinusIcon className={`${iconSize} text-red-500`} />
        ) : (
          <UserPlusIcon
            className={`${iconSize} text-gray-400 hover:text-blue-400`}
          />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isFollowing
          ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : isFollowing ? (
        <UserMinusIcon className={iconSize} />
      ) : (
        <UserPlusIcon className={iconSize} />
      )}
      <span className="font-medium">{followersCount}</span>
      <span className="hidden sm:inline">
        Follower{followersCount !== 1 ? 's' : ''}
      </span>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-50">
          {error}
        </div>
      )}
    </button>
  );
}
