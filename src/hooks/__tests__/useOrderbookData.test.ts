import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOrderbookData } from '../useOrderbookData'

// Mock timers
vi.useFakeTimers()

describe('useOrderbookData', () => {
  afterEach(() => {
    vi.clearAllTimers()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useOrderbookData())
    
    expect(result.current.orderbookData).toHaveLength(3) // Three demo venues
    expect(result.current.venues).toHaveLength(3)
    expect(result.current.isConnected).toBe(true)
    expect(result.current.historicalData).toHaveLength(0)
  })

  it('generates orderbook data for all venues', () => {
    const { result } = renderHook(() => useOrderbookData())
    
    const venues = ['binance', 'coinbase', 'okx']
    venues.forEach(venue => {
      const venueData = result.current.orderbookData.find(data => data.venue === venue)
      expect(venueData).toBeDefined()
      expect(venueData?.bids.length).toBeGreaterThan(0)
      expect(venueData?.asks.length).toBeGreaterThan(0)
    })
  })

  it('toggles venue enabled state', () => {
    const { result } = renderHook(() => useOrderbookData())
    
    const initialState = result.current.venues[0].enabled
    
    act(() => {
      result.current.toggleVenue('binance')
    })
    
    expect(result.current.venues[0].enabled).toBe(!initialState)
  })

  it('stores historical data', () => {
    const { result } = renderHook(() => useOrderbookData())
    
    act(() => {
      vi.advanceTimersByTime(1000) // Advance to generate some historical data
    })
    
    expect(result.current.historicalData.length).toBeGreaterThan(0)
  })
})