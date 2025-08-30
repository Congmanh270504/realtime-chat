import { useEffect, useRef } from "react";

interface UseDocumentTitleProps {
  newMessageTitle: string;
  originalTitle: string;
  resetDelay?: number;
}

export const useDocumentTitle = ({
  newMessageTitle,
  originalTitle,
  resetDelay = 10000,
}: UseDocumentTitleProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isChangedRef = useRef(false);

  const changeTitle = () => {
    if (document.hidden) {
      // Chỉ thay đổi title khi tab không được focus
      document.title = newMessageTitle;
      isChangedRef.current = true;

      // Clear timeout cũ nếu có
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto reset sau resetDelay
      timeoutRef.current = setTimeout(() => {
        if (isChangedRef.current) {
          document.title = originalTitle;
          isChangedRef.current = false;
        }
      }, resetDelay);
    }
  };

  const resetTitle = () => {
    if (isChangedRef.current) {
      document.title = originalTitle;
      isChangedRef.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isChangedRef.current) {
        if (isChangedRef.current) {
          document.title = originalTitle;
          isChangedRef.current = false;

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }
    };

    const handleFocus = () => {
      if (isChangedRef.current) {
        document.title = originalTitle;
        isChangedRef.current = false;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [originalTitle]);

  return { changeTitle, resetTitle };
};
