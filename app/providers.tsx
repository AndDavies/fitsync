"use client";

import { GeistProvider, CssBaseline, Themes } from '@geist-ui/core'

const customTheme = Themes.createFromDark({
  type: 'myCustomDark',
  palette: {
    background: '#1F2937',
    foreground: '#F9FAFB',
    accents_1: '#FAFAFA',
    accents_2: '#E5E7EB',
    accents_3: '#D1D5DB',
    accents_4: '#9CA3AF',
    accents_5: '#6B7280',
    accents_6: '#4B5563',
    accents_7: '#374151',
    accents_8: '#1F2937',
    success: '#EC4899',
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GeistProvider themes={[customTheme]} themeType="myCustomDark">
      <CssBaseline />
      {children}
    </GeistProvider>
  );
}
