import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ELO Tracker',
  description: 'Track player ELO ratings for games and matches',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="container mx-auto p-4">
          {children}
        </main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
