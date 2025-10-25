import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-sapphire-900 text-slate-50 hover:bg-sapphire-800 shadow-md hover:shadow-lg",
        destructive: "bg-ruby-900 text-slate-50 hover:bg-ruby-800 shadow-md hover:shadow-lg",
        outline: "border border-sapphire-200 bg-transparent text-sapphire-900 hover:bg-sapphire-50 hover:border-sapphire-300",
        secondary: "bg-slate-100 text-sapphire-900 hover:bg-slate-200",
        ghost: "text-sapphire-900 hover:bg-sapphire-50",
        link: "text-sapphire-900 underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-ruby-900 via-ruby-700 to-gold-900 text-white font-semibold hover:from-ruby-800 hover:to-gold-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-12 rounded-2xl px-8",
        xl: "h-14 rounded-2xl px-10 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }