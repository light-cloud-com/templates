"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ActionForm, Field, SubmitButton, TextareaField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { limits } from "@/lib/validation";
import { createProjectAction } from "./actions";

/** "New project" button and its dialog. Opens straight away from links to /projects?new=1. */
export function NewProjectDialog({ defaultOpen, label = "New project" }: { defaultOpen?: boolean; label?: string }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const router = useRouter();
  const pathname = usePathname();
  const change = (next: boolean) => {
    setOpen(next);
    if (!next && defaultOpen) router.replace(pathname, { scroll: false });
  };
  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Projects belong to the workspace. Everyone in it can see and edit them.</DialogDescription>
        </DialogHeader>
        <ActionForm action={createProjectAction} onSuccess={() => change(false)}>
          <Field label="Name" name="name" placeholder="e.g. Website relaunch" maxLength={limits.projectName} autoFocus required />
          <TextareaField label="Description" name="description" placeholder="Optional" maxLength={limits.projectDescription} rows={3} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => change(false)}>Cancel</Button>
            <SubmitButton>Create project</SubmitButton>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
