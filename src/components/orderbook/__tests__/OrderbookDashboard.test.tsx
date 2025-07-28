import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OrderbookDashboard } from '../OrderbookDashboard'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('OrderbookDashboard', () => {
  it('renders the main dashboard components', () => {
    const { container } = renderWithProviders(<OrderbookDashboard />)
    
    expect(container.querySelector('h1')).toBeInTheDocument()
    expect(container).toBeInTheDocument()
  })

  it('displays dashboard content', () => {
    const { container } = renderWithProviders(<OrderbookDashboard />)
    
    expect(container.firstChild).toBeInTheDocument()
  })
})