import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Box, IconButton, Tooltip, styled } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Routes from '@routes';

const NotificationIconButton = styled(IconButton)(() => ({
  color: 'inherit',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontWeight: 600,
    fontSize: '0.75rem',
  },
}));

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

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
          setTimeout(() => fetchUnreadCount(1), 2000);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  // Fetch count on mount and when user changes
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount, user]);

  // Refresh count periodically (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, user]);

  const handleClick = () => {
    router.push(Routes.Notifications);
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Box className={className}>
      <Tooltip title="Notifications">
        <span>
          <NotificationIconButton
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
            >
              {unreadCount > 0 ? (
                <NotificationsIcon />
              ) : (
                <NotificationsNoneIcon />
              )}
            </NotificationBadge>
          </NotificationIconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default NotificationBell;
