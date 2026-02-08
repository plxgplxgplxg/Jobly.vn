import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Test Setup Verification', () => {
  it('should run basic unit test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should run property-based test with fast-check', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a
      }),
      { numRuns: 100 }
    )
  })

  it('should have testing library matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello'
    document.body.appendChild(element)
    expect(element).toBeInTheDocument()
    document.body.removeChild(element)
  })
})
