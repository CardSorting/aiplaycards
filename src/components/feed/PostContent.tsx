'use client';

import { FC, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { CardData } from '@components/CardDisplayWrapper';
import CardDisplay from './components/CardDisplay';
import CardDescription from './components/CardDescription';
import CardStats from './components/CardStats';
import CardMoves from './components/CardMoves';

interface AnimatedCard extends CardData {
  animationUrl?: string;
  animationPrompt?: string;
  animatedAt?: string;
  createdAt: string;
  username?: string;
  userAvatar?: string;
  userId?: string;
  isPublic: boolean;
  likesCount: number;
  isLiked: boolean;
  isFollowedUser: boolean;
  rankingScore?: number;
  engagementVelocity?: number;
  contentFreshness?: number;
  creatorAuthority?: number;
}

interface PostContentProps {
  card: AnimatedCard;
  onCardClick?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const PostContent: FC<PostContentProps> = ({
  card,
  onCardClick,
  onLike,
  onShare,
  isLiked = false,
}) => {
  const theme = useTheme();

  const handleCardClick = useCallback(() => {
    if (onCardClick) {
      onCardClick();
    }
  }, [onCardClick]);

  return (
    <Box
      sx={{
        position: 'relative',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        borderRadius: { xs: 2, sm: 3 },
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Card Display Section */}
      <CardDisplay
        card={card}
        onCardClick={handleCardClick}
        onLike={onLike}
        onShare={onShare}
        isLiked={isLiked}
      />

      {/* Content Section */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          background: theme.palette.background.paper,
        }}
      >
        {/* Card Description */}
        <CardDescription name={card.name} description={card.description} />

        {/* Card Stats */}
        <CardStats
          type={card.type}
          rarity={card.rarity}
          hitpoints={card.hitpoints}
        />

        {/* Card Moves */}
        <CardMoves moves={card.moves} />
      </Box>
    </Box>
  );
};

export default PostContent;
