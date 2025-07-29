import { useState, useEffect, useCallback } from 'react';
import { OrderBookData, Venue } from '@/types/orderbook';

const DEMO_VENUES: Venue[] = [
  {
    id: 'binance',
    name: 'Binance',
    enabled: true,
    color: '#F3BA2F',
    apiEndpoint: 'wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms'
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    enabled: true,
    color: '#0052FF',
    apiEndpoint: 'wss://ws-feed.pro.coinbase.com'
  },
  {
    id: 'okx',
    name: 'OKX',
    enabled: true,
    color: '#00D4FF',
    apiEndpoint: 'wss://ws.okx.com:8443/ws/v5/public'
  }
];

// Generate realistic demo data with very stable changes
let previousQuantities: { [key: string]: number } = {};
let updateCounter = 0;

const generateOrderBookLevel = (basePrice: number, side: 'bid' | 'ask', index: number, venueId: string) => {
  const priceOffset = side === 'bid' ? -index * 0.5 : index * 0.5;
  const price = basePrice + priceOffset;
  
  // Create very stable quantities with minimal variations
  const key = `${venueId}-${side}-${index}`;
  const prevQuantity = previousQuantities[key] || (3 + Math.random() * 4);
  
  // Only update every 4th cycle and with very small changes
  let quantity = prevQuantity;
  if (updateCounter % 4 === 0) {
    const variation = (Math.random() - 0.5) * 0.1; // Very small variation
    quantity = Math.max(0.5, prevQuantity + variation);
  }
  
  previousQuantities[key] = quantity;
  
  return {
    price: Number(price.toFixed(2)),
    quantity: Number(quantity.toFixed(2)), // Round to 2 decimals for stability
    total: 0, // Will be calculated
    timestamp: Date.now()
  };
};

const generateOrderBookData = (venue: Venue, basePrice: number): OrderBookData => {
  updateCounter++; // Increment counter for stable updates
  const bids = Array.from({ length: 20 }, (_, i) => generateOrderBookLevel(basePrice, 'bid', i, venue.id));
  const asks = Array.from({ length: 20 }, (_, i) => generateOrderBookLevel(basePrice, 'ask', i, venue.id));

  // Calculate totals
  let bidTotal = 0;
  bids.forEach(bid => {
    bidTotal += bid.quantity;
    bid.total = bidTotal;
  });

  let askTotal = 0;
  asks.forEach(ask => {
    askTotal += ask.quantity;
    ask.total = askTotal;
  });

  return {
    bids,
    asks,
    lastUpdateId: Date.now(),
    symbol: 'BTCUSDT',
    venue: venue.id,
    timestamp: Date.now()
  };
};

export const useOrderbookData = (settings?: {
  priceRange?: [number, number];
  quantityThreshold?: number;
  timeRange?: string;
  realTimeMode?: boolean;
}) => {
  const [orderbookData, setOrderbookData] = useState<OrderBookData[]>([]);
  const [venues, setVenues] = useState<Venue[]>(DEMO_VENUES);
  const [isConnected, setIsConnected] = useState(false);
  const [basePrice] = useState(65000); // BTC price
  const [historicalData, setHistoricalData] = useState<OrderBookData[][]>([]);

  const filterOrderbook = useCallback((data: OrderBookData[], settings?: any) => {
    if (!settings) return data;
    
    return data.map(orderbook => ({
      ...orderbook,
      bids: orderbook.bids.filter(bid => {
        const withinPriceRange = !settings.priceRange || 
          (bid.price >= settings.priceRange[0] && bid.price <= settings.priceRange[1]);
        const aboveThreshold = !settings.quantityThreshold || 
          bid.quantity >= settings.quantityThreshold;
        return withinPriceRange && aboveThreshold;
      }),
      asks: orderbook.asks.filter(ask => {
        const withinPriceRange = !settings.priceRange || 
          (ask.price >= settings.priceRange[0] && ask.price <= settings.priceRange[1]);
        const aboveThreshold = !settings.quantityThreshold || 
          ask.quantity >= settings.quantityThreshold;
        return withinPriceRange && aboveThreshold;
      })
    }));
  }, []);

  const updateOrderbook = useCallback(() => {
    const enabledVenues = venues.filter(venue => venue.enabled);
    const newData = enabledVenues.map(venue => generateOrderBookData(venue, basePrice));
    
    // Apply filters
    const filteredData = filterOrderbook(newData, settings);
    setOrderbookData(filteredData);

    // Store historical data for time range visualization
    setHistoricalData(prev => {
      const updated = [...prev, filteredData];
      const maxHistory = getMaxHistoryLength(settings?.timeRange || '5m');
      return updated.slice(-maxHistory);
    });
  }, [venues, basePrice, settings, filterOrderbook]);

  const getMaxHistoryLength = (timeRange: string) => {
    switch (timeRange) {
      case '1m': return 600; // 1 minute at 100ms intervals
      case '5m': return 3000; // 5 minutes
      case '15m': return 9000; // 15 minutes
      case '1h': return 36000; // 1 hour
      default: return 3000;
    }
  };

  useEffect(() => {
    setIsConnected(true);
    updateOrderbook();

    // Only update in real-time mode with even slower updates for stability
    if (settings?.realTimeMode !== false) {
      const interval = setInterval(() => {
        updateOrderbook();
      }, 400); // Update every 400ms for maximum stability

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    }
  }, [updateOrderbook, settings?.realTimeMode]);

  const toggleVenue = useCallback((venueId: string) => {
    setVenues(prev => prev.map(venue => 
      venue.id === venueId ? { ...venue, enabled: !venue.enabled } : venue
    ));
  }, []);

  const getHistoricalSnapshot = useCallback((timeAgo: number) => {
    const index = Math.max(0, historicalData.length - timeAgo - 1);
    return historicalData[index] || orderbookData;
  }, [historicalData, orderbookData]);

  return {
    orderbookData,
    venues,
    isConnected,
    toggleVenue,
    historicalData,
    getHistoricalSnapshot
  };
};