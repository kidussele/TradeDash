
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';

export function ForexHeatmapWidget() {
  const { theme } = useTheme();

  const widgetSrc = useMemo(() => {
    const config = {
      width: '100%',
      height: '100%',
      currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
      colorTheme: theme === 'dark' ? 'dark' : 'light',
      isTransparent: false,
    };
    return `https://www.tradingview-widget.com/embed-widget/forex-heat-map/?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
  }, [theme]);

  return (
    <iframe
      src={widgetSrc}
      style={{
        width: '100%',
        height: '100%',
        border: '0',
      }}
      title="Forex Heatmap"
      scrolling="no"
    />
  );
}
