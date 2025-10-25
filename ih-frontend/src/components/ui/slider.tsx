import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number[]
    onValueChange?: (value: number[]) => void
    min?: number
    max?: number
    step?: number
  }
>(({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const [localValue, setLocalValue] = React.useState(value)
  
  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: number[]) => {
    setLocalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div 
          className="absolute h-full bg-primary"
          style={{
            left: `${((localValue[0] - min) / (max - min)) * 100}%`,
            width: `${((localValue[1] - localValue[0]) / (max - min)) * 100}%`
          }}
        />
      </div>
      <div className="absolute inset-y-0 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={(e) => handleChange([Number(e.target.value), localValue[1]])}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer"
        />
      </div>
      <div className="absolute inset-y-0 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={(e) => handleChange([localValue[0], Number(e.target.value)])}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }