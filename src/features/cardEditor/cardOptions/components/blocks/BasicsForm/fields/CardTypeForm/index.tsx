import AccordionForm from '@components/AccordionForm';
import { FC } from 'react';
import BaseSetSelector from './fields/BaseSetSelector';
import RaritySelector from './fields/RaritySelector';
import SubtypeSelector from './fields/SubtypeSelector';
import SupertypeSelector from './fields/SupertypeSelector';
import TypeSelector from './fields/TypeSelector';

const CardTypeForm: FC = () => (
  <AccordionForm slug="cardImageForm" header="Card Type">
    <BaseSetSelector />
    <SupertypeSelector />
    <TypeSelector />
    <SubtypeSelector />
    <RaritySelector />
  </AccordionForm>
);

export default CardTypeForm;
