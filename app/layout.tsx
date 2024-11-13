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
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@100;200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sora">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
