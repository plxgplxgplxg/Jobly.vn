import { useState, createContext, useContext } from 'react'
import type { ReactNode } from 'react'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components phải được sử dụng trong TabsProvider')
  }
  return context
}

export interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
}

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex gap-2 border-b border-slate-200 dark:border-slate-800 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={`
        px-4 py-2 font-medium text-sm transition-colors
        ${isActive 
          ? 'text-primary border-b-2 border-primary' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { activeTab } = useTabsContext()
  
  if (activeTab !== value) return null
  
  return (
    <div role="tabpanel" className={`pt-4 ${className}`}>
      {children}
    </div>
  )
}
