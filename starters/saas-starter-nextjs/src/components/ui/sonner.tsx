"use client"

import { useSyncExternalStore } from "react"
import { Toaster as Sonner } from "sonner"

const query = "(max-width: 639px)"
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(query)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

// Bottom-right on desktop, bottom-centre on phone; colours come from the theme tokens.
export function Toaster() {
  const phone = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
  return (
    <Sonner
      position={phone ? "bottom-center" : "bottom-right"}
      closeButton
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{ classNames: { toast: "font-sans text-sm", description: "text-muted-foreground" } }}
    />
  )
}
