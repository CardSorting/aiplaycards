import {
  Box,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import Routes from '@routes';
import NextLink from 'next/link';
import { FC } from 'react';

const Footer: FC = () => (
  <Box
    component="footer"
    sx={{
      bgcolor: 'background.paper',
      borderTop: '1px solid',
      borderColor: 'divider',
      mt: 'auto',
      py: { xs: 3, md: 4 },
    }}
  >
    <Container maxWidth="lg">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        spacing={{ xs: 2, md: 4 }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          © {new Date().getFullYear()} PlayMore TCG. All rights reserved.
        </Typography>

        <Stack
          direction="row"
          spacing={{ xs: 2, md: 3 }}
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                borderColor: 'text.disabled',
                opacity: 0.3,
              }}
            />
          }
        >
          <Link
            component={NextLink}
            href={Routes.PrivacyPolicy}
            variant="body2"
            color="text.secondary"
            underline="hover"
            sx={{
              fontWeight: 500,
              transition: 'color 0.2s ease-in-out',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            Privacy Policy
          </Link>

          <Link
            component={NextLink}
            href={Routes.TermsOfService}
            variant="body2"
            color="text.secondary"
            underline="hover"
            sx={{
              fontWeight: 500,
              transition: 'color 0.2s ease-in-out',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            Terms of Service
          </Link>
        </Stack>
      </Stack>
    </Container>
  </Box>
);

export default Footer;
