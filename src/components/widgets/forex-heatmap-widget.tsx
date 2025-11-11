'use client'

import React from 'react';

export function ForexHeatmapWidget() {
  return (
    <iframe
      src="https://s.tradingview.com/embed-widget/forex-heat-map/?locale=en&colorTheme=light&width=100%&height=100%&currencies=EUR,USD,JPY,GBP,CHF,AUD,CAD,NZD"
      style={{
        width: '100%',
        height: '100%',
        border: '0',
      }}
      title="Forex Heatmap"
    />
  );
}
