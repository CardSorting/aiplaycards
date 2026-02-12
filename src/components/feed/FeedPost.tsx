'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { Card, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  trackCardLike,
  trackCardShare,
  trackCardView,
} from '../../utils/engagement-tracker';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
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

interface FeedPostProps {
  card: AnimatedCard;
  onUpdate: (cardId: number, updates: Partial<AnimatedCard>) => void;
  position: number;
}

const FeedPost: FC<FeedPostProps> = ({ card, onUpdate, position }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [likesCount, setLikesCount] = useState<number>(card.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(card.isLiked || false);
  const [isFollowing, setIsFollowing] = useState<boolean>(
    card.isFollowedUser || false,
  );
  const [isLikeLoading, setIsLikeLoading] = useState<boolean>(false);
  const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const viewTracked = useRef(false);

  // Track card view when component mounts
  useEffect(() => {
    if (!viewTracked.current) {
      trackCardView(card.id, user?.id, {
        source: 'feed',
        position,
        deviceType: isMobile ? 'mobile' : 'desktop',
      });
      viewTracked.current = true;
    }
  }, [card.id, user?.id, position, isMobile]);

  const handleCardClick = () => {
    trackCardView(card.id, user?.id, {
      source: 'feed-click',
      position,
      deviceType: isMobile ? 'mobile' : 'desktop',
    });
    router.push(`/gallery/${card.id}`);
  };

  const handleLike = async () => {
    if (!user?.id || isLikeLoading) return;

    setIsLikeLoading(true);
    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    // Track engagement
    trackCardLike(card.id, user.id, {
      source: 'feed',
      position,
      deviceType: isMobile ? 'mobile' : 'desktop',
    });

    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/cards/${card.id}/like`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const result = await response.json();
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);

      // Notify parent component
      onUpdate(card.id, {
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      });
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleShare = () => {
    trackCardShare(card.id, user?.id, {
      source: 'feed',
      position,
      deviceType: isMobile ? 'mobile' : 'desktop',
    });

    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: `${card.name} - Animated Card`,
        text: `Check out this amazing animated ${card.name} card!`,
        url: `${window.location.origin}/gallery/${card.id}`,
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(
        `${window.location.origin}/gallery/${card.id}`,
      );
    }
  };

  const handleBookmark = async () => {
    if (!user?.id) return;

    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality
  };

  const handleFollow = async () => {
    if (!user?.id || !card.userId || isFollowLoading || card.userId === user.id)
      return;

    setIsFollowLoading(true);
    const previousFollowing = isFollowing;

    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${card.userId}/follow`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to update follow');
      }

      const result = await response.json();
      setIsFollowing(result.isFollowing);

      // Notify parent component
      onUpdate(card.id, { isFollowedUser: result.isFollowing });
    } catch (error) {
      console.error('Error updating follow:', error);
      // Revert optimistic update on error
      setIsFollowing(previousFollowing);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: { xs: 2, sm: 3, md: 4 },
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: { xs: 2, sm: 3, md: 4 },
        overflow: 'hidden',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'grey.300',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        },
        // Mobile-specific optimizations
        ...(isMobile && {
          mx: 1, // Add small horizontal margin on mobile
          '&:first-of-type': {
            mt: 1,
          },
        }),
      }}
    >
      <PostHeader
        username={card.username || 'Anonymous'}
        userAvatar={card.userAvatar}
        userId={card.userId}
        currentUserId={user?.id}
        isFollowing={isFollowing}
        isFollowLoading={isFollowLoading}
        onFollow={handleFollow}
        animatedAt={card.animatedAt}
        createdAt={card.createdAt}
        hasAnimation={!!card.animationUrl}
        engagementVelocity={card.engagementVelocity}
        creatorAuthority={card.creatorAuthority}
      />

      <PostContent
        card={card}
        onCardClick={handleCardClick}
        onLike={handleLike}
        onShare={handleShare}
        onBookmark={handleBookmark}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
      />

      <PostActions
        likesCount={likesCount}
        isLiked={isLiked}
        isLikeLoading={isLikeLoading}
        onLike={handleLike}
        onShare={handleShare}
        isFollowing={isFollowing}
      />
    </Card>
  );
};

export default FeedPost;
