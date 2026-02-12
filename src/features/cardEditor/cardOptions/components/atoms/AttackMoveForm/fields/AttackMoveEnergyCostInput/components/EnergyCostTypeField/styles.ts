import { styled } from '@css';
import { Card } from '@mui/material';

export const TypeContainer = styled('div')`
  position: relative;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
`;

export const EnergyCard = styled(Card)`
  min-height: 140px;
  width: 100%;
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
  user-select: none;

  &:hover {
    cursor: pointer;
  }
`;

export const CounterSection = styled('div')`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
`;

export const CountDisplay = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background-color: rgba(0, 0, 0, 0.04);
`;
