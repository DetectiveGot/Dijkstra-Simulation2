import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => {
    return <div ref={ref} {...props} 
        className={cn(
            "flex flex-col justify-center shadow z-50 rounded-2xl bg-white p-3 max-w-xs md:max-w-md",
            className
        )}
    />
})

Card.displayName = 'Card';


const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => {
    return <div ref={ref} {...props} 
        className={cn(
            "sm:text-md text-sm font-bold",
            className
        )}
    />
})

CardHeader.displayName = 'CardHeader';

const CardSection = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => {
    return <div ref={ref} {...props} 
        className={cn(
            "py-1",
            className
        )}
    />
})

CardSection.displayName = 'CardSection';

const CardSectionHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => {
    return <div ref={ref} {...props} 
        className={cn(
            "sm:text-sm text-xs font-bold",
            className
        )}
    />
})

CardSectionHeader.displayName = 'CardSectionHeader';

export {Card, CardHeader, CardSection, CardSectionHeader}