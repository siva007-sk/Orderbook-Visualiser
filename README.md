# Orderbook Depth 3D Visualizer

A real-time cryptocurrency orderbook visualization tool with AI-powered predictions, built with React, TypeScript, and Three.js.

## Features

- **3D Orderbook Visualization**: Real-time 3D representation of bid/ask orders with depth and time dimensions
- **Market Depth Heatmap**: Overlay showing order concentration and pressure zones
- **Order Flow Animation**: Animated particles showing order placement and execution
- **AI-Powered Predictions**: Machine learning-based pressure zone prediction
- **Order Imbalance Analysis**: Real-time bid/ask ratio tracking and visualization
- **Volume Profile**: Price-volume distribution analysis
- **Spread Analysis**: Bid-ask spread monitoring and trends
- **Export Functionality**: Export orderbook snapshots and analysis reports
- **Dark/Light Theme**: Custom color schemes with seamless theme switching
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **Charts**: Recharts
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React hooks, Tanstack Query
- **Testing**: Vitest, React Testing Library
- **Build Tool**: Vite

## Prerequisites

- Node.js 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Modern web browser with WebGL support

## Installation

1. **Clone the repository**

   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` to view the application.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint

## Usage

### Navigation

- **Mouse**: Drag to rotate the 3D view, scroll to zoom
- **Controls Panel**: Adjust time range, price range, quantity thresholds
- **Play/Pause**: Control real-time data updates
- **Reset**: Return to default view settings

### Visualization Elements

- **Green Bars**: Bid orders (buy orders) on the left side
- **Red Bars**: Ask orders (sell orders) on the right side
- **Height**: Represents order quantity
- **Particles**: Show order flow activity
- **Explosions**: Indicate trade executions
- **Spheres**: Pressure zones with high order concentration

### Advanced Features

- **Order Imbalance**: Monitor bid/ask volume ratios over time
- **Pressure Zone Prediction**: AI-powered prediction of high-activity areas
- **Volume Profile**: Analyze price-volume distribution
- **Spread Analysis**: Track bid-ask spread trends
- **Export**: Download data snapshots and analysis reports

## Project Structure

```
src/
├── components/
│   ├── orderbook/           # Orderbook-specific components
│   │   ├── OrderbookDashboard.tsx
│   │   ├── OrderbookViz3D.tsx
│   │   ├── OrderbookControls.tsx
│   │   ├── OrderbookStats.tsx
│   │   ├── OrderbookImbalance.tsx
│   │   ├── PressureZonePrediction.tsx
│   │   ├── MarketDepthHeatmap.tsx
│   │   ├── VolumeProfile.tsx
│   │   ├── SpreadAnalysis.tsx
│   │   ├── ExportControls.tsx
│   │   └── ThemeToggle.tsx
│   └── ui/                  # Reusable UI components
├── hooks/                   # Custom React hooks
│   ├── useOrderbookData.ts
│   └── useHeatmapData.ts
├── types/                   # TypeScript type definitions
│   └── orderbook.ts
├── providers/               # React context providers
│   └── ThemeProvider.tsx
└── pages/                   # Page components
    └── Index.tsx
```

## Testing

Run the test suite:

```bash
npm run test
```

Run tests with UI:

```bash
npm run test:ui
```

Tests are located in `__tests__` directories alongside the components they test.

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

WebGL support is required for 3D visualization.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request
