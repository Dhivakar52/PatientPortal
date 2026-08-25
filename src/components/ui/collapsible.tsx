import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

const Root = CollapsiblePrimitive.Root as any
const Trigger = CollapsiblePrimitive.Trigger as any
const Panel = CollapsiblePrimitive.Panel as any

function Collapsible({ ...props }: any) {
  return <Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: any) {
  return (
    <Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({ ...props }: any) {
  return (
    <Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
