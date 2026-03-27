import { UserDetail } from "@/types/interfaces";

export interface Asset {
  tagNo: string;
  assetName: string;
  checkoutTo?: UserDetail;
  //   checkInOutStatus: "checkedOut" | "checkedIn";
  //   assetStatus: "active" | "maintenance" | "decommissioned";
  checkInOutStatus: string;
  assetStatus: string;
  checkInOutDate: string;
  _id: string;
  description?: string;
  createdBy: UserDetail;
  createdAt: string;
  updatedAt: string;
}
