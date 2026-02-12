'use client';

'use client';

import { useCallback, useEffect, useState } from 'react';

interface CollectionLikeButtonProps {
  collectionId: number;
  initialLikesCount?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
  className?: string;
}

export default function CollectionLikeButton({
  collectionId,
  initialLikesCount = 0,
  size = 'md',
  variant = 'button',
  className = '',
}: CollectionLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLikeStatus = useCallback(async () => {
    try {
      // Check if user has liked this collection
      const response = await fetch(
        `/api/collections/social/likes/status?collectionId=${collectionId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (err) {
      console.error('Failed to fetch like status:', err);
    }
  }, [collectionId]);

  useEffect(() => {
    // Fetch current like status when component mounts
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  const handleToggleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/collections/social/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount(prev => (data.liked ? prev + 1 : prev - 1));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to like collection',
      );
      console.error('Like toggle error:', err);
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
        onClick={handleToggleLike}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        title={isLiked ? 'Unlike collection' : 'Like collection'}
      >
        {isLiked ? (
          <svg
            className={`${iconSize} text-red-500`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        ) : (
          <svg
            className={`${iconSize} text-gray-400 hover:text-red-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C3.099 3.75 1 5.765 1 8.25c0 7.22 9.92 12.71 10.25 12.898a.933.933 0 00.53 0c.28-.151 10.25-5.638 10.25-12.898z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isLiked
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : isLiked ? (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg
          className={iconSize}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C3.099 3.75 1 5.765 1 8.25c0 7.22 9.92 12.71 10.25 12.898a.933.933 0 00.53 0c.28-.151 10.25-5.638 10.25-12.898z" />
        </svg>
      )}
      <span className="font-medium">{likesCount}</span>
      <span className="hidden sm:inline">
        Like{likesCount !== 1 ? 's' : ''}
      </span>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-50">
          {error}
        </div>
      )}
    </button>
  );
}
