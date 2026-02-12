import { useCardOptions } from '@cardEditor/cardOptions/hooks';
import { AnalyticsEvent, useAnalytics } from '@features/analytics';
import { Download as DownloadIcon } from '@mui/icons-material';
import { FC, useCallback, useState } from 'react';
import useIsMobile from '@hooks/useIsMobile';
import LoadingButton from '../../atoms/LoadingButton';
import { DownloadButtonProps } from './types';

const DownloadButton: FC<DownloadButtonProps> = ({
  cardId: _cardId,
  ...buttonProps
}) => {
  const { isMobile } = useIsMobile();
  const { trackCardCreatorEvent } = useAnalytics();
  const cardOptions = useCardOptions();
  const [isLoading, setLoading] = useState<boolean>(false);

  const downloadCardData = useCallback(() => {
    const cardData = {
      name: cardOptions.name || 'Untitled Card',
      cardOptions,
      timestamp: new Date().toISOString(),
      version: '2.0', // Mark as new format
    };

    const jsonString = JSON.stringify(cardData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardOptions.name || 'PlayMoreTCG-Card'}.json`;
    document.body.appendChild(link);
    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [cardOptions]);

  const handleDownload = useCallback(async () => {
    setLoading(true);
    try {
      downloadCardData();
      trackCardCreatorEvent(AnalyticsEvent.CardDownload);
    } finally {
      setLoading(false);
    }
  }, [downloadCardData, trackCardCreatorEvent]);

  return (
    <LoadingButton
      {...buttonProps}
      sx={
        isMobile
          ? { paddingLeft: [null, 15], paddingRight: [null, 8], minWidth: 150 }
          : null
      }
      variant={isMobile ? 'outlined' : 'contained'}
      color={isMobile ? 'secondary' : 'primary'}
      fullWidth={!isMobile}
      onClick={handleDownload}
      isLoading={isLoading}
      startIcon={<DownloadIcon />}
    >
      Download Card Data
    </LoadingButton>
  );
};

export default DownloadButton;
