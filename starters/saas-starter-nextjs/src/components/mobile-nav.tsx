"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/** The phone menu: a button that opens `children` (the sidebar, or the marketing nav) in a sheet. */
export function MobileNav({ children, side = "left", title = "Menu" }: { children: React.ReactNode; side?: "left" | "right"; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={side}
        aria-describedby={undefined}
        // Close after following a link or picking a menu item inside.
        onClick={(e) => (e.target as HTMLElement).closest("a, [role=menuitem]") && setOpen(false)}
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
