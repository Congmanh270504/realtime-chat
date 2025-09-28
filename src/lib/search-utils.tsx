import React, { JSX } from "react";

// Utility function to highlight search matches
export const highlightText = (
  text: string,
  searchQuery: string
): JSX.Element => {
  if (!searchQuery.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${searchQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span
            key={index}
            className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
          >
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};
