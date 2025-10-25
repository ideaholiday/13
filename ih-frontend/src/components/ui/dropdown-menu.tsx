'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  children: React.ReactNode
  trigger: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
}

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined)

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('useDropdownMenu must be used within a DropdownMenu')
  }
  return context
}

export function DropdownMenu({ children, trigger, align = 'start', side = 'bottom' }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Close dropdown on escape key
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const contextValue = React.useMemo(() => ({ open, setOpen }), [open])

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <div className="relative" ref={dropdownRef}>
        <div onClick={() => setOpen(!open)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}>
          {trigger}
        </div>
        
        {open && (
          <div
            className={cn(
              'absolute z-50 min-w-[8rem] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-1 text-slate-950 shadow-lg animate-in fade-in-0 zoom-in-95',
              {
                'left-0': align === 'start',
                'left-1/2 -translate-x-1/2': align === 'center', 
                'right-0': align === 'end',
                'top-full mt-1': side === 'bottom',
                'bottom-full mb-1': side === 'top',
                'left-full ml-1': side === 'right',
                'right-full mr-1': side === 'left',
              }
            )}
          >
            {children}
          </div>
        )}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuItem({
  className,
  children,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = useDropdownMenu()
  
  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100',
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      role="menuitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(e as any)
          setOpen(false)
        }
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('my-1 h-px bg-slate-200', className)}
      {...props}
    />
  )
}

export function DropdownMenuTrigger({ asChild, children, ...props }: { asChild?: boolean; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      {children}
    </div>
  )
}

export function DropdownMenuContent({ 
  className, 
  align = 'start', 
  side = 'bottom',
  children, 
  ...props 
}: { 
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  children: React.ReactNode 
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-1 text-slate-950 shadow-lg animate-in fade-in-0 zoom-in-95',
        {
          'left-0': align === 'start',
          'left-1/2 -translate-x-1/2': align === 'center', 
          'right-0': align === 'end',
          'top-full mt-1': side === 'bottom',
          'bottom-full mb-1': side === 'top',
          'left-full ml-1': side === 'right',
          'right-full mr-1': side === 'left',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}