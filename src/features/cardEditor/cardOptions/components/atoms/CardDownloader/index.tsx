import { cardId as defaultCardId } from '@cardEditor/cardStyles';
import { FC } from 'react';
import { Box } from '@mui/system';
import { CardDownloaderProps } from './types';
import { TempDiv } from './styles';
import SaveToGalleryButton from './components/SaveToGalleryButton';
import ShareButton from './components/ShareButton';

const CardDownloader: FC<CardDownloaderProps> = ({
  cardId = defaultCardId,
}) => (
  <div>
    <TempDiv id="temp" />
    <Box display="flex" flexDirection={['column', 'row']} gap={1}>
      <SaveToGalleryButton cardId={cardId} />
      <ShareButton cardId={cardId} />
    </Box>
  </div>
);

export default CardDownloader;
