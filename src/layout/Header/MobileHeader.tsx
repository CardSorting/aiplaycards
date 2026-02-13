import { FC, useEffect, useMemo, useState } from 'react';
import HamburgerIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CollectionsIcon from '@mui/icons-material/Collections';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PaymentIcon from '@mui/icons-material/Payment';
import HomeIcon from '@mui/icons-material/Home';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import StyleIcon from '@mui/icons-material/Style';
import CasinoIcon from '@mui/icons-material/Casino';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slide,
  Stack,
  SwipeableDrawer,
  Typography,
  alpha,
  styled,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@routes';
import { MobileNotificationBell } from '@components/NotificationBell/MobileNotificationBell';

// Styled components for enhanced UI
const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    maxHeight: '90vh',
    height: 'auto',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflowY: 'auto',
    overflowX: 'hidden',
    background: `linear-gradient(135deg, ${alpha(
      theme.palette.background.paper,
      0.95,
    )}, ${alpha(theme.palette.background.paper, 0.85)})`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow:
      theme.custom?.apple?.shadows?.hard || '0 8px 32px rgba(0, 0, 0, 0.12)',
    [theme.breakpoints.down('sm')]: {
      maxHeight: '85vh',
      width: '100vw',
      maxWidth: '100vw',
      marginLeft: 0,
      marginRight: 0,
    },
  },
}));

const MenuHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
    `,
  },
}));

const EnhancedListItemButton = styled(ListItemButton)<{
  component?: React.ElementType;
  to?: string;
}>(({ theme }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: 16,
  minHeight: 56,
  transition: `all 0.3s ${theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
    }`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-1px)',
    boxShadow:
      theme.custom?.apple?.shadows?.soft || '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  '&:active': {
    transform: 'translateY(0px)',
    transition: `all 0.1s ${theme.custom?.apple?.motion?.quick ||
      'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }`,
  },
}));

const PrimaryActionButton = styled(ListItemButton)<{
  component?: React.ElementType;
  to?: string;
}>(({ theme }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: 16,
  minHeight: 56,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: 'white',
  transition: `all 0.3s ${theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
    }`,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: 'translateY(-2px)',
    boxShadow:
      theme.custom?.apple?.shadows?.medium || '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  '&:active': {
    transform: 'translateY(0px)',
    transition: `all 0.1s ${theme.custom?.apple?.motion?.quick ||
      'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }`,
  },
}));

const HamburgerButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  transition: `all 0.3s ${theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
    }`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
    transition: `all 0.1s ${theme.custom?.apple?.motion?.quick ||
      'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }`,
  },
}));

const AuthenticatedMobileHeader: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Placeholder for session since NextAuth is removed
  const session = null;
  const user = null;
  const [username, setUsername] = useState<string | null>(null);

  const menuItems = useMemo(
    () => [
      {
        icon: <HomeIcon />,
        text: 'Home',
        href: Routes.Home,
        primary: false,
        category: 'main',
      },
      {
        icon: <GroupWorkIcon />,
        text: 'Community Pool',
        href: '/community',
        primary: false,
        category: 'collections',
      },
      {
        icon: <CollectionsIcon />,
        text: 'Monster Cards',
        href: '/gallery',
        primary: false,
        category: 'collections',
      },
      {
        icon: <StyleIcon />,
        text: 'Duel Cards',
        href: '/duel-gallery',
        primary: false,
        category: 'collections',
      },
      {
        icon: <CasinoIcon />,
        text: 'Spell Cards',
        href: '/spell-gallery',
        primary: false,
        category: 'collections',
      },
      {
        icon: <StarIcon />,
        text: 'PlayMore Collection',
        href: '/special-collection',
        primary: false,
        category: 'collections',
      },
      {
        icon: <AutoAwesomeIcon />,
        text: 'Nano AI Studio',
        href: '/nano',
        primary: false,
        category: 'collections',
      },
      {
        icon: <StorefrontIcon />,
        text: 'Marketplace',
        href: '/marketplace',
        primary: false,
        category: 'other',
      },
      {
        icon: <PeopleIcon />,
        text: 'Social',
        href: Routes.Feed,
        primary: false,
        category: 'other',
      },
      {
        icon: <AutoAwesomeIcon />,
        text: 'Create Card',
        href: Routes.Create,
        primary: true,
        category: 'create',
      },
      {
        icon: <PaymentIcon />,
        text: 'Buy Credits',
        href: '/credits',
        primary: false,
        category: 'other',
      },
    ],
    [username],
  );

  const handleSignOut = async () => {
    // signOut placeholder
    console.log('Sign out');
  };

  // Load DB username for current user (to avoid fallback to email/displayName)
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        // @ts-ignore
        if (!user?.id) return;
        const res = await fetch(
          // @ts-ignore
          `/api/users/profile/${encodeURIComponent(user.id)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setUsername(data?.data?.username ?? null);
      } catch {
        if (active) setUsername(null);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          minHeight: 64,
        }}
      >
        {/* Logo */}
        <Box
          component={RouterLink}
          to={Routes.Home}
          sx={{ textDecoration: 'none' }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #4A90E2, #50A1F1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            PlayMoreTCG
          </Typography>
        </Box>

        {/* Right side actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          <MobileNotificationBell />
          <HamburgerButton
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </HamburgerButton>
        </Stack>
      </Box>

      {/* Mobile Menu */}
      <StyledSwipeableDrawer
        anchor="top"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={() => setMenuOpen(true)}
        disableSwipeToOpen={false}
        swipeAreaWidth={20}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          },
        }}
      >
        <Box
          component="nav"
          sx={{
            width: 'auto',
            minHeight: 'fit-content',
            paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          }}
          role="presentation"
          onClick={() => setMenuOpen(false)}
          onKeyDown={() => setMenuOpen(false)}
        >
          {/* Header with Logo */}
          <MenuHeader>
            <Box component={RouterLink} to="/">
              <Box px={3} py={3} sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="white"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    lineHeight: 1.2,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  PlayMoreTCG
                </Typography>
                <Typography
                  variant="body2"
                  color="rgba(255, 255, 255, 0.8)"
                  sx={{ mt: 0.5, fontSize: '0.875rem' }}
                >
                  AI-Powered Pokémon Cards
                </Typography>
              </Box>
            </Box>
          </MenuHeader>

          <List sx={{ py: 1, px: 1 }}>
            {menuItems.map((item, index) => {
              const prevItem = menuItems[index - 1];
              const showDivider =
                prevItem && prevItem.category !== item.category;

              return (
                <Slide
                  key={item.text}
                  direction="right"
                  in={menuOpen}
                  timeout={300 + index * 100}
                >
                  <Box>
                    {showDivider && (
                      <Box sx={{ px: 1, py: 1 }}>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          {item.category === 'collections'
                            ? 'My Collections'
                            : 'Explore'}
                        </Typography>
                      </Box>
                    )}
                    {item.primary ? (
                      <PrimaryActionButton
                        component={RouterLink}
                        to={item.href}
                        onClick={() => setMenuOpen(false)}
                      >
                        <ListItemIcon sx={{ minWidth: 48, color: 'white' }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              fontWeight={700}
                              color="white"
                              sx={{ fontSize: '1rem' }}
                            >
                              {item.text}
                            </Typography>
                          }
                        />
                      </PrimaryActionButton>
                    ) : (
                      <EnhancedListItemButton
                        component={RouterLink}
                        to={item.href}
                        onClick={() => setMenuOpen(false)}
                      >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              sx={{ fontSize: '1rem', fontWeight: 500 }}
                            >
                              {item.text}
                            </Typography>
                          }
                        />
                      </EnhancedListItemButton>
                    )}
                  </Box>
                </Slide>
              );
            })}

            <Divider sx={{ my: 2, mx: 1 }} />

            {/* User Profile Section */}
            {user && (
              <Slide direction="right" in={menuOpen} timeout={300 + 300}>
                <Box sx={{ px: 1, py: 1 }}>
                  <Box
                    component={username ? RouterLink : 'div'}
                    to={username ? Routes.Profile(username) : undefined}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      cursor: username ? 'pointer' : 'default',
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': username
                        ? {
                          backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        }
                        : {},
                    }}
                    onClick={username ? () => setMenuOpen(false) : undefined}
                  >
                    <Avatar
                      // @ts-ignore
                      src={user.image || undefined}
                      // @ts-ignore
                      alt={user.name || 'User'}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {/* @ts-ignore */}
                        {user.name || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {/* @ts-ignore */}
                        {username ? `@${username}` : user.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Slide>
            )}

            {/* Sign Out Button */}
            {user && (
              <Slide direction="right" in={menuOpen} timeout={300 + 400}>
                <EnhancedListItemButton onClick={handleSignOut}>
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <ExitToAppIcon sx={{ fontSize: '1.25rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Sign out
                      </Typography>
                    }
                  />
                </EnhancedListItemButton>
              </Slide>
            )}

            {/* Sign In Button (if not authenticated) */}
            {!user && (
              <Slide direction="right" in={menuOpen} timeout={300 + 300}>
                <EnhancedListItemButton
                  component={RouterLink}
                  to={Routes.Login}
                  onClick={() => setMenuOpen(false)}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <AccountCircleIcon sx={{ fontSize: '1.25rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Sign in
                      </Typography>
                    }
                  />
                </EnhancedListItemButton>
              </Slide>
            )}
          </List>
        </Box>
      </StyledSwipeableDrawer>
    </>
  );
};

const MobileHeader: FC = () => {
  return <AuthenticatedMobileHeader />;
};

export default MobileHeader;

