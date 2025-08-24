import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="space-y-4 space-x-4 p-3">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Friend suggestions grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card
            key={index}
            className="overflow-hidden border border-gray-200 shadow-sm h-full"
          >
            <CardContent className="p-0 flex flex-col h-full">
              {/* Profile Image Skeleton */}
              <div className="aspect-square relative">
                <Skeleton className="w-full h-full rounded-none" />
              </div>

              {/* Card Content Skeleton */}
              <div className="p-3 flex flex-col flex-grow">
                {/* Name Skeleton */}
                <Skeleton className="h-4 w-3/4 mb-3" />

                {/* Buttons Skeleton */}
                <div className="space-y-2 mt-auto">
                  <Skeleton className="w-full h-8" />
                  <Skeleton className="w-full h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Loading;
