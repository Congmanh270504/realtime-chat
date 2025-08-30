import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const Loading = () => {
  return (
    <div className="h-full flex flex-col w-full relative">
      {/* Header Skeleton */}
      <div className="sticky top-3 right-0 z-10 bg-green-100 px-6 py-4 border-b flex items-center justify-between rounded-2xl mx-6 mt-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Messages Skeleton */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-4 w-full px-4 pb-6 md:space-y-6">
          {/* Message from other user */}
          <div className="flex w-full justify-start">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-16 w-48 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Message from current user */}
          <div className="flex w-full justify-end">
            <div className="flex gap-3 flex-row-reverse">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Skeleton className="h-12 w-40 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* More messages */}
          <div className="flex w-full justify-start">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-20 w-56 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-end">
            <div className="flex gap-3 flex-row-reverse">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Skeleton className="h-8 w-32 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-start">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-14 w-44 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Time divider skeleton */}
          <div className="flex items-center gap-4 my-6">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-px flex-1" />
          </div>

          <div className="flex w-full justify-end">
            <div className="flex gap-3 flex-row-reverse">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Skeleton className="h-10 w-36 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Input Area Skeleton */}
      <div className="px-6 py-4 border-t bg-background flex-shrink-0 sticky bottom-0 left-0 right-0">
        <div className="flex gap-2 items-center">
          <Skeleton className="min-h-[44px] flex-1 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
