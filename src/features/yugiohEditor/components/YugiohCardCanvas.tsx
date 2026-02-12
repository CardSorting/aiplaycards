'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { LanguageConfig, YugiohCardData, YugiohCardImages } from '../types';

interface YugiohCardCanvasProps {
  cardData: YugiohCardData;
  cardMeta: Record<string, LanguageConfig>;
  onLoadingChange: (loading: boolean) => void;
}

export interface YugiohCardCanvasRef {
  drawCard: () => void;
  toDataURL: (type?: string) => string;
}

const YugiohCardCanvas = forwardRef<YugiohCardCanvasRef, YugiohCardCanvasProps>(
  ({ cardData, cardMeta, onLoadingChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [, setImages] = useState<Partial<YugiohCardImages>>({});

    useImperativeHandle(ref, () => ({
      drawCard: () => {
        drawCard();
      },
      toDataURL: (type?: string) => {
        return canvasRef.current?.toDataURL(type || 'image/png') || '';
      },
    }));

    const prepareImages = async (): Promise<YugiohCardImages> => {
      const cardImgUrl = cardData.cardImg
        ? URL.createObjectURL(cardData.cardImg)
        : null;
      const templateLang = cardMeta[cardData.cardLang]?._templateLang || 'en';

      let photoUrl = cardImgUrl || '/assets/yugioh/images/default.jpg';

      if (cardData.cardLoadYgoProEnabled && cardData.cardKey) {
        photoUrl = `/assets/yugioh/ygo/pics/${cardData.cardKey}.jpg`;
      }

      const cardTemplateText = getCardTemplateText();

      const imageUrls = {
        template: `/assets/yugioh/images/card/${templateLang}/${cardTemplateText}.png`,
        holo: '/assets/yugioh/images/pic/holo.png',
        link1: '/assets/yugioh/images/pic/LINK1.png',
        link2: '/assets/yugioh/images/pic/LINK2.png',
        link3: '/assets/yugioh/images/pic/LINK3.png',
        link4: '/assets/yugioh/images/pic/LINK4.png',
        link6: '/assets/yugioh/images/pic/LINK6.png',
        link7: '/assets/yugioh/images/pic/LINK7.png',
        link8: '/assets/yugioh/images/pic/LINK8.png',
        link9: '/assets/yugioh/images/pic/LINK9.png',
        attr:
          cardData.cardType === 'Monster'
            ? `/assets/yugioh/images/attr/${templateLang}/${cardData.cardAttr}.webp`
            : `/assets/yugioh/images/attr/${templateLang}/${cardData.cardType}.webp`,
        photo: photoUrl,
        levelOrSubtype:
          cardData.cardType !== 'Monster' && cardData.cardSubtype !== 'Normal'
            ? `/assets/yugioh/images/pic/${cardData.cardSubtype}.webp`
            : `/assets/yugioh/images/pic/${
                isXyzMonster() ? 'Rank' : 'Level'
              }.webp`,
      };

      const loadedImages: Partial<YugiohCardImages> = {};

      await Promise.all(
        Object.entries(imageUrls).map(([key, url]) => {
          return new Promise<void>((resolve, _reject) => {
            const img = new Image();
            img.onload = () => {
              loadedImages[key as keyof YugiohCardImages] = img;
              resolve();
            };
            img.onerror = () => {
              console.warn(`Failed to load image: ${url}`);
              resolve(); // Continue even if some images fail
            };
            img.src = url;
          });
        }),
      );

      return loadedImages as YugiohCardImages;
    };

    const getCardTemplateText = (): string => {
      let templateUrl =
        cardData.cardType !== 'Monster'
          ? cardData.cardType
          : cardData.cardSubtype;
      if (
        cardData.Pendulum &&
        !['Slifer', 'Ra', 'Obelisk', 'LDragon'].includes(cardData.cardSubtype)
      ) {
        templateUrl += 'Pendulum';
      }
      return templateUrl;
    };

    const isEffectMonster = (): boolean => {
      return (
        cardData.cardSubtype === 'Effect' ||
        (cardData.cardEff2 !== 'none' && cardData.cardSubtype !== 'Normal')
      );
    };

    const isXyzMonster = (): boolean => {
      return cardData.cardType === 'Monster' && cardData.cardSubtype === 'Xyz';
    };

    const isLinkMonster = (): boolean => {
      return cardData.cardType === 'Monster' && cardData.cardSubtype === 'Link';
    };

    const drawCard = async () => {
      if (!canvasRef.current || !cardMeta[cardData.cardLang]) return;

      onLoadingChange(true);

      try {
        const loadedImages = await prepareImages();
        setImages(loadedImages);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 1000;
        canvas.height = 1450;

        const langStr = cardMeta[cardData.cardLang];
        const offset = langStr._offset;
        const fontName = langStr._fontName;

        // Draw base card image
        drawCardImg(ctx, loadedImages);

        // Draw card title
        drawCardTitle(ctx, offset, fontName);

        // Draw card info
        drawCardInfo(ctx, langStr, offset, fontName, loadedImages);

        // Draw card key
        if (cardData.cardKey !== '') {
          ctx.fillStyle =
            isXyzMonster() && !cardData.Pendulum ? '#FFF' : '#000';
          ctx.font = `22pt 'cardkey', 'MatrixBoldSmallCaps', ${fontName[2]}`;
          ctx.textAlign = 'left';
          ctx.fillText(cardData.cardKey.padStart(8, '0'), 54, 1405);
        }
        ctx.fillStyle = '#000';

        // Draw hologram
        if (cardData.holo && loadedImages.holo) {
          ctx.drawImage(loadedImages.holo, 928, 1371, 44, 46);
        }

        // Draw pendulum effect text
        if (cardData.Pendulum) {
          drawCardPendulumInfoText(ctx, offset, fontName);
        }

        // Draw card description
        drawCardInfoText(ctx, offset, fontName);
      } catch (error) {
        console.error('Error drawing card:', error);
      } finally {
        onLoadingChange(false);
      }
    };

    const drawCardImg = (
      ctx: CanvasRenderingContext2D,
      loadedImages: Partial<YugiohCardImages>,
    ) => {
      let cX: number, cY: number, cW: number, cH: number;
      if (cardData.Pendulum) {
        cX = 69;
        cY = 255;
        cW = 862;
        cH = 647;
      } else {
        cX = 123;
        cY = 268;
        cW = 754;
        cH = 754;
      }

      if (loadedImages.photo) {
        const photo = loadedImages.photo;
        const iW = (photo.width / photo.height) * cH;
        const iH = (photo.height / photo.width) * cW;

        if (photo.width <= photo.height * (cardData.Pendulum ? 1.33 : 1)) {
          ctx.drawImage(photo, cX, cY - (iH - cH) / 2, cW, iH);
        } else {
          ctx.drawImage(photo, cX - (iW - cW) / 2, cY, iW, cH);
        }
      }

      if (loadedImages.template) {
        ctx.drawImage(loadedImages.template, 0, 0, 1000, 1450);
      }

      if (loadedImages.attr) {
        ctx.drawImage(loadedImages.attr, 840, 68, 90, 90);
      }
    };

    const drawCardTitle = (
      ctx: CanvasRenderingContext2D,
      offset: any,
      fontName: string[],
    ) => {
      ctx.font = `${57 + offset.tS}pt ${fontName[0]}, ${fontName[3]}, ${
        fontName[4]
      }, ${fontName[5]}`;
      ctx.fillStyle = getRareColor(ctx);
      ctx.fillText(cardData.cardTitle, 77 + offset.tX, 140 + offset.tY, 750);
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    const drawCardInfo = (
      ctx: CanvasRenderingContext2D,
      langStr: LanguageConfig,
      offset: any,
      fontName: string[],
      loadedImages: Partial<YugiohCardImages>,
    ) => {
      ctx.font = `${
        (cardData.cardType === 'Monster' ? 25 : 40) - offset.sS
      }pt ${fontName[1]}`;
      ctx.fillStyle = '#000';

      if (cardData.cardType === 'Monster') {
        // Monster type text
        const cardSubtypeFilter = [
          'Normal',
          'Effect',
          'Slifer',
          'Ra',
          'Obelisk',
          'LDragon',
        ];
        const raceText = cardData.cardCustomRaceEnabled
          ? cardData.cardCustomRace
          : langStr.Race[cardData.cardRace];
        const subtypeText = !cardSubtypeFilter.includes(cardData.cardSubtype)
          ? langStr.Subtype[cardData.cardSubtype]
          : '';
        const eff1Text = langStr.Effect[cardData.cardEff1] || '';
        const eff2Text =
          cardData.cardEff1 !== cardData.cardEff2
            ? langStr.Effect[cardData.cardEff2] || ''
            : '';
        const pendulumText = cardData.Pendulum ? langStr.M_PENDULUM : '';
        const effectText = isEffectMonster() ? langStr.M_EFFECT : '';

        const typeText =
          raceText +
          subtypeText +
          eff1Text +
          eff2Text +
          pendulumText +
          effectText;

        ctx.fillText(
          `${langStr.QUOTE_L}${typeText}${langStr.QUOTE_R}`,
          63 + offset.oX,
          1120 + offset.oY,
          750,
        );

        // ATK
        ctx.font = `33pt 'MatrixBoldSmallCaps', ${fontName[2]}`;
        ctx.textAlign = 'right';
        if (cardData.cardATK.includes('∞')) {
          ctx.font = `Bold 32pt 'Times New Roman', ${fontName[2]}`;
        }
        ctx.fillText(cardData.cardATK, 719, 1353, 95);

        // DEF / LINK
        ctx.font = `33pt 'MatrixBoldSmallCaps', ${fontName[2]}`;
        let defValue = cardData.cardDEF;

        if (isLinkMonster()) {
          defValue = String(
            Object.values(cardData.links).filter(item => item.val).length,
          );
          ctx.font = `28pt 'link', 'MatrixBoldSmallCaps', ${fontName[2]}`;
        } else if (cardData.cardDEF.includes('∞')) {
          ctx.font = `Bold 32pt 'Times New Roman', ${fontName[2]}`;
        }

        ctx.fillText(
          defValue,
          920 - (isLinkMonster() ? 3 : 0),
          1353 - (isLinkMonster() ? 1 : 0),
          95,
        );

        // Level/Rank/Link
        ctx.textAlign = 'left';
        if (!isLinkMonster() && loadedImages.levelOrSubtype) {
          const level = parseInt(cardData.cardLevel);
          for (let i = 1; i <= level; i++) {
            const x = isXyzMonster() ? 122 + (i - 1) * 63 : 820 - (i - 1) * 63;
            ctx.drawImage(loadedImages.levelOrSubtype, x, 181, 58, 58);
          }
        } else if (isLinkMonster()) {
          // Draw link arrows - implement link positioning logic
          drawLinkArrows(ctx, loadedImages);
        }
      } else {
        // Spell/Trap cards
        const typeText =
          (cardData.cardType === 'Spell' ? langStr.Spell : langStr.Trap) +
          (cardData.cardSubtype === 'Normal' ? '' : langStr.SEP);

        ctx.textAlign = 'right';
        ctx.fillText(
          `${langStr.QUOTE_L}${typeText}${langStr.QUOTE_R}`,
          920 + offset.sX1,
          222 + offset.sY1,
        );

        if (cardData.cardSubtype !== 'Normal' && loadedImages.levelOrSubtype) {
          ctx.drawImage(
            loadedImages.levelOrSubtype,
            820 + offset.sX2,
            178 + offset.sY2,
            58,
            58,
          );
        }
      }
    };

    const drawLinkArrows = (
      ctx: CanvasRenderingContext2D,
      loadedImages: Partial<YugiohCardImages>,
    ) => {
      const linkPosition = {
        Link: {
          X: [86, 410, 826, 70, 0, 878, 86, 410, 826],
          Y: [231, 214, 231, 556, 0, 556, 967, 1020, 967],
          W: [86, 177, 86, 52, 0, 52, 86, 177, 86],
          H: [86, 52, 86, 177, 0, 177, 86, 52, 86],
        },
        LinkPendulum: {
          X: [42, 421, 881, 21, 0, 934, 42, 421, 881],
          Y: [227, 211, 227, 732, 0, 732, 1319, 1365, 1319],
          W: [75, 155, 75, 46, 0, 46, 75, 155, 75],
          H: [75, 46, 75, 155, 0, 155, 75, 46, 75],
        },
      };

      const linkStr = cardData.Pendulum ? 'LinkPendulum' : 'Link';

      for (let i = 1; i <= 9; i++) {
        if (i !== 5 && cardData.links[i]?.val) {
          const linkImg = loadedImages[`link${i}` as keyof YugiohCardImages];
          if (linkImg) {
            ctx.drawImage(
              linkImg,
              linkPosition[linkStr].X[i - 1],
              linkPosition[linkStr].Y[i - 1],
              linkPosition[linkStr].W[i - 1],
              linkPosition[linkStr].H[i - 1],
            );
          }
        }
      }
    };

    const drawCardPendulumInfoText = (
      ctx: CanvasRenderingContext2D,
      offset: any,
      fontName: string[],
    ) => {
      // Draw pendulum scales
      ctx.textAlign = 'center';
      ctx.font = "55pt 'MatrixBoldSmallCaps'";
      const scaleOffset =
        ['Xyz', 'Link', 'Token'].includes(cardData.cardSubtype) ||
        cardData.cardType !== 'Monster'
          ? 5
          : 0;
      ctx.fillText(String(cardData.cardBLUE), 106 - scaleOffset, 1040, 60);
      ctx.fillText(String(cardData.cardRED), 895, 1040, 60);

      // Draw pendulum text
      const fontSize = cardData.pendulumSize;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = `${fontSize}pt ${fontName[2]}, ${fontName[3]}, ${fontName[4]}, ${fontName[5]}`;
      wrapText(
        ctx,
        cardData.cardPendulumInfo,
        160,
        920 + offset.oY,
        660,
        fontSize + offset.lh,
      );
    };

    const drawCardInfoText = (
      ctx: CanvasRenderingContext2D,
      offset: any,
      fontName: string[],
    ) => {
      const fontSize = parseInt(cardData.infoSize);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = `${fontSize}pt ${fontName[2]}, ${fontName[3]}, ${fontName[4]}, ${fontName[5]}`;
      wrapText(
        ctx,
        cardData.cardInfo,
        75,
        1095 + offset.oY + (cardData.cardType === 'Monster' ? 30 : 0),
        825,
        fontSize + offset.lh,
      );
    };

    const getRareColor = (
      ctx: CanvasRenderingContext2D,
    ): string | CanvasGradient => {
      switch (cardData.cardRare) {
        case '2':
          ctx.shadowColor = '#dcff32';
          ctx.shadowBlur = 1;
          ctx.shadowOffsetX = 0.4;
          ctx.shadowOffsetY = 1.5;
          return '#524100';
        case '1': {
          const gradient = ctx.createLinearGradient(0, 0, 600, 0);
          gradient.addColorStop(0, '#ffdabf');
          gradient.addColorStop(0.14, '#fff6bf');
          gradient.addColorStop(0.28, '#fffebf');
          gradient.addColorStop(0.42, '#d8ffbf');
          gradient.addColorStop(0.56, '#bfffd4');
          gradient.addColorStop(0.7, '#bffdff');
          gradient.addColorStop(0.84, '#bfe4ff');
          gradient.addColorStop(1, '#bfc2ff');
          return gradient;
        }
        default:
          return cardData.titleColor;
      }
    };

    const wrapText = (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
    ) => {
      let lineWidth = 0 - ctx.measureText(text[0]).width;
      let initHeight = y;
      let lastSubStrIndex = 0;

      for (let i = 0; i < text.length; i++) {
        lineWidth += ctx.measureText(text[i]).width;

        if (lineWidth > maxWidth || text.substring(i, i + 1) === '\n') {
          if (text.substring(i, i + 1) === '\n') i++;
          ctx.fillText(text.substring(lastSubStrIndex, i), x, initHeight);
          initHeight += lineHeight;
          lineWidth = 0;
          lastSubStrIndex = i;
        }

        if (i === text.length - 1) {
          ctx.fillText(text.substring(lastSubStrIndex, i + 1), x, initHeight);
        }
      }
    };

    useEffect(() => {
      drawCard();
    }, [cardData, cardMeta]);

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-auto border rounded shadow-lg"
        style={{ maxWidth: '500px', maxHeight: '725px' }}
      />
    );
  },
);

YugiohCardCanvas.displayName = 'YugiohCardCanvas';

export default YugiohCardCanvas;
