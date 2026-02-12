'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { MTGCard } from '../../types';
import { getFrameColorFromCard, parseCardType } from '../../utils/cardUtils';

interface MTGCardFrameProps {
  card: MTGCard;
  className?: string;
}

export function MTGCardFrame({ card, className }: MTGCardFrameProps) {
  const cardType = parseCardType(card.type);
  const frameColor = getFrameColorFromCard(card);
  const isCreature = cardType.types.includes('Creature');
  const isPlaneswalker = cardType.types.includes('Planeswalker');
  // const isLand = cardType.types.includes('Land');
  // const isArtifact = cardType.types.includes('Artifact');
  const isFullArt = card.layout === 'full_art';

  // Authentic MTG frame colors based on real cards
  const frameColors: Record<string, string> = {
    white:
      'linear-gradient(180deg, #FFFBD5 0%, #FFF2C7 15%, #F5E6A3 35%, #E6D077 65%, #D4B94A 85%, #C4A532 100%)',
    blue: 'linear-gradient(180deg, #B5CDE3 0%, #9DC5E0 15%, #7FB8DC 35%, #5BA8D6 65%, #3B98D0 85%, #1B88CA 100%)',
    black:
      'linear-gradient(180deg, #C9BDB0 0%, #B8ADA0 15%, #A69C90 35%, #938B80 65%, #7A7A70 85%, #616960 100%)',
    red: 'linear-gradient(180deg, #F4D5D0 0%, #F0C3BD 15%, #ECB0AA 35%, #E79D97 65%, #E28A84 85%, #DD7771 100%)',
    green:
      'linear-gradient(180deg, #C5D4AA 0%, #B8C99C 15%, #AABF8E 35%, #9CB480 65%, #8EAA72 85%, #80A064 100%)',
    colorless:
      'linear-gradient(180deg, #D3D3D3 0%, #C5C5C5 15%, #B7B7B7 35%, #A9A9A9 65%, #9B9B9B 85%, #8D8D8D 100%)',
    multicolor:
      'linear-gradient(45deg, #FFD700 0%, #E6C200 25%, #CCAD00 50%, #B39900 75%, #998400 100%)',
    artifact:
      'linear-gradient(180deg, #D8CDD6 0%, #CFC4CD 15%, #C6BAC4 35%, #BDB1BB 65%, #B4A7B2 85%, #AB9EA9 100%)',
    land: 'linear-gradient(180deg, #C4B5A0 0%, #B8A994 15%, #AC9D88 35%, #A0917C 65%, #948570 85%, #887964 100%)',
    // Token frame (slightly different styling)
    token:
      'linear-gradient(180deg, #F5F5F5 0%, #EDEDED 15%, #E5E5E5 35%, #DDDDDD 65%, #D5D5D5 85%, #CDCDCD 100%)',
    // Hybrid colors for multicolor cards
    'hybrid-wu':
      'linear-gradient(135deg, #FFFBD5 0%, #FFF2C7 25%, #B5CDE3 50%, #9DC5E0 75%, #7FB8DC 100%)',
    'hybrid-wb':
      'linear-gradient(135deg, #FFFBD5 0%, #FFF2C7 25%, #C9BDB0 50%, #B8ADA0 75%, #A69C90 100%)',
    'hybrid-wr':
      'linear-gradient(135deg, #FFFBD5 0%, #FFF2C7 25%, #F4D5D0 50%, #F0C3BD 75%, #ECB0AA 100%)',
    'hybrid-wg':
      'linear-gradient(135deg, #FFFBD5 0%, #FFF2C7 25%, #C5D4AA 50%, #B8C99C 75%, #AABF8E 100%)',
    'hybrid-ub':
      'linear-gradient(135deg, #B5CDE3 0%, #9DC5E0 25%, #C9BDB0 50%, #B8ADA0 75%, #A69C90 100%)',
    'hybrid-ur':
      'linear-gradient(135deg, #B5CDE3 0%, #9DC5E0 25%, #F4D5D0 50%, #F0C3BD 75%, #ECB0AA 100%)',
    'hybrid-ug':
      'linear-gradient(135deg, #B5CDE3 0%, #9DC5E0 25%, #C5D4AA 50%, #B8C99C 75%, #AABF8E 100%)',
    'hybrid-br':
      'linear-gradient(135deg, #C9BDB0 0%, #B8ADA0 25%, #F4D5D0 50%, #F0C3BD 75%, #ECB0AA 100%)',
    'hybrid-bg':
      'linear-gradient(135deg, #C9BDB0 0%, #B8ADA0 25%, #C5D4AA 50%, #B8C99C 75%, #AABF8E 100%)',
    'hybrid-rg':
      'linear-gradient(135deg, #F4D5D0 0%, #F0C3BD 25%, #C5D4AA 50%, #B8C99C 75%, #AABF8E 100%)',
  };

  const getFrameStyles = () => {
    // Authentic MTG card dimensions: 2.5" x 3.5" (ratio 5:7)
    const baseStyles = {
      width: 375,
      height: 523,
      borderRadius: '13px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: card.isToken
        ? '0 4px 12px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3), 0 0 0 3px rgba(200,200,200,0.6)'
        : '0 6px 20px rgba(0,0,0,0.6), 0 3px 10px rgba(0,0,0,0.4), 0 0 0 2px rgba(0,0,0,0.2)',
      fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
      cursor: 'default',
      userSelect: 'none',
    };

    const selectedFrameColor = card.isToken ? 'token' : frameColor;

    return {
      ...baseStyles,
      background: frameColors[selectedFrameColor] || frameColors.colorless,
      ...(card.isToken && {
        border: '2px dashed rgba(100, 100, 100, 0.5)',
      }),
    };
  };

  const renderManaSymbol = (symbol: string) => {
    const symbolData: Record<
      string,
      { bg: string; color: string; border?: string; textShadow?: string }
    > = {
      W: {
        bg: 'radial-gradient(circle at 30% 30%, #FFFBD5 20%, #F5E6A3 50%, #D4B94A 80%)',
        color: '#2C1810',
        border: '#B8860B',
        textShadow: '0 1px 1px rgba(255,255,255,0.6)',
      },
      U: {
        bg: 'radial-gradient(circle at 30% 30%, #B5CDE3 20%, #7FB8DC 50%, #3B98D0 80%)',
        color: '#FFFFFF',
        border: '#1B88CA',
        textShadow: '0 1px 1px rgba(0,0,0,0.8)',
      },
      B: {
        bg: 'radial-gradient(circle at 30% 30%, #C9BDB0 20%, #A69C90 50%, #7A7A70 80%)',
        color: '#FFFFFF',
        border: '#616960',
        textShadow: '0 1px 1px rgba(0,0,0,0.8)',
      },
      R: {
        bg: 'radial-gradient(circle at 30% 30%, #F4D5D0 20%, #ECB0AA 50%, #E28A84 80%)',
        color: '#FFFFFF',
        border: '#DD7771',
        textShadow: '0 1px 1px rgba(0,0,0,0.8)',
      },
      G: {
        bg: 'radial-gradient(circle at 30% 30%, #C5D4AA 20%, #AABF8E 50%, #8EAA72 80%)',
        color: '#FFFFFF',
        border: '#80A064',
        textShadow: '0 1px 1px rgba(0,0,0,0.8)',
      },
      C: {
        bg: 'radial-gradient(circle at 30% 30%, #D3D3D3 20%, #B7B7B7 50%, #9B9B9B 80%)',
        color: '#2C2C2C',
        border: '#8D8D8D',
        textShadow: '0 1px 1px rgba(255,255,255,0.6)',
      },
      X: {
        bg: 'radial-gradient(circle at 30% 30%, #D3D3D3 20%, #B7B7B7 50%, #9B9B9B 80%)',
        color: '#2C2C2C',
        border: '#8D8D8D',
        textShadow: '0 1px 1px rgba(255,255,255,0.6)',
      },
      T: {
        bg: 'radial-gradient(circle at 30% 30%, #D3D3D3 20%, #B7B7B7 50%, #9B9B9B 80%)',
        color: '#2C2C2C',
        border: '#8D8D8D',
        textShadow: '0 1px 1px rgba(255,255,255,0.6)',
      },
    };

    const data = symbolData[symbol] || symbolData['C'];

    // Generic mana (numbers)
    if (/^\d+$/.test(symbol)) {
      return (
        <Box
          component="span"
          sx={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 35% 35%, #F8F8F8 15%, #E8E8E8 40%, #D0D0D0 65%, #B0B0B0 85%, #909090 100%)',
            color: '#000',
            fontSize: '13px',
            fontWeight: '900',
            margin: '0 2px',
            border: '2px solid #555',
            boxShadow:
              'inset 0 2px 4px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.5), 0 0 0 1px rgba(176, 176, 176, 0.3)',
            fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
            textShadow:
              '0 1px 2px rgba(255,255,255,0.8), 0 0 3px rgba(176, 176, 176, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {symbol}
        </Box>
      );
    }

    // Special handling for tap symbol
    if (symbol === 'T') {
      return (
        <Box
          component="span"
          sx={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: data.bg,
            color: '#000',
            fontSize: '13px',
            fontWeight: '900',
            margin: '0 2px',
            border: `2px solid ${data.border}`,
            boxShadow:
              'inset 0 2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.5), 0 0 0 1px rgba(176, 176, 176, 0.3)',
            fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
            textShadow:
              '0 1px 2px rgba(255,255,255,0.8), 0 0 3px rgba(255,255,255,0.6)',
            transform: 'rotate(90deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ↷
        </Box>
      );
    }

    // Colored mana symbols
    return (
      <Box
        component="span"
        sx={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: data.bg,
          color: '#000',
          fontSize: '12px',
          fontWeight: '900',
          margin: '0 2px',
          border: `2px solid ${data.border}`,
          boxShadow:
            'inset 0 2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.5), 0 0 0 1px rgba(176, 176, 176, 0.3)',
          fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
          textShadow:
            '0 1px 2px rgba(255,255,255,0.8), 0 0 3px rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {symbol}
      </Box>
    );
  };

  const renderManaCost = (manaCost: string) => {
    const symbols = manaCost.match(/\{([^}]+)\}/g) || [];
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {symbols.map((match, index) => {
          const symbol = match.slice(1, -1);
          return <Box key={index}>{renderManaSymbol(symbol)}</Box>;
        })}
      </Box>
    );
  };

  const renderCardText = (text: string) => {
    const paragraphs = text.split('\n\n');

    return paragraphs.map((paragraph, index) => {
      // Check if this is a keyword ability (starts with a capital word followed by dash)
      const isKeywordAbility = paragraph.match(
        /^[A-Z][a-z]+(\s[A-Z][a-z]+)*\s*—/,
      );
      // Check if this is flavor text (italic style)
      const isFlavorText = paragraph.match(/^[a-z]/) && paragraph.length < 80;

      return (
        <Typography
          key={index}
          sx={{
            fontSize: isKeywordAbility ? '16px' : '15px',
            lineHeight: isKeywordAbility ? 1.3 : 1.4,
            mb: index < paragraphs.length - 1 ? 1.5 : 0,
            color: '#000',
            fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
            textAlign: 'left',
            fontWeight: isKeywordAbility ? 'bold' : 'normal',
            fontStyle: isFlavorText ? 'italic' : 'normal',
            letterSpacing: '0.02em',
            wordSpacing: '0.05em',
            textIndent: isKeywordAbility ? '0px' : '0px',
            paddingLeft: isKeywordAbility ? '8px' : '0px',
            marginLeft: isKeywordAbility ? '0px' : '0px',
            position: 'relative',
            ...(isFlavorText && {
              color: '#555',
              fontStyle: 'italic',
              textAlign: 'center',
              fontSize: '10px',
              lineHeight: 1.4,
              marginTop: '4px',
              marginBottom: '2px',
            }),
            ...(isFullArt && {
              WebkitTextStroke: 'none',
              textShadow: 'none',
              color: '#FFFFFF',
            }),
          }}
        >
          {paragraph.split(/(\{[^}]+\})/).map((part, partIndex) => {
            if (part.match(/^\{[^}]+\}$/)) {
              const symbol = part.slice(1, -1);
              return (
                <Box
                  key={partIndex}
                  component="span"
                  sx={{
                    display: 'inline-block',
                    transform: 'translateY(-0.5px)',
                    mx: 0.3,
                    verticalAlign: 'middle',
                  }}
                >
                  {renderManaSymbol(symbol)}
                </Box>
              );
            }
            return part;
          })}
        </Typography>
      );
    });
  };

  // Helper function to get color-specific decorative elements
  const getColorAccents = () => {
    const accentColors: Record<string, string> = {
      white: 'rgba(255, 215, 0, 0.3)',
      blue: 'rgba(33, 150, 243, 0.4)',
      black: 'rgba(97, 97, 97, 0.4)',
      red: 'rgba(244, 67, 54, 0.4)',
      green: 'rgba(76, 175, 80, 0.4)',
      colorless: 'rgba(158, 158, 158, 0.3)',
      multicolor: 'rgba(255, 193, 7, 0.4)',
      artifact: 'rgba(156, 39, 176, 0.3)',
      land: 'rgba(121, 85, 72, 0.3)',
    };
    return accentColors[frameColor] || accentColors.colorless;
  };

  const renderCardContent = () => {
    if (isFullArt) {
      // Full Art Layout - Text overlays positioned on artwork with invisible artwork area
      return (
        <>
          {/* Full Art Name and Mana Cost Bar */}
          <Box
            sx={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '0px',
              border: 'none',
              boxShadow: 'none',
              marginTop: '8px',
              marginLeft: '8px',
              marginRight: '8px',
            }}
          >
            <Typography
              sx={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                fontFamily: '"Beleren Bold", "Times New Roman", serif',
                letterSpacing: '0.2px',
                WebkitTextStroke: 'none',
                textShadow: 'none',
              }}
            >
              {card.name || 'Card Name'}
            </Typography>
            {card.manaCost && renderManaCost(card.manaCost)}
          </Box>

          {/* Invisible Artwork Area - maintains spacing like normal layout */}
          <Box
            sx={{
              height: '205px',
              position: 'relative',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
              marginLeft: '8px',
              marginRight: '8px',
            }}
          >
            {/* Artwork is already the background, this is just for spacing */}
          </Box>

          {/* Full Art Type Line */}
          <Box
            sx={{
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              background: 'rgba(0,0,0,0.7)',
              border: 'none',
              boxShadow: 'none',
              marginLeft: '8px',
              marginRight: '8px',
              marginTop: '4px',
            }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                fontFamily: '"Beleren Bold", "Times New Roman", serif',
                letterSpacing: '0.1px',
                WebkitTextStroke: 'none',
                textShadow: 'none',
              }}
            >
              {card.type || 'Card Type'}
            </Typography>
          </Box>

          {/* Full Art Text Box */}
          <Box
            sx={{
              flex: 1,
              minHeight: '160px',
              maxHeight: '180px',
              p: 1,
              pt: 1,
              pb: 1,
              background: 'rgba(0,0,0,0.7)',
              border: 'none',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: card.text ? 'flex-start' : 'center',
              position: 'relative',
              marginLeft: '8px',
              marginRight: '8px',
              marginBottom: '4px',
              marginTop: '12px',
            }}
          >
            {card.text ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  width: '100%',
                }}
              >
                {renderCardText(card.text)}
              </Box>
            ) : (
              <Typography
                sx={{
                  fontSize: '18px',
                  color: '#FFFFFF',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
                  WebkitTextStroke: 'none',
                  textShadow: 'none',
                }}
              >
                [Rules text]
              </Typography>
            )}
          </Box>

          {/* Full Art Flavor Text */}
          {card.flavorText && (
            <Box
              sx={{
                minHeight: '35px',
                p: 2,
                pt: 1,
                background: 'rgba(0,0,0,0.7)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'none',
                marginLeft: '8px',
                marginRight: '8px',
                marginBottom: '32px',
                marginTop: '6px',
              }}
            >
              <Typography
                sx={{
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  width: '100%',
                  fontFamily:
                    'var(--mtg-flavor-font), "Times New Roman", serif',
                  lineHeight: 1.5,
                  marginTop: '2px',
                  marginBottom: '2px',
                  WebkitTextStroke: 'none',
                  textShadow: 'none',
                }}
              >
                <em>{card.flavorText}</em>
              </Typography>
            </Box>
          )}

          {/* Full Art Power/Toughness or Loyalty */}
          {(isCreature || isPlaneswalker) && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: isPlaneswalker ? '42px' : '56px',
                height: '38px',
                background: 'rgba(0,0,0,0.8)',
                border: '2px solid rgba(255,255,255,0.8)',
                borderRadius: isPlaneswalker ? '10px' : '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(2px)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  fontFamily: 'var(--mtg-title-font), "Times New Roman", serif',
                  WebkitTextStroke: 'none',
                  textShadow: 'none',
                  position: 'relative',
                  zIndex: 2,
                  letterSpacing: '0.5px',
                  ...(isPlaneswalker && {
                    fontSize: '18px',
                    letterSpacing: '0.3px',
                  }),
                }}
              >
                {isPlaneswalker
                  ? card.loyalty || '3'
                  : `${card.power || '1'}/${card.toughness || '1'}`}
              </Typography>
            </Box>
          )}

          {/* Full Art Artist and Set Info */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              background: 'rgba(0,0,0,0.8)',
              borderRadius: '12px',
              px: 1.5,
              py: 0.5,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(5px)',
            }}
          >
            {card.artist && (
              <Typography
                sx={{
                  fontSize: '9px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
                  WebkitTextStroke: 'none',
                  textShadow: 'none',
                }}
              >
                {card.artist}
              </Typography>
            )}
            {card.set && (
              <Typography
                sx={{
                  fontSize: '10px',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
                  WebkitTextStroke: 'none',
                  textShadow: 'none',
                }}
              >
                {card.set}
              </Typography>
            )}
            {card.rarity && (
              <Box
                sx={{
                  width: '12px',
                  height: '12px',
                  border: '1px solid #000',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  ...(card.rarity === 'mythic' && {
                    background:
                      'conic-gradient(from 45deg, #BF4F27 0%, #D4AF37 25%, #FF6B35 50%, #D4AF37 75%, #BF4F27 100%)',
                    borderRadius: '2px',
                    transform: 'rotate(45deg)',
                    boxShadow: '0 0 8px rgba(191, 79, 39, 0.6)',
                  }),
                  ...(card.rarity === 'rare' && {
                    background:
                      'radial-gradient(circle, #FFD700 20%, #FFC107 50%, #DAA520 80%, #B8860B 100%)',
                    borderRadius: '2px',
                    boxShadow: '0 0 6px rgba(255, 215, 0, 0.5)',
                  }),
                  ...(card.rarity === 'uncommon' && {
                    background:
                      'radial-gradient(circle, #F5F5F5 20%, #E0E0E0 50%, #C0C0C0 80%, #A0A0A0 100%)',
                    borderRadius: '50%',
                    boxShadow: '0 0 4px rgba(192, 192, 192, 0.4)',
                  }),
                  ...(card.rarity === 'common' && {
                    background:
                      'radial-gradient(circle, #6A6A6A 20%, #4A4A4A 50%, #2A2A2A 80%, #1A1A1A 100%)',
                    borderRadius: '50%',
                    boxShadow: '0 0 3px rgba(74, 74, 74, 0.3)',
                  }),
                }}
              />
            )}
          </Box>
        </>
      );
    }

    // Normal Layout - Standard card structure
    return (
      <>
        {/* Enhanced Name and Mana Cost Bar */}
        <Box
          sx={{
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            background: `linear-gradient(180deg, 
              #F8F5F0 0%, 
              #F2EFE8 25%, 
              #ECE9E1 50%, 
              #E6E3DA 75%, 
              #E0DDD3 100%)
            `,
            borderRadius: '6px 6px 0 0',
            border: '1.5px solid #8B6914',
            borderBottom: '1px solid #6B5411',
            boxShadow: `
              inset 0 1px 2px rgba(255,255,255,0.8), 
              inset 0 -1px 1px rgba(0,0,0,0.1),
              0 1px 3px rgba(0,0,0,0.3)
            `,
            ...(card.isToken && {
              background: `linear-gradient(180deg, 
                #FAFAFA 0%, 
                #F5F5F5 25%, 
                #F0F0F0 50%, 
                #EBEBEB 75%, 
                #E6E6E6 100%)
              `,
              border: '1.5px solid #999999',
            }),
          }}
        >
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#1A1A1A',
              fontFamily: '"Beleren Bold", "Times New Roman", serif',
              letterSpacing: '0.2px',
              textShadow: '0 0 1px rgba(255,255,255,0.8)',
              ...(card.isToken && {
                fontStyle: 'italic',
                color: '#333333',
              }),
            }}
          >
            {card.name || 'Card Name'} {card.isToken && '(Token)'}
          </Typography>
          {card.manaCost && renderManaCost(card.manaCost)}
        </Box>

        {/* Enhanced Artwork Area - only for normal layout */}
        {!isFullArt && (
          <Box
            sx={{
              height: '205px',
              position: 'relative',
              backgroundColor: card.imageUrl ? 'transparent' : '#1a1a1a',
              backgroundImage: card.imageUrl
                ? `url(${card.imageUrl})`
                : 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
              backgroundSize: card.imageUrl ? 'cover' : '16px 16px',
              backgroundPosition: card.imageUrl
                ? 'center'
                : '0 0, 0 8px, 8px -8px, -8px 0px',
              border: '2.5px solid rgba(0,0,0,0.8)',
              borderTop: 'none',
              borderBottom: '2px solid rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `
                inset 0 3px 6px rgba(0,0,0,0.4), 
                inset 0 0 0 1px rgba(0,0,0,0.3),
                inset 0 0 20px rgba(0,0,0,0.1)
              `,
            }}
          >
            {!card.imageUrl && (
              <Typography
                sx={{
                  color: '#888',
                  fontSize: '18px',
                  fontStyle: 'italic',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
                }}
              >
                [Artwork]
              </Typography>
            )}
          </Box>
        )}

        {/* Enhanced Type Line */}
        <Box
          sx={{
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            background: `linear-gradient(180deg, 
              #F8F5F0 0%, 
              #F2EFE8 25%, 
              #ECE9E1 50%, 
              #E6E3DA 75%, 
              #E0DDD3 100%)
            `,
            border: '1.5px solid #8B6914',
            borderTop: 'none',
            borderBottom: '1px solid #6B5411',
            boxShadow: `
              inset 0 1px 2px rgba(255,255,255,0.8), 
              inset 0 -1px 1px rgba(0,0,0,0.1),
              0 1px 2px rgba(0,0,0,0.2)
            `,
            ...(card.isToken && {
              background: `linear-gradient(180deg, 
                #FAFAFA 0%, 
                #F5F5F5 25%, 
                #F0F0F0 50%, 
                #EBEBEB 75%, 
                #E6E6E6 100%)
              `,
              border: '1.5px solid #999999',
              borderTop: 'none',
            }),
          }}
        >
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#1A1A1A',
              fontFamily: '"Beleren Bold", "Times New Roman", serif',
              letterSpacing: '0.1px',
              textShadow: '0 0 1px rgba(255,255,255,0.8)',
              ...(card.isToken && {
                color: '#333333',
              }),
            }}
          >
            {card.type || 'Card Type'}
          </Typography>
        </Box>

        {/* Enhanced Text Box */}
        <Box
          sx={{
            flex: 1,
            minHeight: '160px',
            maxHeight: '180px',
            p: 1,
            pt: 1,
            pb: 1,
            background: `linear-gradient(180deg, 
              #FFFEF9 0%, 
              #FDFCF7 30%,
              #FBFAF5 70%,
              #F9F8F3 100%)
            `,
            border: '1.5px solid #8B6914',
            borderTop: 'none',
            borderBottom: card.flavorText
              ? '1px solid #6B5411'
              : '1.5px solid #8B6914',
            marginTop: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: card.text ? 'flex-start' : 'center',
            boxShadow: `
              inset 0 2px 4px rgba(0,0,0,0.05), 
              inset 0 0 0 1px rgba(139, 105, 20, 0.1),
              inset 0 0 15px rgba(139, 105, 20, 0.02)
            `,
            position: 'relative',
            ...(card.isToken && {
              background: `linear-gradient(180deg, 
                #FEFEFE 0%, 
                #FCFCFC 30%,
                #FAFAFA 70%,
                #F8F8F8 100%)
              `,
              border: '1.5px solid #999999',
              borderTop: 'none',
              borderBottom: card.flavorText
                ? '1px solid #777777'
                : '1.5px solid #999999',
            }),
          }}
        >
          {card.text ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                width: '100%',
              }}
            >
              {renderCardText(card.text)}
            </Box>
          ) : (
            <Typography
              sx={{
                fontSize: '16px',
                color: '#aaa',
                fontStyle: 'italic',
                textAlign: 'center',
                fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
              }}
            >
              [Rules text]
            </Typography>
          )}
        </Box>

        {/* Enhanced Flavor Text */}
        {card.flavorText && (
          <Box
            sx={{
              minHeight: '30px',
              p: 2,
              pt: 1,
              background: `linear-gradient(180deg, 
                rgba(255,255,255,0.99) 0%, 
                rgba(252,252,252,0.97) 30%,
                rgba(248,248,248,0.95) 70%,
                rgba(245,245,245,0.93) 100%)
              `,
              border: '2.5px solid rgba(0,0,0,0.8)',
              borderTop: 'none',
              display: 'flex',
              alignItems: 'center',
              borderBottom: `2px solid ${getColorAccents()}`,
              boxShadow: `
                inset 0 2px 4px rgba(255,255,255,0.9),
                inset 0 -1px 2px rgba(0,0,0,0.05),
                0 1px 3px rgba(0,0,0,0.1)
              `,
              marginTop: '6px',
              marginBottom: '16px',
            }}
          >
            <Typography
              sx={{
                fontSize: '12px',
                fontStyle: 'italic',
                color: '#555',
                textAlign: 'center',
                width: '100%',
                fontFamily: 'var(--mtg-flavor-font), "Times New Roman", serif',
                lineHeight: 1.5,
                marginTop: '2px',
                marginBottom: '2px',
              }}
            >
              <em>{card.flavorText}</em>
            </Typography>
          </Box>
        )}

        {/* Enhanced Power/Toughness or Loyalty */}
        {(isCreature || isPlaneswalker) && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              width: isPlaneswalker ? '42px' : '56px',
              height: '38px',
              background: `linear-gradient(135deg, 
                rgba(255,255,255,0.98) 0%, 
                rgba(248,248,248,0.95) 30%,
                rgba(240,240,240,0.92) 70%,
                rgba(230,230,230,0.88) 100%)
              `,
              border: `3px solid rgba(0,0,0,0.9)`,
              borderRadius: isPlaneswalker ? '10px' : '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `
                inset 0 3px 6px rgba(255,255,255,0.9), 
                inset 0 -2px 4px rgba(0,0,0,0.15),
                0 4px 12px rgba(0,0,0,0.5),
                0 0 0 2px ${getColorAccents()},
                0 0 8px rgba(0,0,0,0.3)
              `,
              backdropFilter: 'blur(2px)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '2px',
                left: '2px',
                right: '2px',
                bottom: '2px',
                background: `linear-gradient(135deg, 
                  rgba(255,255,255,0.6) 0%, 
                  rgba(255,255,255,0.3) 50%,
                  rgba(255,255,255,0.1) 100%)
                `,
                borderRadius: isPlaneswalker ? '7px' : '5px',
                zIndex: 1,
              },
            }}
          >
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#000',
                fontFamily: 'var(--mtg-title-font), "Times New Roman", serif',
                textShadow:
                  '0 1px 3px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.6)',
                position: 'relative',
                zIndex: 2,
                letterSpacing: '0.5px',
                ...(isPlaneswalker && {
                  fontSize: '18px',
                  letterSpacing: '0.3px',
                }),
              }}
            >
              {isPlaneswalker
                ? card.loyalty || '3'
                : `${card.power || '1'}/${card.toughness || '1'}`}
            </Typography>
          </Box>
        )}

        {/* Enhanced Artist and Set Info */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            px: 1.5,
            py: 0.5,
            border: `1px solid ${getColorAccents()}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(5px)',
          }}
        >
          {card.artist && (
            <Typography
              sx={{
                fontSize: '9px',
                color: '#000',
                fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
                textShadow: '0 1px 1px rgba(255,255,255,0.8)',
              }}
            >
              {card.artist}
            </Typography>
          )}
          {card.set && (
            <Typography
              sx={{
                fontSize: '10px',
                color: '#000',
                fontWeight: 'bold',
                fontFamily: 'var(--mtg-body-font), "Times New Roman", serif',
                textShadow: '0 1px 1px rgba(255,255,255,0.8)',
              }}
            >
              {card.set}
            </Typography>
          )}
          {card.rarity && (
            <Box
              sx={{
                width: '12px',
                height: '12px',
                border: '1px solid #000',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                ...(card.rarity === 'mythic' && {
                  background:
                    'conic-gradient(from 45deg, #BF4F27 0%, #D4AF37 25%, #FF6B35 50%, #D4AF37 75%, #BF4F27 100%)',
                  borderRadius: '2px',
                  transform: 'rotate(45deg)',
                  boxShadow: '0 0 8px rgba(191, 79, 39, 0.6)',
                }),
                ...(card.rarity === 'rare' && {
                  background:
                    'radial-gradient(circle, #FFD700 20%, #FFC107 50%, #DAA520 80%, #B8860B 100%)',
                  borderRadius: '2px',
                  boxShadow: '0 0 6px rgba(255, 215, 0, 0.5)',
                }),
                ...(card.rarity === 'uncommon' && {
                  background:
                    'radial-gradient(circle, #F5F5F5 20%, #E0E0E0 50%, #C0C0C0 80%, #A0A0A0 100%)',
                  borderRadius: '50%',
                  boxShadow: '0 0 4px rgba(192, 192, 192, 0.4)',
                }),
                ...(card.rarity === 'common' && {
                  background:
                    'radial-gradient(circle, #6A6A6A 20%, #4A4A4A 50%, #2A2A2A 80%, #1A1A1A 100%)',
                  borderRadius: '50%',
                  boxShadow: '0 0 3px rgba(74, 74, 74, 0.3)',
                }),
              }}
            />
          )}
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ ...getFrameStyles(), ...(className ? { className } : {}) }}>
      {/* Enhanced outer border with color accent - only for normal layout */}
      {!isFullArt && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, #1a1a1a 0%, #000 50%, #1a1a1a 100%)`,
            borderRadius: '13px',
            border: '0.5px solid #000',
            boxShadow: '0 0 0 0.5px #000',
          }}
        />
      )}

      {/* Color accent border - only for normal layout */}
      {!isFullArt && (
        <Box
          sx={{
            position: 'absolute',
            inset: '0px',
            background: frameColors[frameColor] || frameColors.colorless,
            borderRadius: '13px',
            opacity: 0.95,
          }}
        />
      )}

      {/* Decorative corner accents - only for normal layout */}
      {!isFullArt && (
        <>
          {/* Top-left corner */}
          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              width: '20px',
              height: '20px',
              background: `radial-gradient(circle, ${getColorAccents()} 0%, transparent 70%)`,
              borderRadius: '50%',
              opacity: 0.8,
            }}
          />
          {/* Top-right corner */}
          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '20px',
              height: '20px',
              background: `radial-gradient(circle, ${getColorAccents()} 0%, transparent 70%)`,
              borderRadius: '50%',
              opacity: 0.8,
            }}
          />
          {/* Bottom-left corner */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              width: '20px',
              height: '20px',
              background: `radial-gradient(circle, ${getColorAccents()} 0%, transparent 70%)`,
              borderRadius: '50%',
              opacity: 0.8,
            }}
          />
          {/* Bottom-right corner */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              width: '20px',
              height: '20px',
              background: `radial-gradient(circle, ${getColorAccents()} 0%, transparent 70%)`,
              borderRadius: '50%',
              opacity: 0.8,
            }}
          />
        </>
      )}

      {/* Inner frame with enhanced background - only for normal layout */}
      {!isFullArt ? (
        <Box
          sx={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            bottom: '8px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow:
              'inset 0 2px 8px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,0,0,0.4)',
          }}
        >
          {renderCardContent()}
        </Box>
      ) : (
        /* Full Art Layout - Artwork as background with text overlays */
        <Box
          sx={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            right: '0px',
            bottom: '0px',
            borderRadius: '13px',
            overflow: 'hidden',
            background: card.imageUrl
              ? `url(${card.imageUrl})`
              : 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Full Art Text Overlays */}
          <Box
            sx={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              right: '0px',
              bottom: '0px',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            {renderCardContent()}
          </Box>
        </Box>
      )}
    </Box>
  );
}
