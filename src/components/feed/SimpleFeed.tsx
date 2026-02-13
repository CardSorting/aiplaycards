import { useSession } from '@hooks/useSession';

import { FC, useCallback, useEffect, useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { normalizeCardData } from '@components/CardDisplayWrapper';
// import { getEngagementInsights } from '../../utils/engagement-tracker';
import FeedHeader from './FeedHeader';
import FeedPost from './FeedPost';
import FeedSkeleton from './FeedSkeleton';
import EmptyState from './EmptyState';
import { CardAbility, CardMove } from '@components/CardDisplayWrapper/types';
import { CardInterface } from '@features/cardEditor/types';

interface AnimatedCard {
  id: number;
  name: string;
  description: string;
  type: string;
  subtype: string;
  supertype: string;
  rarity: string;
  hitpoints: number;
  cardNumber: string;
  totalInSet: number;
  illustrator: string;

  dexStats?: string;
  moves?: CardMove[] | { move1?: CardMove; move2?: CardMove };
  ability?: CardAbility;
  weakness?: unknown; // Keep as unknown for now
  resistance?: unknown; // Keep as unknown for now
  retreatCost?: number;
  imageData?: {
    dataUrl?: string;
    width?: number;
    height?: number;
    generated?: string[];
    thumbs?: string[];
  };
  cardEditorState?: CardInterface;
  animationUrl?: string;
  animationKey?: string;
  animationPrompt?: string;
  animatedAt?: string;
  createdAt: string;
  isPublic: boolean;
  userId?: string;
  username?: string;
  userAvatar?: string;
  likesCount: number;
  isLiked: boolean;
  isFollowedUser: boolean;
  rankingScore?: number;
  engagementVelocity?: number;
  contentFreshness?: number;
  creatorAuthority?: number;
}

interface SimpleFeedProps {
  limit?: number;
}

type SortOption = 'ranked' | 'latest' | 'trending' | 'following';

const SimpleFeed: FC<SimpleFeedProps> = ({ limit = 10 }) => {
  const [cards, setCards] = useState<AnimatedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('ranked');
  // const [_engagementStats, setEngagementStats] = useState<unknown>(null);
  const { data: session } = useSession();

  const fetchAnimatedCards = useCallback(
    async (
      cursor: string | null = null,
      append = false,
      sortOption: SortOption = sortBy,
    ) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const url = cursor
          ? `/api/cards/feed/animated?limit=${limit}&cursor=${cursor}&sort=${sortOption}`
          : `/api/cards/feed/animated?limit=${limit}&sort=${sortOption}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch animated cards');
        }
        const data = await response.json();

        // Normalize card data
        const normalizedCards = Array.isArray(data.data)
          ? data.data.map((card: Record<string, unknown>) => {
            const normalized = normalizeCardData(card);

            return {
              ...normalized,
              // Ensure all important fields are preserved
              cardNumber: card.cardNumber,
              totalInSet: card.totalInSet,
              weakness: card.weakness,
              resistance: card.resistance,
              retreatCost: card.retreatCost,
              userId: card.userId,
              // Animation and user fields
              animationUrl: card.animationUrl,
              animationPrompt: card.animationPrompt,
              animatedAt: card.animatedAt,
              createdAt: card.createdAt,
              username:
                (card.user as { name?: string })?.name ||
                (card.username as string) ||
                'Anonymous',
              userAvatar:
                (card.user as { image?: string })?.image ||
                (card.userAvatar as string),
              isPublic: card.isPublic,
              // Social fields
              likesCount: card.likesCount || 0,
              isLiked: card.isLiked || false,
              isFollowedUser: card.isFollowedUser || false,
              rankingScore: card.rankingScore || 0,
              engagementVelocity: card.engagementVelocity || 0,
              contentFreshness: card.contentFreshness || 0,
              creatorAuthority: card.creatorAuthority || 0,
            };
          })
          : [];

        if (append) {
          setCards(prev => [...prev, ...normalizedCards]);
        } else {
          setCards(normalizedCards);
        }

        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore || false);
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load animated cards',
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [limit, sortBy],
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      fetchAnimatedCards(nextCursor, true);
    }
  }, [loadingMore, hasMore, nextCursor, fetchAnimatedCards]);

  const handleCardUpdate = useCallback(
    (cardId: number, updates: Partial<AnimatedCard>) => {
      setCards(prev =>
        prev.map(card => (card.id === cardId ? { ...card, ...updates } : card)),
      );
    },
    [],
  );

  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      setSortBy(newSort);
      setNextCursor(null);
      setHasMore(true);
      fetchAnimatedCards(null, false, newSort);
    },
    [fetchAnimatedCards],
  );

  // Load engagement insights
  useEffect(() => {
    // const insights = getEngagementInsights(session?.user?.id);
    // setEngagementStats(insights);
  }, [session?.user?.id]);

  useEffect(() => {
    fetchAnimatedCards();
  }, [fetchAnimatedCards]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Calculate stats
  const animatedCount = cards.filter(card => card.animationUrl).length;
  const creatorsCount = new Set(cards.map(card => card.username)).size;
  const totalLikes = cards.reduce((sum, card) => sum + card.likesCount, 0);
  const cacheHitRate = undefined;

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <FeedHeader
        sortBy={sortBy}
        onSortChange={handleSortChange}
        cardsCount={cards.length}
        animatedCount={animatedCount}
        creatorsCount={creatorsCount}
        totalLikes={totalLikes}
        cacheHitRate={cacheHitRate}
      />

      {/* Loading State */}
      {loading && (
        <Box>
          {Array.from(new Array(3)).map((_, index) => (
            <FeedSkeleton key={index} />
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!loading && cards.length === 0 && <EmptyState sortBy={sortBy} />}

      {/* Feed Content */}
      {cards.length > 0 && (
        <Box>
          {cards.map((card, index) => (
            <FeedPost
              key={card.id}
              card={card}
              onUpdate={handleCardUpdate}
              position={index + 1}
            />
          ))}

          {/* Load More Indicator */}
          {loadingMore && hasMore && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              {Array.from(new Array(2)).map((_, index) => (
                <FeedSkeleton key={`loading-${index}`} />
              ))}
            </Box>
          )}

          {!hasMore && cards.length > 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                🎉 You&apos;ve seen all the animated cards! Check back later for
                more.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SimpleFeed;
