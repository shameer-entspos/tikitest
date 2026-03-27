import { RollCall } from "@/app/type/roll_call";
import { RefObject } from "react";
import { SRDetailSidebar } from "./SREDITSIDEBAR";

export function WithSRDetailSidebar({
  children,
  data,
  contentRef,
}: {
  children: any;
  data: RollCall | undefined;
  contentRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex-1 overflow-hidden bg-pink-400">
      <div className="flex justify-between h-full ">
        {/* Sidebar */}
        <SRDetailSidebar data={data} contentRef={contentRef} />
        {children}
      </div>
    </div>
  );
}
