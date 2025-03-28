'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Players', icon: 'M18 18v2H6v-2h12zm0-8v2H6v-2h12zm0-8v2H6V2h12z' },
    { href: '/matches', label: 'Record Match', icon: 'M18 13h-5v5h-2v-5H6v-2h5V6h2v5h5v2z' },
    { href: '/history', label: 'Match History', icon: 'M13.91 2.91L16.09 5.09L8 13.18V16H10.82L18.92 7.92L21.1 10.1L13 18.2L8 20.01L2.5 13L13.91 2.91Z' },
  ];

  return (
    <header style={{
      backgroundColor: '#1e40af',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '1.5rem',
          paddingBottom: '1.5rem',
        }}>
          {/* App Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              marginRight: '0.75rem',
              padding: '0.5rem',
              overflow: 'hidden'
            }}>
              <img 
                src="/images/Logo.png" 
                alt="ELO Tracker Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.style.display = 'none'; // Hide the image
                  // Fallback to text logo
                  e.target.parentNode.innerHTML = '<span style="color: white; font-weight: bold; font-size: 1.25rem;">ET</span>';
                }}
              />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '-0.025em',
                lineHeight: '1.2'
              }}>
                ELO Tracker
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: '0.25rem'
              }}>
                Track player ratings and match history
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            padding: '0.25rem'
          }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    margin: '0 0.25rem',
                    backgroundColor: isActive ? 'white' : 'transparent',
                    color: isActive ? '#1e40af' : 'white'
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ marginRight: '0.5rem' }}
                  >
                    <path d={item.icon} fill="currentColor" />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;