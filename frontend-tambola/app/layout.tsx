import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/query-provider';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Multiplayer Bingo',
  description: 'Real-time multiplayer Bingo game',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
