import { RefObject } from "react";
import { DiscussionTopicSidebar } from "./DiscussionTopicSidebar";
import { DiscussionTopic } from "@/app/type/discussion_topic";

export function WithDiscussionTopicSidebar({
  isReadOnly = false,
  children,
  data,
  contentRef,
}: {
  children: any;
  data: DiscussionTopic | undefined;
  contentRef: RefObject<HTMLDivElement>;
  isReadOnly?: boolean;
}) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex justify-between h-full ">
        {/* Sidebar */}
        <DiscussionTopicSidebar
          data={data}
          contentRef={contentRef}
          isReadOnly={isReadOnly}
        />
        {children}
      </div>
    </div>
  );
}
