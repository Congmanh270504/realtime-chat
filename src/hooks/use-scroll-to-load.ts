"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseScrollToLoadProps {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export const useScrollToLoad = ({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100,
}: UseScrollToLoadProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const handleScroll = useCallback(async () => {
    // Tìm phần tử scroll thực sự trong ScrollArea
    const scrollAreaContainer = scrollAreaRef.current;
    if (!scrollAreaContainer) return;

    // ScrollArea của Shadcn tạo ra một div với class "h-full w-full rounded-[inherit]" và có overflow
    const scrollElement = scrollAreaContainer.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;

    if (!scrollElement || isLoadingRef.current || !hasMore || isLoading) return;

    // Kiểm tra nếu scroll gần đến đầu container
    if (scrollElement.scrollTop <= threshold) {
      isLoadingRef.current = true;

      // Lưu vị trí scroll hiện tại trước khi load
      const previousScrollHeight = scrollElement.scrollHeight;
      const previousScrollTop = scrollElement.scrollTop;

      try {
        await onLoadMore();

        // Sau khi load xong, điều chỉnh scroll position để maintain user view
        setTimeout(() => {
          if (scrollElement) {
            const newScrollHeight = scrollElement.scrollHeight;
            const addedHeight = newScrollHeight - previousScrollHeight;
            scrollElement.scrollTop = previousScrollTop + addedHeight;
          }
        }, 100);
      } finally {
        isLoadingRef.current = false;
      }
    }
  }, [onLoadMore, hasMore, isLoading, threshold]);

  useEffect(() => {
    const scrollAreaContainer = scrollAreaRef.current;
    if (!scrollAreaContainer) return;

    const scrollElement = scrollAreaContainer.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!scrollElement) return;

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return { scrollAreaRef };
};
