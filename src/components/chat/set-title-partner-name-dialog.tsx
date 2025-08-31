"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Captions, ArrowLeft, Save } from "lucide-react";
import { UserData } from "@/types/user";
import { useNicknames } from "@/hooks/use-nicknames";
import { toast } from "sonner";

// Zod schema for nickname validation
const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(1, "Nickname cannot be empty")
    .max(30, "Nickname must be 30 characters or less")
    .trim(),
});

type NicknameFormData = z.infer<typeof nicknameSchema>;

interface SetTitlePartnerNameDialogProps {
  partnerUser: UserData;
  chatId: string;
  currentUser: UserData;
}
export function SetTitlePartnerNameDialog({
  partnerUser,
  chatId,
  currentUser,
}: SetTitlePartnerNameDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setNickname: saveNickname, getNickname } = useNicknames();

  // React Hook Form setup
  const form = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
      nickname: "",
    },
  });

  const handleUserSelect = (userData: UserData) => {
    setSelectedUser(userData);
    setShowForm(true);
    // Load existing nickname if any
    const existingNickname = getNickname(userData.id);
    form.setValue("nickname", existingNickname || "");
  };

  const handleBackToList = () => {
    setShowForm(false);
    setSelectedUser(null);
    form.reset();
  };

  const onSubmit = async (data: NicknameFormData) => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const success = await saveNickname(
        selectedUser.id,
        data.nickname,
        chatId
      );

      if (success) {
        toast.success("Nickname saved successfully!");
        setOpen(false);
        handleBackToList();
      } else {
        toast.error("Failed to save nickname. Please try again.");
      }
    } catch (error) {
      console.error("Error saving nickname:", error);
      toast.error("An error occurred while saving nickname.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start ">
          <Captions />
          Nickname
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showForm && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 mr-2"
                onClick={handleBackToList}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Users className="h-4 w-4" />
            {showForm ? "Set Nickname" : "User List"}
          </DialogTitle>
          <DialogDescription>
            {showForm
              ? `Set a nickname for ${selectedUser?.username}`
              : "Which user you want to set a nickname for?"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2">
          {showForm ? (
            // Nickname form with React Hook Form + Zod
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-accent/30">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedUser?.imageUrl || "/placeholder.svg"}
                      alt={selectedUser?.username || "User"}
                    />
                    <AvatarFallback>
                      {selectedUser?.username
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {selectedUser?.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Current name displayed in chat
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nickname <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a nickname..."
                          {...field}
                          className="w-full"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between items-center">
                        <span>This nickname will only be visible to you</span>
                        <span
                          className={`text-xs ${
                            field.value.length > 30
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {field.value.length}/30
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToList}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Nickname"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            // User list
            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleUserSelect(partnerUser)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={partnerUser.imageUrl || "/placeholder.svg"}
                      alt={partnerUser.username}
                    />
                    <AvatarFallback>
                      {partnerUser.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">
                        {getNickname(partnerUser.id) || partnerUser.username}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Chat Partner
                      </span>
                      {getNickname(partnerUser.id) && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          Custom Nickname
                        </span>
                      )}
                    </div>
                    {getNickname(partnerUser.id) && (
                      <p className="text-xs text-muted-foreground">
                        Original: {partnerUser.username}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleUserSelect(currentUser)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={currentUser.imageUrl || "/placeholder.svg"}
                      alt={currentUser.username || "User"}
                    />
                    <AvatarFallback>
                      {(currentUser.firstName ?? "User")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">
                        {currentUser.username}
                      </h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
