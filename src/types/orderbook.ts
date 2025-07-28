export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
  timestamp: number;
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdateId: number;
  symbol: string;
  venue: string;
  timestamp: number;
}

export interface Venue {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  apiEndpoint: string;
}

export interface PressureZone {
  price: number;
  quantity: number;
  intensity: 'low' | 'medium' | 'high';
  side: 'bid' | 'ask';
  timestamp: number;
}

export interface VisualizationSettings {
  timeRange: '1m' | '5m' | '15m' | '1h';
  priceRange: [number, number];
  quantityThreshold: number;
  showPressureZones: boolean;
  realTimeMode: boolean;
  rotationSpeed: number;
  venues: string[];
}

export interface OrderFlowData {
  orderId: string;
  price: number;
  quantity: number;
  side: 'bid' | 'ask';
  action: 'add' | 'update' | 'remove';
  timestamp: number;
  venue: string;
}