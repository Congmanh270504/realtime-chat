import React from "react";
import { Button } from "./ui/button";
import { Copy, ThumbsDown, ThumbsUp, Trash } from "lucide-react";

const ChatReactIcons = () => {
  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border">
      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100">
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100">
        <Trash className="h-4 w-4 text-red-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-green-100"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-100">
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatReactIcons;
