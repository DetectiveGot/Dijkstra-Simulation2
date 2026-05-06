'use client'
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import * as React from "react";

type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;
type CheckboxRef = React.ElementRef<typeof CheckboxPrimitive.Root>;

export const Checkbox = React.forwardRef<CheckboxRef, CheckboxProps>(
    ({className, title, ...props}, ref) => {
        return (
            <div className="h-auto w-auto flex gap-1">
                <label className="text-sm leading-none">{title}: </label>
                <CheckboxPrimitive.Root ref={ref} className={cn("inline-flex justify-center items-center h-4 w-4 overflow-hidden rounded-sm border align-middle border-stone-800 data-[state=checked]:bg-black", className)} {...props}>
                    <CheckboxPrimitive.Indicator>
                        <CheckIcon className="h-4 w-4 text-white"/>
                    </CheckboxPrimitive.Indicator>
                </CheckboxPrimitive.Root>
            </div>
        )
    }
);
Checkbox.displayName = "Checkbox";