import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { CardContent, Chip, IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Routes from '@routes';
import Image from 'next/image';
import { FC, useCallback, useMemo } from 'react';
import {
  CountDisplay,
  CounterSection,
  EnergyCard,
  TypeContainer,
} from './styles';
import { EnergyCostTypeFieldProps } from './types';

const EnergyCostTypeField: FC<EnergyCostTypeFieldProps> = ({
  type,
  move,
  setMove,
}) => {
  const energyCost = useMemo(
    () => move.energyCost.find(ec => ec.typeId === type.id),
    [move.energyCost, type],
  );

  const add = useCallback(() => {
    const newCost = [...move.energyCost];
    const energyCostIndex = newCost.findIndex(
      ec => ec.typeId === energyCost?.typeId,
    );

    if (energyCostIndex === -1) {
      // Cost amount for this type is 0, add it to the array
      newCost.push({
        amount: 1,
        typeId: type.id,
      });
    } else {
      // Cost amount for this type is greater than 0, add 1
      newCost[energyCostIndex] = {
        ...newCost[energyCostIndex],
        amount: newCost[energyCostIndex].amount + 1,
      };
    }

    setMove({
      ...move,
      energyCost: newCost,
    });
  }, [energyCost, setMove, move, type.id]);

  const remove = useCallback(() => {
    const newCost = [...move.energyCost];
    const energyCostIndex = newCost.findIndex(
      ec => ec.typeId === energyCost?.typeId,
    );

    // Cost amount for this type is 0, do nothing
    if (energyCostIndex === -1) return;

    if (newCost[energyCostIndex].amount === 1) {
      // Cost amount for this type is 1, remove it from the array
      newCost.splice(energyCostIndex, 1);
    } else {
      // Cost amount greater than 1, remove 1
      newCost[energyCostIndex] = {
        ...newCost[energyCostIndex],
        amount: newCost[energyCostIndex].amount - 1,
      };
    }

    setMove({
      ...move,
      energyCost: newCost,
    });
  }, [energyCost, setMove, move]);

  const currentAmount = energyCost?.amount ?? 0;
  const isActive = currentAmount > 0;

  return (
    <EnergyCard
      variant="outlined"
      sx={{
        cursor: 'pointer',
        borderColor: isActive ? 'primary.main' : 'grey.300',
        backgroundColor: isActive ? 'primary.50' : 'grey.50',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isActive ? 2 : 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: isActive ? 'primary.100' : 'primary.25',
          transform: 'scale(1.02)',
          boxShadow: 2,
        },
      }}
      onClick={add}
    >
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          {/* Energy Type Icon */}
          <TypeContainer>
            <Image
              alt={type.displayName}
              layout="fill"
              objectFit="contain"
              src={Routes.Assets.Icons.TypeBorder(type.slug)}
            />
          </TypeContainer>

          {/* Type Name */}
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 500,
              color: isActive ? 'primary.dark' : 'text.secondary',
              textAlign: 'center',
              lineHeight: 1,
            }}
          >
            {type.displayName}
          </Typography>

          {/* Count Display */}
          {isActive ? (
            <Chip
              label={currentAmount}
              size="small"
              color="primary"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 'bold',
                minWidth: 32,
              }}
            />
          ) : (
            <CountDisplay>
              <Typography variant="body2" color="text.disabled">
                0
              </Typography>
            </CountDisplay>
          )}

          {/* Controls */}
          <CounterSection onClick={e => e.stopPropagation()}>
            <IconButton
              size="small"
              onClick={remove}
              disabled={currentAmount === 0}
              sx={{
                width: 28,
                height: 28,
                backgroundColor: currentAmount > 0 ? 'error.light' : 'grey.200',
                color:
                  currentAmount > 0 ? 'error.contrastText' : 'text.disabled',
                '&:hover': {
                  backgroundColor:
                    currentAmount > 0 ? 'error.main' : 'grey.300',
                },
                '&:disabled': {
                  backgroundColor: 'grey.100',
                  color: 'text.disabled',
                },
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={add}
              sx={{
                width: 28,
                height: 28,
                backgroundColor: 'success.light',
                color: 'success.contrastText',
                '&:hover': {
                  backgroundColor: 'success.main',
                },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </CounterSection>
        </Box>
      </CardContent>
    </EnergyCard>
  );
};

export default EnergyCostTypeField;
