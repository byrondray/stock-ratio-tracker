# Commodity Ratio Dashboard

## Overview

A real-time dashboard tracking Gold/Silver and Gold/Lumber ratios using market data from Polygon.io API.

## Installation

```bash
npm install
# Create .env.local with your Polygon API key
NEXT_PUBLIC_POLYGON_API_KEY=your_key_here
```

## Usage

```bash
npm run dev
```

## Features

- Real-time ratio tracking
- Time period selection (1M-5Y)
- Interactive charts with zoom/pan
- Historical data visualization

## Market Analysis

### Gold/Silver Ratio

- **High Ratio**: Indicates market fear/uncertainty
  - Investors prefer gold as safe haven
  - Defensive positioning
- **Low Ratio**: Shows risk appetite
  - Industrial silver demand rises
  - Economic optimism

### Gold/Lumber Ratio

- **High Ratio**: Risk-off sentiment
  - Housing market weakness
  - Construction slowdown
  - Economic uncertainty
- **Low Ratio**: Risk-on environment
  - Strong housing market
  - Construction boom
  - Economic growth

## Tech Stack

- Next.js
- Recharts
- Tailwind CSS
- Polygon.io API
