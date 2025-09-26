"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import ActionSearchForm from "@/components/action-search-form";

interface AddFriendDialogProps {
  triggerClassName?: string;
}

export default function AddFriendDialog({
  triggerClassName,
}: AddFriendDialogProps) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName} size="sm" variant="outline">
          <UserPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Search for friends by email address and send them a friend request.
          </DialogDescription>
        </DialogHeader>
        <ActionSearchForm onSuccess={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
