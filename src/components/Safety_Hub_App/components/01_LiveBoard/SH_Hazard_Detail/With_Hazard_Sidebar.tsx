import { RefObject } from "react";
import { SingleAsset } from "@/app/type/single_asset";
import { Orderitinreray } from "@/app/type/order_itinreray";
import { HazardDetailSidebar } from "./Hazard_Detail_Sidebar";
import { LiveBoard } from "@/app/type/live_board";

export function WithHazardDetailSIdebar({
  isReadOnly = false,
  children,
  data,
  contentRef,
}: {
  children: any;
  data: LiveBoard | undefined;
  contentRef: RefObject<HTMLDivElement>;
  isReadOnly?: boolean;
}) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex justify-between h-full ">
        {/* Sidebar */}
        <HazardDetailSidebar
          data={data}
          contentRef={contentRef}
          isReadOnly={isReadOnly}
        />
        {children}
      </div>
    </div>
  );
}
