import { FC } from 'react';

const Favicon: FC = () => {
  // Using static primary color since this component runs on the server
  const primaryColor = '#007AFF'; // Apple Blue from theme

  return (
    <>
      <link rel="manifest" href="/favicon/manifest.json" />
      <link
        rel="apple-touch-icon"
        sizes="60x60"
        href="/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/safari-pinned-tab.svg"
        color={primaryColor}
      />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <meta name="msapplication-TileColor" content={primaryColor} />
      <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      <meta name="theme-color" content={primaryColor} />
    </>
  );
};

export default Favicon;
