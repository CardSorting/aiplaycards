export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { Container } from '@mui/material';
import { SEO } from '@layout';
import SimpleFeed from '../../src/components/feed/SimpleFeed';

export default function FeedPage() {
  return (
    <>
      <SEO
        title="Animated Cards Feed"
        description="Discover the latest animated trading cards from our community - see what's trending and get inspired!"
      />
      <Container
        maxWidth="md"
        sx={{
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <SimpleFeed limit={20} />
      </Container>
    </>
  );
}
