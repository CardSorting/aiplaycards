import React, { FC, useEffect, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    MarkEmailRead as MarkEmailReadIcon,
    Notifications as NotificationsIcon,
    PersonAdd as PersonAddIcon,
    Refresh as RefreshIcon,
    ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useSession } from '@hooks/useSession';
import { SEO } from '@layout';
import Routes from '@/routes';

interface NotificationItem {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    fromUserId?: string;
    fromUsername?: string;
    cardId?: number;
    cardName?: string;
    listingId?: number;
}

interface NotificationResponse {
    success: boolean;
    data: {
        notifications: NotificationItem[];
        unreadCount: number;
        pagination: {
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    };
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'follower':
            return <PersonAddIcon color="primary" />;
        case 'like':
            return <FavoriteIcon color="error" />;
        case 'sale':
            return <ShoppingCartIcon color="success" />;
        case 'welcome':
            return <NotificationsIcon color="secondary" />;
        default:
            return <NotificationsIcon />;
    }
};

const getNotificationColor = (type: string) => {
    switch (type) {
        case 'follower':
            return 'primary';
        case 'like':
            return 'error';
        case 'sale':
            return 'success';
        case 'welcome':
            return 'secondary';
        default:
            return 'default';
    }
};

const NotificationsPage: FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAsRead, setMarkingAsRead] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const { data: session } = useSession();
    const user = session?.user;
    const theme = useTheme();

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/notifications');
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data: NotificationResponse = await response.json();
            setNotifications(data.data.notifications);
            setUnreadCount(data.data.unreadCount);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        if (!user || unreadCount === 0) return;

        try {
            setMarkingAsRead(true);

            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'markAsRead',
                }),
            });

            if (response.ok) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, isRead: true })),
                );
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Failed to mark notifications as read:', err);
        } finally {
            setMarkingAsRead(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user?.id]);

    if (!user) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <SEO title="Notifications" description="View your notifications." />
                <Alert severity="warning">
                    Please sign in to view your notifications.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <SEO title="Notifications" description="Stay updated with your latest activities." />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Notifications
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={fetchNotifications} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                    {unreadCount > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MarkEmailReadIcon />}
                            onClick={markAllAsRead}
                            disabled={markingAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </Box>
            </Box>

            {unreadCount > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    You have {unreadCount} unread notification
                    {unreadCount !== 1 ? 's' : ''}.
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : notifications.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <NotificationsIcon
                            sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                            No notifications yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            When people follow you, like your cards, or buy from you, you'll
                            see notifications here.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <List sx={{ p: 0 }}>
                        {notifications.map((notification, index) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    sx={{
                                        bgcolor: notification.isRead
                                            ? 'transparent'
                                            : theme.palette.action.hover,
                                        borderLeft: notification.isRead
                                            ? 'none'
                                            : `4px solid ${theme.palette.primary.main}`,
                                    }}
                                >
                                    <ListItemIcon>
                                        {getNotificationIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    mb: 0.5,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={notification.isRead ? 'normal' : 'bold'}
                                                    component="span"
                                                >
                                                    {notification.title}
                                                </Typography>
                                                <Chip
                                                    label={notification.type}
                                                    size="small"
                                                    color={getNotificationColor(notification.type) as any}
                                                    variant="outlined"
                                                />
                                                {!notification.isRead && (
                                                    <Chip label="New" size="small" color="primary" />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.primary"
                                                    sx={{ mb: 0.5 }}
                                                    component="span"
                                                >
                                                    {notification.message}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    component="span"
                                                    sx={{ ml: 1 }}
                                                >
                                                    {formatDistanceToNow(
                                                        new Date(notification.createdAt),
                                                        { addSuffix: true },
                                                    )}
                                                </Typography>
                                                {notification.fromUsername && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ ml: 1 }}
                                                        component="span"
                                                    >
                                                        • from {notification.fromUsername}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    {notification.fromUserId && notification.fromUsername && (
                                        <Avatar
                                            component={Link}
                                            to={Routes.Profile(notification.fromUsername)}
                                            sx={{ ml: 2, textDecoration: 'none' }}
                                        >
                                            {notification.fromUsername.charAt(0).toUpperCase()}
                                        </Avatar>
                                    )}
                                </ListItem>
                                {index < notifications.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Card>
            )}
        </Container>
    );
};

export default NotificationsPage;
