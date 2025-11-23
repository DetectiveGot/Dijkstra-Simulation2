import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React, { ButtonHTMLAttributes, FC, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white",
        primary: "bg-black text-white",
        option: "bg-white shadow"
      },
      size: {
        default: "h-10 px-4 py-2 rounded-md",
        primary: "w-36 h-10 px-4 py-2 rounded-md text-xl",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-11 rounded-md text-lg",
        option: "h-8 w-8 rounded-md"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({className, size, variant, ...props}, ref) => {
  return <button ref={ref} className={cn(buttonVariants({variant, size}), className)} {...props} />
})
export { Button, buttonVariants };