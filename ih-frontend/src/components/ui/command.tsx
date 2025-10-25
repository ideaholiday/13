import * as React from "react"
import { cn } from "@/lib/utils"

export const Command: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return <div className={cn("w-full", className)} {...props} />
}

type CommandInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onValueChange?: (value: string) => void
}
export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onValueChange, onChange, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn("w-full px-3 py-2 border-b outline-none", className)}
        onChange={(e) => {
          onChange?.(e)
          onValueChange?.(e.target.value)
        }}
        {...props}
      />
    )
  }
)
CommandInput.displayName = "CommandInput"

export const CommandList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return <div className={cn("max-h-80 overflow-auto", className)} {...props} />
}

export const CommandGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return <div className={cn("", className)} {...props} />
}

type CommandEmptyProps = React.HTMLAttributes<HTMLDivElement>
export const CommandEmpty: React.FC<CommandEmptyProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("px-3 py-2 text-sm text-slate-500", className)} {...props}>
      {children}
    </div>
  )
}

type CommandItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string
  onSelect?: (value: string) => void
}
export const CommandItem: React.FC<CommandItemProps> = ({ className, value = "", onSelect, onClick, children, ...props }) => {
  return (
    <div
      className={cn("cursor-pointer hover:bg-slate-50", className)}
      onClick={(e) => {
        onClick?.(e as any)
        onSelect?.(value)
      }}
      {...props}
    >
      {children}
    </div>
  )
}
