'use client';

import { useEffect, useState } from 'react';
import StarRating from './StarRating';

interface CollectionRatingButtonProps {
  collectionId: number;
  size?: 'small' | 'medium' | 'large';
  showStats?: boolean;
  className?: string;
}

export default function CollectionRatingButton({
  collectionId,
  size = 'small',
  showStats = false,
  className = '',
}: CollectionRatingButtonProps) {
  const [rating, setRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRating();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  const fetchRating = async () => {
    try {
      const response = await fetch(
        `/api/collections/social/ratings?collectionId=${collectionId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setRating(data.averageRating || 0);
        setRatingCount(data.ratingCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch collection rating:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    try {
      const response = await fetch('/api/collections/social/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
          rating: newRating,
        }),
      });

      if (response.ok) {
        // Refresh the rating data after submitting
        fetchRating();
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-16"></div>
        {showStats && (
          <div className="animate-pulse bg-gray-200 rounded h-3 w-8"></div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div onClick={e => e.stopPropagation()}>
        <StarRating
          rating={rating}
          readOnly={false}
          onChange={handleRatingChange}
          size={size}
        />
      </div>

      {showStats && ratingCount > 0 && (
        <span className="text-xs text-gray-500">({ratingCount})</span>
      )}
    </div>
  );
}
