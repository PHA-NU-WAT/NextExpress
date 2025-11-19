"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

function IOSSwitch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        `
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border border-transparent transition-colors duration-300 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        data-[state=checked]:bg-green-500
        data-[state=unchecked]:bg-gray-200
        `,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          `
          pointer-events-none block h-5 w-5 rounded-full bg-white shadow
          transition-transform duration-300 ease-in-out
          data-[state=checked]:translate-x-[22px]
          data-[state=unchecked]:translate-x-[2px]
          `
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { IOSSwitch }
