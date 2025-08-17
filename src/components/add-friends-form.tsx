"use client";
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
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";

export default function AddFriendsForm() {
  const formSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
  });
  const [isPending, setIsPending] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsPending(true);
      await axios.post("/api/friends/add", values);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsPending(false);
    }
  }

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={onReset}
        className="space-y-8 @container"
      >
        <div className="grid grid-cols-12 gap-4">
          <div key="text-0" id="text-0" className=" col-span-12 col-start-auto">
            <h1
              style={{ textAlign: "center" }}
              className="scroll-m-20 text-4xl font-extrabold tracking-tight @5xl:text-5xl"
            >
              <span className="text-sm font-medium leading-none">
                Add friends
              </span>
            </h1>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">
                  Your friend email
                </FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-2"
                        placeholder="you@gmail.com"
                        type="text"
                        id="email"
                        className=" ps-9"
                        {...field}
                      />
                      <div
                        className={
                          "text-muted-foreground pointer-events-none absolute inset-y-0 flex items-center justify-center  peer-disabled:opacity-50 start-0 ps-3"
                        }
                      >
                        <Mail className="size-4" strokeWidth={1.75} />
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="col-span-6 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
            <div className="w-full">
              <Button
                key="button-0"
                id="button-0"
                className="w-full cursor-pointer dark:text-white"
                type="button"
                variant="outline"
                onClick={onReset}
              >
                Cancel
              </Button>
            </div>
          </div>
          <div className="col-span-6 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
            <div className="w-full">
              <Button
                key="submit-button-0"
                id="submit-button-0"
                className="w-full bg-gray-600 hover:bg-gray-500 cursor-pointer dark:text-white "
                type="submit"
                variant="default"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-1">
                    Submitting{" "}
                    <span className="loading loading-dots loading-xs"></span>{" "}
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
