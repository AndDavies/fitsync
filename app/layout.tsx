// layout.tsx (No major changes, but an idea)
import "./globals.css";
import Providers from "./providers";          
import SupabaseProvider from "./supabase-provider";  
import { AuthProvider } from "./context/AuthContext";

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
          <SupabaseProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </SupabaseProvider>
        </Providers>
      </body>
    </html>
  );
}
