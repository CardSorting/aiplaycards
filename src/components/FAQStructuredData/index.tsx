import { FC } from 'react';
import { generateFAQStructuredData } from '../../utils/seo';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQStructuredDataProps {
  faqs: FAQItem[];
}

const FAQStructuredData: FC<FAQStructuredDataProps> = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  const structuredData = generateFAQStructuredData(faqs);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export default FAQStructuredData;
