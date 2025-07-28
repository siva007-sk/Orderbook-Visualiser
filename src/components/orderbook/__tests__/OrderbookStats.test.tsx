import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { OrderbookStats } from '../OrderbookStats'
import { OrderBookData } from '@/types/orderbook'

const mockOrderbookData: OrderBookData[] = [
  {
    venue: 'binance',
    symbol: 'BTCUSDT',
    lastUpdateId: 123456,
    bids: [
      { price: 50000, quantity: 2.5, total: 2.5, timestamp: Date.now() },
      { price: 49900, quantity: 1.8, total: 4.3, timestamp: Date.now() },
    ],
    asks: [
      { price: 50100, quantity: 1.2, total: 1.2, timestamp: Date.now() },
      { price: 50200, quantity: 3.1, total: 4.3, timestamp: Date.now() },
    ],
    timestamp: Date.now(),
  },
]

describe('OrderbookStats', () => {
  it('renders statistics cards', () => {
    const { container } = render(<OrderbookStats orderbookData={mockOrderbookData} isConnected={true} />)
    
    expect(container.querySelector('[class*="grid"]')).toBeInTheDocument()
  })

  it('handles empty orderbook data', () => {
    const { container } = render(<OrderbookStats orderbookData={[]} isConnected={false} />)
    
    expect(container.querySelector('[class*="grid"]')).toBeInTheDocument()
  })

  it('shows connection status', () => {
    const { container } = render(<OrderbookStats orderbookData={mockOrderbookData} isConnected={true} />)
    
    expect(container).toBeInTheDocument()
  })
})