import { FC, Suspense, useEffect } from 'react';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import { CssBaseline, Box, styled } from '@mui/material';
import theme from '@utils/theme';
import { createEmotionCache } from '@css';
import { CardOptionsProvider } from '@cardEditor/cardOptions';
import { CardStylesProvider } from '@cardEditor/cardStyles';
import { CardLogicProvider } from '@cardEditor/cardLogic';
import { CardDebugProvider } from '@cardEditor/cardDebug';
import { Footer } from '@layout';
import Header from './Header';
import { AnalyticsProvider } from '@features/analytics';
import CookieConsent from '@components/CookieConsent';
import GoatCounter from '@features/analytics/components/GoatCounter';
import { GoogleTagManagerScript } from '@features/analytics/components/GTM';
import { useLocation, Outlet } from 'react-router-dom';

const clientSideCache = createEmotionCache();

const Background = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 50%)',
}));

const MainContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
});

const RootLayout: FC = () => {
    const emotionCache = clientSideCache;
    const location = useLocation();
    const pathname = location.pathname;

    useEffect(() => {
        const handleRouteChange = () => {
            // @ts-ignore
            window.goatcounter?.count();
        };

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
                                        <MainContainer as="main">
                                            <Outlet />
                                        </MainContainer>
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

export default RootLayout;

