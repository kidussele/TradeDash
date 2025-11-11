
'use client';

import React from 'react';

export function ForexHeatmapWidget() {
  return (
    <iframe
      src="https://www.marketwatch.com/investing/tools/lazy/interday-heatmap/FX"
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
