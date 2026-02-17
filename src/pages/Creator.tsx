import { FC } from 'react';
import CardOptionsForm from '@cardEditor/cardOptions/components/CardOptionsForm';
import CardDisplay from '@cardEditor/cardStyles/components/CardDisplay';
import { SEO } from '@layout';
import CardDownloader from '@cardEditor/cardOptions/components/atoms/CardDownloader';
import { siteDescription } from '@/constants';
import { styled } from '@css';

export const Wrapper = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-direction: column-reverse;
  align-items: center;
  max-width: 550px;
  margin: 0 auto;

  ${({ theme }) => theme.breakpoints.up('md')} {
    align-items: flex-start;
    flex-direction: row;
    max-width: unset;
  }
`;

export const CardWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(8)};
  height: 100%;
  width: 100%;
  /* Add generous padding to prevent shadowbox overlap - extra bottom padding */
  padding: ${({ theme }) => theme.spacing(6, 3, 12, 3)};

  > * {
    width: 100%;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    position: sticky;
    top: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(8, 4, 16, 4)};
    gap: ${({ theme }) => theme.spacing(10)};
  }

  ${({ theme }) => theme.breakpoints.up(1000)} {
    padding: ${({ theme }) => theme.spacing(10, 5, 20, 5)};
    gap: ${({ theme }) => theme.spacing(12)};
    > * {
      width: 90%;
    }
  }

  ${({ theme }) => theme.breakpoints.up(1100)} {
    padding: ${({ theme }) => theme.spacing(12, 6, 24, 6)};
    gap: ${({ theme }) => theme.spacing(14)};
    > * {
      width: 80%;
    }
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    padding: ${({ theme }) => theme.spacing(14, 8, 28, 8)};
    gap: ${({ theme }) => theme.spacing(16)};
    > * {
      width: 75%;
    }
  }
`;

const Creator: FC = () => (
  <>
    <SEO title="Creator" description={siteDescription} />
    <Wrapper>
      <CardOptionsForm />
      <CardWrapper>
        <CardDisplay disableParallax />
        <CardDownloader />
      </CardWrapper>
    </Wrapper>
  </>
);

export default Creator;
