import AccordionForm from '@components/AccordionForm';
import { FC } from 'react';
import BackgroundImgCropper from './fields/BackgroundImgCropper';

const ImagesForm: FC = () => {
  return (
    <AccordionForm slug="imagesForm" header="Images">
      <BackgroundImgCropper />
    </AccordionForm>
  );
};

export default ImagesForm;
