"use client";

interface TimeDividerProps {
  content: string;
}

export function TimeDivider({ content }: TimeDividerProps) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 border-t border-gray-300"></div>
      <div className="mx-4 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
        {content}
      </div>
      <div className="flex-1 border-t border-gray-300"></div>
    </div>
  );
}
