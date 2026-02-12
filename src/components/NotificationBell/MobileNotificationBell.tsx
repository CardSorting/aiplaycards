import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Fade, IconButton, Slide, alpha, styled } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Routes from '@routes';

const NotificationButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  padding: theme.spacing(1),
  borderRadius: 12,
  transition: `all 0.2s ${
    theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
  }`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
    transition: `all 0.1s ${
      theme.custom?.apple?.motion?.quick ||
      'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }`,
  },
  '&:disabled': {
    opacity: 0.6,
    transform: 'none',
  },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontWeight: 600,
    fontSize: '0.75rem',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: `0 2px 4px ${alpha(theme.palette.error.main, 0.3)}`,
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': {
        boxShadow: `0 2px 4px ${alpha(theme.palette.error.main, 0.3)}`,
      },
      '50%': {
        boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.5)}`,
      },
      '100%': {
        boxShadow: `0 2px 4px ${alpha(theme.palette.error.main, 0.3)}`,
      },
    },
  },
}));

const StyledNotificationIcon = styled(NotificationsIcon)(({ theme }) => ({
  fontSize: '1.5rem',
  transition: `all 0.2s ${
    theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
  }`,
}));

const StyledNotificationNoneIcon = styled(NotificationsNoneIcon)(
  ({ theme }) => ({
    fontSize: '1.5rem',
    transition: `all 0.2s ${
      theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
    }`,
  }),
);

export const MobileNotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  // const _theme = useTheme(); // Unused for now

  // Fetch unread count
  const fetchUnreadCount = useCallback(
    async (retryCount = 0) => {
      if (!user) return;

      try {
        setIsLoading(true);

        const response = await fetch('/api/notifications/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          // Ensure we always get a valid number
          const count = data?.data?.unreadCount;
          const safeCount =
            typeof count === 'number' && !isNaN(count)
              ? Math.max(0, Math.floor(count))
              : 0;
          setUnreadCount(safeCount);
        } else {
          console.error(
            'Failed to fetch notification count: HTTP',
            response.status,
          );
        }
      } catch (error) {
        console.error('Failed to fetch notification count:', error);

        // Retry once after a delay if it's the first attempt
        if (retryCount === 0) {
          setTimeout(() => {
            fetchUnreadCount(1);
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  // Fetch count on mount and when user changes
  useEffect(() => {
    if (user) {
      setIsVisible(true);
      fetchUnreadCount();
    } else {
      setIsVisible(false);
    }
  }, [user, fetchUnreadCount]);

  // Refresh count periodically (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  const handleClick = () => {
    router.push(Routes.Notifications);
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Slide direction="left" in={isVisible} timeout={300}>
      <Fade in={isVisible} timeout={400}>
        <NotificationButton
          onClick={handleClick}
          disabled={isLoading}
          aria-label={`Notifications${
            unreadCount > 0 ? ` (${unreadCount} unread)` : ''
          }`}
        >
          <NotificationBadge
            badgeContent={unreadCount > 99 ? '99+' : unreadCount}
            invisible={unreadCount === 0}
            max={99}
            showZero={false}
          >
            {unreadCount > 0 ? (
              <StyledNotificationIcon />
            ) : (
              <StyledNotificationNoneIcon />
            )}
          </NotificationBadge>
        </NotificationButton>
      </Fade>
    </Slide>
  );
};

export default MobileNotificationBell;
