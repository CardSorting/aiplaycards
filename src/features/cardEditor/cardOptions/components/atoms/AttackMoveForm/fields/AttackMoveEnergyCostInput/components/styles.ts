import { styled } from '@css';

export const FieldWrapper = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${({ theme }) => theme.spacing(1.5)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);

  ${({ theme }) => theme.breakpoints.down(768)} {
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: ${({ theme }) => theme.spacing(1.25)};
    padding: ${({ theme }) => theme.spacing(1.5)};
  }

  ${({ theme }) => theme.breakpoints.down(600)} {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(1.25)};
  }

  ${({ theme }) => theme.breakpoints.down(480)} {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing(0.75)};
    padding: ${({ theme }) => theme.spacing(1)};
  }
`;
