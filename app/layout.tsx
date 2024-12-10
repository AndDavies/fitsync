// layout.tsx
"use client";

import { AuthProvider } from './context/AuthContext';
import { GeistProvider, CssBaseline, Themes } from '@geist-ui/core'
import "./globals.css";

const customTheme = Themes.createFromDark({
  type: 'myCustomDark', // unique name for the theme
  palette: {
    background: '#1F2937', // gray-800
    foreground: '#F9FAFB', // near-white text
    accents_1: '#FAFAFA',
    accents_2: '#E5E7EB',
    accents_3: '#D1D5DB',
    accents_4: '#9CA3AF',
    accents_5: '#6B7280',
    accents_6: '#4B5563',
    accents_7: '#374151',
    accents_8: '#1F2937',
    success: '#EC4899', // pink accent
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <GeistProvider themes={[customTheme]} themeType="myCustomDark">
          <CssBaseline />
          <AuthProvider>
            {children}
          </AuthProvider>
        </GeistProvider>
      </body>
    </html>
  );
}
