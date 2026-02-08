// Virtual scrolling component wrapper
// Sử dụng khi có list > 50 items để optimize performance

import type { ReactElement } from 'react'

export interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  width?: string | number
  renderItem: (item: T, index: number) => ReactElement
  className?: string
}

// Simple implementation - có thể upgrade với react-window sau
export function VirtualList<T>({
  items,
  renderItem,
  className = '',
}: VirtualListProps<T>) {
  return (
    <div className={`overflow-y-auto ${className}`}>
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
    </div>
  )
}
