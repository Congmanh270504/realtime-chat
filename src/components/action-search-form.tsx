"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Mail,
  User,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import useDebounce from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { UserData } from "@/types/user";
import { useRouter } from "next/navigation";

interface UserSearchResult {
  user: UserData | null;
  found: boolean;
  reason?: string;
}

interface UserSuggestionsResult {
  users: UserData[];
}

const formSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

interface ActionSearchFormProps {
  onSuccess?: () => void;
}

function ActionSearchForm({ onSuccess }: ActionSearchFormProps = {}) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    UserSearchResult["user"] | null
  >(null);
  const [isPending, setIsPending] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Search user by email using TanStack Query
  const { data: searchResult, isLoading } = useQuery({
    queryKey: ["searchUser", debouncedQuery],
    queryFn: async (): Promise<UserSearchResult> => {
      if (!debouncedQuery || !isValidEmail(debouncedQuery)) {
        return { user: null, found: false };
      }

      const response = await fetch(
        `/api/search/user?email=${encodeURIComponent(debouncedQuery)}`
      );
      if (!response.status) throw new Error("Network response was not ok");
      return response.json();
    },
    enabled: !!debouncedQuery && isValidEmail(debouncedQuery),
    refetchOnWindowFocus: false,
  });

  // Search suggestions by email pattern
  const { data: suggestionsResult, isLoading: isLoadingSuggestions } = useQuery(
    {
      queryKey: ["searchSuggestions", debouncedQuery],
      queryFn: async (): Promise<UserSuggestionsResult> => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
          return { users: [] };
        }

        const response = await fetch(
          `/api/search/users/suggestions?pattern=${encodeURIComponent(
            debouncedQuery
          )}&limit=5`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      },
      enabled: !!debouncedQuery && debouncedQuery.length >= 2,
      refetchOnWindowFocus: false,
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    form.setValue("email", value);
    if (selectedUser) {
      setSelectedUser(null);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 200);
  };

  const handleSelectUser = (user: UserSearchResult["user"]) => {
    if (user) {
      setSelectedUser(user);
      setQuery(user.email);
      form.setValue("email", user.email);
      setIsFocused(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsPending(true);
      const response = await fetch("/api/friends/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (response.status !== 200) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        onReset();
        onSuccess?.(); // Close dialog on success
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send friend request");
    } finally {
      setIsPending(false);
    }
  };

  const onReset = () => {
    form.reset();
    router.refresh();
    setQuery("");
    setSelectedUser(null);
    form.clearErrors();
  };

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.4 },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  const shouldShowResults = isFocused && debouncedQuery && !selectedUser;

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your friend email</FormLabel>
                <div className="relative">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type="text"
                        placeholder="you@gmail.com"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className="pl-9 pr-9"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AnimatePresence mode="popLayout">
                          {isLoading ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                            </motion.div>
                          ) : query.length > 0 ? (
                            <motion.div
                              key="search"
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 20, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Search className="w-4 h-4 text-muted-foreground" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="mail"
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 20, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Search className="w-4 h-4 text-muted-foreground" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </FormControl>

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {shouldShowResults && (
                      <motion.div
                        className="absolute top-full left-0 right-0 mt-1 border rounded-md shadow-lg bg-background dark:border-gray-800 z-50"
                        variants={container}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                      >
                        <motion.div variants={item}>
                          {/* Exact email match */}
                          {searchResult?.found && searchResult.user ? (
                            <div
                              className="px-4 py-3 hover:bg-accent cursor-pointer flex items-center gap-3 border-b"
                              onClick={() =>
                                handleSelectUser(searchResult.user)
                              }
                            >
                              <div className="flex-shrink-0">
                                {searchResult.user.imageUrl ? (
                                  <Image
                                    src={searchResult.user.imageUrl}
                                    alt={`${searchResult.user.firstName} ${searchResult.user.lastName}`}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {searchResult.user.firstName}{" "}
                                  {searchResult.user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {searchResult.user.email}
                                </p>
                              </div>
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            </div>
                          ) : null}

                          {/* Email suggestions */}
                          {suggestionsResult?.users?.map((user) => (
                            <div
                              key={user.id}
                              className="px-4 py-3 hover:bg-accent cursor-pointer flex items-center gap-3"
                              onClick={() => handleSelectUser(user)}
                            >
                              <div className="flex-shrink-0">
                                {user.imageUrl ? (
                                  <Image
                                    src={user.imageUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </div>
                          ))}

                          {/* No results message */}
                          {!isLoading &&
                          !isLoadingSuggestions &&
                          !searchResult?.found &&
                          (!suggestionsResult?.users ||
                            suggestionsResult.users.length === 0) &&
                          debouncedQuery.length >= 2 ? (
                            <div className="px-4 py-3 flex items-center gap-3 text-muted-foreground">
                              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              <span className="text-sm">
                                {searchResult?.reason ||
                                  `No users found matching "${debouncedQuery}"`}
                              </span>
                            </div>
                          ) : null}

                          {/* Loading state */}
                          {(isLoading || isLoadingSuggestions) && (
                            <div className="px-4 py-3 flex items-center gap-3 text-muted-foreground">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                              <span className="text-sm">Searching...</span>
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selected User Display */}
          <AnimatePresence>
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 border rounded-lg bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {selectedUser.imageUrl ? (
                      <Image
                        src={selectedUser.imageUrl}
                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </p>
                  </div>
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !query}
              className="w-full bg-gray-600 hover:bg-gray-500"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Sending...
                </div>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ActionSearchForm;
