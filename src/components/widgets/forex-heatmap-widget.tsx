
'use client';

import React from 'react';

export function ForexHeatmapWidget() {
  return (
    <iframe
      src="https://www.tradingview-widget.com/embed-widget/forex-heat-map/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22currencies%22%3A%5B%22EUR%22%2C%22USD%22%2C%22JPY%22%2C%22GBP%22%2C%22CHF%22%2C%22AUD%22%2C%22CAD%22%2C%22NZD%22%5D%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%7D"
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
