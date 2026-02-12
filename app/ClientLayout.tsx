'use client';

import { CacheProvider, ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { FC, ReactNode, Suspense, useEffect } from 'react';
import theme from '@utils/theme';
import { createEmotionCache } from '@css';
import { CardOptionsProvider } from '@cardEditor/cardOptions';
import { CardStylesProvider } from '@cardEditor/cardStyles';
import { CardLogicProvider } from '@cardEditor/cardLogic';
import { CardDebugProvider } from '@cardEditor/cardDebug';
import { Footer } from '@layout';
import dynamic from 'next/dynamic';
const Header = dynamic(() => import('../src/layout/Header'), { ssr: false });
import { AnalyticsProvider } from '@features/analytics';
import CookieConsent from '@components/CookieConsent';
import GoatCounter from '@features/analytics/components/GoatCounter';
import { GoogleTagManagerScript } from '@features/analytics/components/GTM';
import { usePathname } from 'next/navigation';
import { Background, MainContainer } from './styles';

const clientSideCache = createEmotionCache();

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout: FC<ClientLayoutProps> = ({ children }) => {
  const emotionCache = clientSideCache;
  const pathname = usePathname();

  useEffect(() => {
    const handleRouteChange = () => {
      window.goatcounter?.count();
    };

    // Count page view on pathname change
    handleRouteChange();
  }, [pathname]);

  const isEmbedRoute = pathname?.startsWith('/embed/');

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CardOptionsProvider>
          <CardDebugProvider>
            <CardLogicProvider>
              <CardStylesProvider>
                <AnalyticsProvider>
                  <GoogleTagManagerScript />
                  <GoatCounter />
                  <CssBaseline />
                  <Background>
                    <CookieConsent />
                    {!isEmbedRoute && (
                      <Suspense fallback={null}>
                        <Header />
                      </Suspense>
                    )}
                    <MainContainer as="main">{children}</MainContainer>
                    {!isEmbedRoute && <Footer />}
                  </Background>
                </AnalyticsProvider>
              </CardStylesProvider>
            </CardLogicProvider>
          </CardDebugProvider>
        </CardOptionsProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default ClientLayout;
