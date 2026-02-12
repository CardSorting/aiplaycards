'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';

const NavItem = ({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) => (
  <Card
    variant={active ? 'elevation' : 'outlined'}
    sx={{
      mb: 1,
      borderRadius: 1.5,
      bgcolor: active ? 'primary.main' : 'background.paper',
    }}
  >
    <CardActionArea component={Link} href={href}>
      <CardContent sx={{ py: 1.25, px: 1.75 }}>
        <Typography
          variant="body2"
          sx={{
            color: active ? 'primary.contrastText' : 'text.primary',
            fontWeight: active ? 700 : 500,
          }}
        >
          {label}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

const NavigationContent = ({ pathname }: { pathname: string | null }) => (
  <Stack sx={{ width: 240, p: 2 }}>
    <Typography variant="overline" sx={{ mb: 1, color: 'text.secondary' }}>
      Seller
    </Typography>
    <NavItem
      href="/marketplace/manage/analytics"
      label="Dashboard Analytics"
      active={pathname?.startsWith('/marketplace/manage/analytics') ?? false}
    />
    <NavItem
      href="/marketplace/manage/listings"
      label="Manage Listings"
      active={pathname?.startsWith('/marketplace/manage/listings') ?? false}
    />
    <NavItem
      href="/marketplace/manage/create"
      label="Create Listings"
      active={pathname?.startsWith('/marketplace/manage/create') ?? false}
    />
    <Typography
      variant="overline"
      sx={{ mt: 2, mb: 1, color: 'text.secondary' }}
    >
      Shortcuts
    </Typography>
    <NavItem href="/marketplace" label="Back to Marketplace" active={false} />
    <NavItem href="/gallery" label="My Collection" active={false} />
  </Stack>
);

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMdUp = useMediaQuery('(min-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (isMdUp) {
    // Desktop layout with persistent sidebar
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          px: 2,
          py: 2,
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            width: 240,
            position: 'sticky',
            top: 72,
            alignSelf: 'flex-start',
          }}
        >
          <NavigationContent pathname={pathname} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      </Box>
    );
  }

  // Mobile layout with drawer
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: 'background.paper', boxShadow: 1 }}
      >
        <Toolbar>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Seller Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <NavigationContent pathname={pathname} />
      </Drawer>

      <Box sx={{ flex: 1, p: 1 }}>{children}</Box>
    </Box>
  );
}
