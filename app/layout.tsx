// app/layout.tsx
"use client";

import { AuthProvider } from './context/AuthContext';
import "./globals.css";

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
      <body className="antialiased ">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
