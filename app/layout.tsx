import "./globals.css";
import Providers from "./providers";          // Client: Geist UI
import SupabaseProvider from "./supabase-provider";  // Client: SessionContextProvider
import { AuthProvider } from "./context/AuthContext"; // Client: Auth logic

export const metadata = {
  title: 'FitSync',
  description: 'Your fitness companion',
}

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
