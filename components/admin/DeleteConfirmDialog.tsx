"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface DeleteConfirmDialogProps {
  userName: string;
  userEmail: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteConfirmDialog({
  userName,
  userEmail,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDeleting}
        >
          {isDeleting ? <Spinner className="h-4 w-4" /> : "Delete"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Name:</span> {userName}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {userEmail}
          </div>
          <div className="text-sm text-muted-foreground mt-4">
            This will permanently delete the user from both Clerk and the
            database.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Spinner className="h-4 w-4" /> : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
