import { Alert, Button, Link, Snackbar } from '@mui/material';
import { FC, useCallback, useEffect, useState } from 'react';
import { hasCookie } from 'cookies-next';
import {
  ConsentCookie,
  editCookieConsent,
  initializeCookieConsent,
} from '@features/analytics';
import { Container } from '@mui/system';
import {
  Check as CheckmarkIcon,
  Close as CloseIcon,
  Cookie as CookieIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import Routes from '@routes';
import { ActionWrapper, Content } from './styles';

const CookieConsent: FC = () => {
  const [consentChosen, setConsentChosen] = useState(true); // Initialize as true to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const maybePromise = hasCookie(ConsentCookie.Analytics);
    if (maybePromise instanceof Promise) {
      maybePromise
        .then(value => setConsentChosen(Boolean(value)))
        .catch(() => setConsentChosen(false));
    } else {
      setConsentChosen(Boolean(maybePromise));
    }
    initializeCookieConsent();
  }, []);

  const handleConsent = useCallback(
    (accepted: boolean) => {
      editCookieConsent({
        analytics: accepted,
      });
      setConsentChosen(true);
    },
    [setConsentChosen],
  );

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <Snackbar
      open={!consentChosen}
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
    >
      <Container>
        <Alert
          elevation={4}
          severity="info"
          sx={theme => ({
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          })}
          icon={
            <CookieIcon
              fontSize="large"
              sx={theme => ({ color: theme.palette.primary.contrastText })}
            />
          }
        >
          <Content>
            <span>
              <span>We use cookies only for analytical purposes</span>
              <br />
              <Link
                component={NextLink}
                href={Routes.CookiePolicy}
                color="inherit"
              >
                Read about our cookie policy here
              </Link>
            </span>
            <ActionWrapper>
              <Button
                startIcon={<CheckmarkIcon />}
                sx={{ pl: 12.5, whiteSpace: 'nowrap' }}
                variant="contained"
                color="secondary"
                onClick={() => handleConsent(true)}
              >
                Accept
              </Button>
              <Button
                startIcon={<CloseIcon />}
                sx={{ pl: 12.5, whiteSpace: 'nowrap' }}
                variant="outlined"
                color="secondary"
                onClick={() => handleConsent(false)}
              >
                Deny
              </Button>
            </ActionWrapper>
          </Content>
        </Alert>
      </Container>
    </Snackbar>
  );
};

export default CookieConsent;
