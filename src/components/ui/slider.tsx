"use client";
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;
type SliderRef = React.ElementRef<typeof SliderPrimitive.Root>;

export const Slider = React.forwardRef<SliderRef, SliderProps>(
  ({ className, min, max, title, defaultValue, onValueChange, ...props }, ref) => {
    const [curValue, setCurValue] = React.useState<number[]>(defaultValue ?? [min ?? 0]);
    const handleChange = (arr: number[]) => {
        setCurValue([...arr])
        onValueChange?.(arr);
    }

    return (
        <>
        <label className="mb-2 block text-sm text-slate-700">{title}</label>
        <div className="w-full flex gap-x-3 items-center">
            <span className="text-sm">{min}</span>
            <SliderPrimitive.Root
                ref={ref}
                min={min}
                max={max}
                defaultValue={defaultValue}
                onValueChange={handleChange}
                {...props}
                className={cn("relative flex flex-1 h-6 w-full items-center group", className)}
            >
                <SliderPrimitive.Track className="relative h-1 w-full rounded bg-slate-200">
                    <SliderPrimitive.Range className="absolute h-full rounded bg-slate-900" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block rounded-full h-3 w-3 bg-black relative">
                    <span
                    className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2
                    rounded px-1.5 py-0.5 text-xs leading-none text-white bg-slate-900 shadow
                    opacity-0 transition-opacity
                    group-hover:opacity-100"
                >{curValue[0]}</span>
                </SliderPrimitive.Thumb>
            </SliderPrimitive.Root>
            <span className="text-sm">{max}</span>
        </div>
      </>
    );
  }
);
Slider.displayName = "Slider";
