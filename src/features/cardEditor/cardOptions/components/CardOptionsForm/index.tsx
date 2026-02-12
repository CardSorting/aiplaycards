import { FC } from 'react';
import BasicsForm from '../blocks/BasicsForm';
import CardTypeForm from '../blocks/BasicsForm/fields/CardTypeForm';
import CardInfoForm from '../blocks/CardInfoForm';
import DebugForm from '../blocks/DebugForm';
import AllMovesForm from '../blocks/AllMovesForm';
import { Form } from './styles';
import CardDownloader from '../atoms/CardDownloader';
import TypeBarForm from '../blocks/TypeBarForm';
import ImagesForm from '../blocks/ImagesForm';
import SimpleAIGenerator from '../atoms/SimpleAIGenerator/index.simple';

const CardOptionsForm: FC = () => (
  <Form as="form">
    <SimpleAIGenerator />
    <DebugForm />
    <CardTypeForm />
    <BasicsForm />
    <ImagesForm />
    <AllMovesForm />
    <TypeBarForm />
    <CardInfoForm />
    <CardDownloader />
  </Form>
);

export default CardOptionsForm;
