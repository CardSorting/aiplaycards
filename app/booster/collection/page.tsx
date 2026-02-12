export const dynamic = 'force-dynamic';

/**
 * Redirect legacy booster collection route to the unified Gallery.
 */
import { redirect } from 'next/navigation';

export default function BoosterCollectionRedirect() {
  redirect('/gallery');
}
