"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { FileUpload } from "./file-upload";
import { toast } from "sonner";
import { ChevronRight, CirclePlus } from "lucide-react";

const formSchema = z.object({
  serverName: z.string().min(1, { message: "Server name is required" }),
  imageUrl: z.string().min(1, { message: "Server image is required" }),
});

const inviteFormSchema = z.object({
  inviteLink: z.string().min(1, { message: "Invite link is required" }),
});

export const CreateServerDialog = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formType, setFormType] = useState<"create" | "invite">("create");

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serverName: "",
      imageUrl: "",
    },
  });

  const inviteForm = useForm({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      inviteLink: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/servers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (response.ok && data.url) {
        toast.success("Server created successfully");
        router.push(data.url);
        form.reset();
        setIsOpen(false);
      } else {
        toast.error(data.messages || data.message || "Error creating server");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const onInviteSubmit = async (values: z.infer<typeof inviteFormSchema>) => {
    try {
      // TODO: Implement invite logic here
      console.log("Invite link:", values.inviteLink);
      toast.success("Joined server successfully");
      inviteForm.reset();
      setIsOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <CirclePlus />
      </DialogTrigger>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            {formType === "create" ? "Customize your server" : "Join a Server"}
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {formType === "create"
              ? "Give your server a personality with a name and an image. You can always change it later."
              : "Enter an invite link to join an existing server."}
          </DialogDescription>
        </DialogHeader>

        {/* Layout với label và button chuyển đổi */}
        {/* <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600">You have invited ?</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newFormType = formType === "create" ? "invite" : "create";
                setFormType(newFormType);
                // Reset forms when switching
                form.reset();
                inviteForm.reset();
              }}
            >
              {formType === "create" ? "Join a Server" : "Create Server"}
            </Button>
          </div>
        </div> */}
        
        <div className="flex items-center justify-between gap-4 p-4">
          {/* Left column with avatar/icon */}
          <div className="flex flex-col items-center">fasdfsdaf</div>

          <span>ấdfasfasdf</span>

          {/* Right column with arrow */}
          <div className="flex flex-col items-center">
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 p-4">
          {/* Left column with avatar/icon */}
          <div className="flex flex-col items-center">fasdfsdaf</div>

          <span>ấdfasfasdf</span>

          {/* Right column with arrow */}
          <div className="flex flex-col items-center">
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        {/* Render form based on formType */}
        {/* {formType === "create" ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              suppressHydrationWarning
            >
              <div className="space-y-8 px-6">
                <div className="flex justify-center items-center text-center">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileUpload
                            endpoint="serverImage"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="serverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus:visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter server name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="bg-gray-100 px-6 py-4">
                <Button type="submit" variant="default" disabled={isLoading}>
                  Create
                </Button>
                
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...inviteForm}>
            <form
              onSubmit={inviteForm.handleSubmit(onInviteSubmit)}
              className="space-y-8"
              suppressHydrationWarning
            >
              <div className="space-y-8 px-6">
                <FormField
                  control={inviteForm.control}
                  name="inviteLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Invite Link
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={inviteForm.formState.isSubmitting}
                          className="bg-zinc-300/50 border-0 focus:visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="https://discord.gg/hTKzmak"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="bg-gray-100 px-6 py-4">
                <Button
                  type="submit"
                  variant="default"
                  disabled={inviteForm.formState.isSubmitting}
                >
                  Join Server
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )} */}
      </DialogContent>
    </Dialog>
  );
};
