'use client';

import { Typography, styled } from '@mui/material';
import Routes from '@routes';
import NextLink from 'next/link';
import { FC } from 'react';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';

const HeaderContainer = styled('header')(({ theme }) => ({
  position: 'relative',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  minHeight: '64px',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  boxShadow:
    theme.custom?.apple?.shadows?.medium || '0 4px 16px rgba(0, 0, 0, 0.08)',
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${theme.palette.primary.dark}20`,
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    paddingRight: theme.spacing(3),
  },
}));

const LogoLink = styled(NextLink)(({ theme }: { theme: any }) => ({
  color: 'white',
  textDecoration: 'none',
  transition: `all 0.2s ${
    theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
  }`,
  '&:hover': {
    textDecoration: 'none',
    transform: 'scale(1.02)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
  fontWeight: 700,
  lineHeight: 1.2,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.up('sm')]: {
    fontSize: 'clamp(1.5rem, 3vw, 1.75rem)',
  },
}));

const DesktopOnly = styled('div')(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
}));

const MobileOnly = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const Header: FC = () => {
  return (
    <HeaderContainer>
      <LogoLink href={Routes.Home}>
        <LogoText variant="h1" color="inherit" noWrap>
          PlayMore TCG
        </LogoText>
      </LogoLink>
      <DesktopOnly>
        <DesktopHeader />
      </DesktopOnly>
      <MobileOnly>
        <MobileHeader />
      </MobileOnly>
    </HeaderContainer>
  );
};

export default Header;
