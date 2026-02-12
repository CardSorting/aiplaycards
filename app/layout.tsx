import { FC, ReactNode } from 'react';
import ClientLayout from './ClientLayout';
import Favicon from '../src/components/Favicon';
import SEO from '../src/layout/SEO';
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent ethereum property redefinition errors from browser extensions
              (function() {
                if (typeof window === 'undefined') return;

                // Store original defineProperty
                const originalDefineProperty = Object.defineProperty;

                // Override defineProperty to handle ethereum conflicts
                Object.defineProperty = function(obj, prop, descriptor) {
                  // Check if this is an attempt to define ethereum on window
                  if (obj === window && prop === 'ethereum') {
                    // If ethereum already exists, return the existing value
                    if (window.ethereum) {
                      return window.ethereum;
                    }

                    // If it doesn't exist, allow the definition but make it non-configurable
                    try {
                      return originalDefineProperty.call(this, obj, prop, {
                        ...descriptor,
                        configurable: false
                      });
                    } catch (e) {
                      // If it fails, just return the existing value or undefined
                      return window.ethereum || undefined;
                    }
                  }

                  // For all other properties, use the original defineProperty
                  return originalDefineProperty.call(this, obj, prop, descriptor);
                };
              })();
            `,
          }}
        />
        <Favicon />
        <SEO
          title="PlayMoreTCG.com"
          description="Create your own custom Pokémon cards in the modern Sword and Shield format, including Pokémon-V, V-Max and Full Art Trainers!"
          url="https://playmoretcg.com"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
};

export default RootLayout;
