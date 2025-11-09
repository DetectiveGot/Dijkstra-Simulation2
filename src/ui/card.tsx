import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React, { Children, forwardRef } from "react";

const cardVariants = cva(
    "shadow z-50 rounded-2xl bg-white", 
    {
        variants: {
            variant: {
                primary: "",
            },
            size: {
                sm: "p-3",
                md: "p-8",
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "sm"
        },
    }
)

interface CardProps extends React.HtmlHTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants>{}

const Card = forwardRef<HTMLDivElement, CardProps>(({className, variant, size, ...props}, ref) => {
    return (
        <div ref={ref} className={cn(cardVariants({variant, size}), className)} {...props} />
    )
})

export {Card, cardVariants}