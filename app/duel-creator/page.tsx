import { Metadata } from 'next';
import { YugiohEditorNew } from '@features/yugiohEditor';

export const metadata: Metadata = {
  title: 'Duel Card Creator',
  description: 'Create custom duel cards with our card maker tool',
};

export default function DuelCreatePage() {
  return <YugiohEditorNew />;
}
