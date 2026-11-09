import * as React from "react"
import { cn } from "@/lib/utils"

// Flat table: header row on the surface colour, row borders, no zebra. Pair it with a stacked card
// list below `sm` (CardList in components/data-list.tsx).
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("border-b bg-surface text-xs text-muted-foreground", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y", className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("hover:bg-surface/60", className)} {...props} />
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th scope="col" className={cn("h-10 px-4 font-medium whitespace-nowrap", className)} {...props} />
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }
