import { FC, useMemo } from 'react';
import { Area } from 'react-easy-crop';
import { Video, Wrapper } from './styles';
import { CroppedVideoProps } from './types';

const DEFAULT_CROP: Area = { height: 0, width: 0, x: 0, y: 0 };

const CroppedVideo: FC<CroppedVideoProps> = ({
  src,
  croppedArea = DEFAULT_CROP,
  ...props
}) => {
  const hasCrop =
    !!croppedArea && croppedArea.width > 0 && croppedArea.height > 0;

  const transform = useMemo(() => {
    if (!hasCrop) return null;
    const scale = 100 / croppedArea.width;

    return {
      x: `${-croppedArea.x * scale}%`,
      y: `${-croppedArea.y * scale}%`,
      scale,
      width: 'calc(100% + 0.5px)',
      height: 'auto',
    } as const;
  }, [croppedArea, hasCrop]);

  const style = useMemo(() => {
    if (transform) {
      return {
        transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale}, ${transform.scale}, 1)`,
        width: transform.width,
        height: transform.height,
      } as React.CSSProperties;
    }
    // Fallback: no crop provided → cover entire wrapper area
    return {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    } as React.CSSProperties;
  }, [transform]);

  return (
    <Wrapper {...props}>
      <Video
        src={src}
        style={style}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
    </Wrapper>
  );
};

export default CroppedVideo;
