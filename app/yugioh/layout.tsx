import { ReactNode } from 'react';

export default function YugiohLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: `
        url('/assets/yugioh/Screentone.png') repeat,
        linear-gradient(to bottom right, rgba(0,0,0,0.73), rgba(102,102,102,0.6), rgba(0,0,0,0.73)),
        linear-gradient(to bottom left, rgba(17,17,17,0.73), rgba(17,17,17,0.6), rgba(17,17,17,0.73))
      `,
        backgroundBlendMode: 'multiply',
        fontFamily:
          "'Noto Sans JP', 'Noto Sans TC', 'Noto Sans SC', 'arial', '微軟正黑體'",
      }}
    >
      {children}
    </div>
  );
}
