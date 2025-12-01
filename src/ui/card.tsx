import { cn } from "@/lib/utils";
import React, { Children, forwardRef } from "react";

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => {
    return <div ref={ref} {...props} 
        className={cn(className,
            "flex flex-col justify-center shadow z-50 rounded-2xl bg-white p-3 max-w-xs md:max-w-md"
        )}
    />
})


const CardHeader = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({className, ...props}, ref) => {
    return <h1 ref={ref} {...props} 
        className={cn(className,
            "sm:text-md text-sm font-bold"
        )}
    />
})

const CardSection = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => {
    return <div ref={ref} {...props} 
        className={cn(className,
            "py-1"
        )}
    />
})

const CardSectionHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => {
    return <div ref={ref} {...props} 
        className={cn(className,
            "sm:text-sm text-xs font-bold"
        )}
    />
})

export {Card, CardHeader, CardSection, CardSectionHeader}