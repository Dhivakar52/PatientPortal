import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

const PrimitiveRoot = PopoverPrimitive.Root as any
const PrimitiveTrigger = PopoverPrimitive.Trigger as any
const PrimitivePortal = PopoverPrimitive.Portal as any
const PrimitivePositioner = PopoverPrimitive.Positioner as any
const PrimitivePopup = PopoverPrimitive.Popup as any
const PrimitiveTitle = PopoverPrimitive.Title as any
const PrimitiveDescription = PopoverPrimitive.Description as any

function Popover({ ...props }: any) {
  return <PrimitiveRoot data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: any) {
  return <PrimitiveTrigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  align?: any
  alignOffset?: any
  side?: any
  sideOffset?: any
}) {
  return (
    <PrimitivePortal>
      <PrimitivePositioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PrimitivePopup
          data-slot="popover-content"
          className={cn(
            "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </PrimitivePopup>
      </PrimitivePositioner>
    </PrimitivePortal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, children, ...props }: React.ComponentProps<"h2">) {
  return (
    <PrimitiveTitle
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    >
      {children}
    </PrimitiveTitle>
  )
}

function PopoverDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <PrimitiveDescription
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children}
    </PrimitiveDescription>
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
