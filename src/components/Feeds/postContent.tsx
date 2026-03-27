import { usePostCotnext } from "@/app/(main)/(user-panel)/user/feeds/context";
import React, { useState } from "react";
import { LinkifyText } from "./likifyText";

interface PostContentProps {
  content: string;
  onClick: React.MouseEventHandler<HTMLDivElement> | undefined
}

function PostContent({ content, onClick }: PostContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  const maxLength = 150; // Adjust the maximum length as needed
  const shouldTruncate = content.length > maxLength;

  const truncatedContent = shouldTruncate
    ? content.slice(0, content.lastIndexOf(" ", maxLength)) + "..."
    : content;

  return (
    <div onClick={onClick} >
      <div
        className={`inline-block break-words w-[100%]  text-[#000000] text-sm ${isExpanded ? "" : "line-clamp-3" // Adjust the line-clamp value as needed
          }`}
      >
        <LinkifyText text={isExpanded ? content : truncatedContent} />
      </div>
      {shouldTruncate && (
        <button
          onClick={toggleText}
          className="text-blue-500 text-sm cursor-pointer"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

export default PostContent;
