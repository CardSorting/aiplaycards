import { Button, ButtonProps } from '@mui/material';
import { Link } from 'react-router-dom';
import Routes from '@routes';
import { useSession } from '@hooks/useSession';

type Props = Omit<ButtonProps, 'component' | 'to'> & {
  label: string;
};

export default function OpenPackButton({ label, ...props }: Props) {
  const { data: session } = useSession();
  const user = session?.user;

  // For now, always behave as "authenticated" for the demo/migration
  // In a real app, this would check session status
  const href = user ? (typeof Routes.BoosterPacks === 'string' ? Routes.BoosterPacks : '/') : '/signin';

  return (
    <Button
      component={Link as any}
      to={href}
      {...props}
    >
      {label}
    </Button>
  );
}
