"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pen } from "lucide-react";
import { toast } from "sonner";

const serverNameSchema = z.object({
  serverName: z
    .string()
    .min(1, { message: "Server name must be at least 1 character" })
    .max(100, { message: "Server name must be less than 100 characters" })
    .trim(),
});

type ServerNameFormData = z.infer<typeof serverNameSchema>;

interface EditServerNameDialogProps {
  serverId: string;
  currentServerName: string;
  onServerNameUpdate: (newName: string) => void;
}

export function EditServerNameDialog({
  serverId,
  currentServerName,
  onServerNameUpdate,
}: EditServerNameDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ServerNameFormData>({
    resolver: zodResolver(serverNameSchema),
    defaultValues: {
      serverName: currentServerName,
    },
  });

  const onSubmit = async (data: ServerNameFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/servers/${serverId}/rename`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newName: data.serverName }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Server name updated successfully");
        onServerNameUpdate(data.serverName);
        setIsOpen(false);
        form.reset({ serverName: data.serverName });
      } else {
        toast.error(result.message || "Failed to update server name");
      }
    } catch (error) {
      console.error("Error updating server name:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset({ serverName: currentServerName });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Pen className="w-3 h-3 mb-1 cursor-pointer hover:text-blue-600 transition-colors" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Server Name</DialogTitle>
          <DialogDescription>
            Change the name of your server. Make sure it&apos;s between 1 and
            100 characters.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter server name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
