
'use client'

import React, { useState, useEffect } from 'react';

export function ForexHeatmapWidget() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
    
    // Optional: Listen for theme changes if your app supports live theme switching
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          setTheme(isDarkNow ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);
  
  return (
    <iframe
      src={`https://s.tradingview.com/embed-widget/forex-heat-map/?locale=en&colorTheme=${theme}&width=100%&height=100%&currencies=EUR,USD,JPY,GBP,CHF,AUD,CAD,NZD`}
      style={{
        width: '100%',
        height: '100%',
        border: '0',
      }}
      title="Forex Heatmap"
    />
  );
}
