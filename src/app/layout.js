import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ELO Tracker - Player Rating System',
  description: 'Track player ELO and TrueSkill ratings for games and matches',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body 
        className={inter.className}
        style={{
          backgroundColor: '#f5f7fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Navigation />
        
        <main style={{
          flex: '1',
          paddingTop: '2rem',
          paddingBottom: '3rem'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            {children}
          </div>
        </main>
        
        <footer style={{
          backgroundColor: '#1e3a8a', 
          color: 'white',
          textAlign: 'center',
          padding: '1.5rem',
          fontSize: '0.875rem'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              ELO Tracker &copy; {new Date().getFullYear()} - Player rating system for competitive games
            </p>
          </div>
        </footer>

        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              borderRadius: '8px',
              backgroundColor: 'white',
              padding: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              fontFamily: 'inherit'
            }
          }}
        />
      </body>
    </html>
  );
}