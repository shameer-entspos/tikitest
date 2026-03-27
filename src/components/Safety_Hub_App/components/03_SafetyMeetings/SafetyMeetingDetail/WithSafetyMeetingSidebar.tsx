import { RefObject } from "react";

import { DiscussionTopic } from "@/app/type/discussion_topic";

import { SafetyMeetings } from "@/app/type/safety_meeting";
import { SafetyMeetingSidebar } from ".";

export function WithSafetyMeetingSidebar({
  children,
  data,
  contentRef,
  isReadOnly = false,
}: {
  children: any;
  data: SafetyMeetings | undefined;
  contentRef: RefObject<HTMLDivElement>;
  isReadOnly?: boolean;
}) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex justify-between h-full ">
        {/* Sidebar */}
        <SafetyMeetingSidebar
          data={data}
          contentRef={contentRef}
          isReadOnly={isReadOnly}
        />
        {children}
      </div>
    </div>
  );
}
