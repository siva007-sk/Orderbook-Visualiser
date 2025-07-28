import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('renders correctly', () => {
    const { container } = render(<Button>Test Button</Button>)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    
    expect(container.firstChild).toHaveClass('bg-destructive')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    const { container } = render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = container.firstChild as HTMLElement
    button?.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})