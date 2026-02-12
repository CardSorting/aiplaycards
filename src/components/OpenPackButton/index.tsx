'use client';

import { Button, ButtonProps } from '@mui/material';
import Link from 'next/link';
import Routes from '@routes';
import { useMemo } from 'react';

type Props = Omit<ButtonProps<typeof Link>, 'href'> & {
  label: string;
};

// Component that uses Stack Auth when the provider is available
function AuthenticatedOpenPackButton({ label, ...props }: Props) {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <Button
      component={Link}
      href={user ? Routes.BoosterPacks : Routes.Login}
      {...props}
    >
      {label}
    </Button>
  );
}

// Component without Stack Auth
function SimpleOpenPackButton({ label, ...props }: Props) {
  return (
    <Button component={Link} href={Routes.Login} {...props}>
      {label}
    </Button>
  );
}

export default function OpenPackButton({ label, ...props }: Props) {
  const isStackConfigured = useMemo(
    () =>
      Boolean(
        typeof window !== 'undefined' &&
          (window as { __STACK_CLIENT_APP__?: unknown }).__STACK_CLIENT_APP__ &&
          process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
          process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      ),
    [],
  );

  return isStackConfigured ? (
    <AuthenticatedOpenPackButton label={label} {...props} />
  ) : (
    <SimpleOpenPackButton label={label} {...props} />
  );
}
