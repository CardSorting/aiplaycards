'use client';

import { FC } from 'react';
import CardOptionsForm from '@cardEditor/cardOptions/components/CardOptionsForm';
import CardDisplay from '@cardEditor/cardStyles/components/CardDisplay';
import { SEO } from '@layout';
import CardDownloader from '@cardEditor/cardOptions/components/atoms/CardDownloader';
import { siteDescription } from 'src/constants';
import { CardWrapper, Wrapper } from './styles';

const CreatorClient: FC = () => (
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

export default CreatorClient;
