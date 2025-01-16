// layout.tsx (No major changes, but an idea)
import "./globals.css";     
import { Providers } from "./providers";   

export const metadata = {
  title: 'FitSync',
  description: 'Your fitness companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If you want a global spinner while auth is initializing:
  // You can do a small trick by hooking into AuthProvider's loading if exposed,
  // or handle it in pages as we did.

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <Providers>
              {children}
        </Providers >
      </body>
    </html>
  );
}
