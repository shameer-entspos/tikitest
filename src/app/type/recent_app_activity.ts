import { UserDetail } from "@/types/interfaces";

export interface RecentAppActivity {
    _id:       string;
    title:     string;
    entry:     string;
    userId:    UserDetail;
    action:    string;
    appId:     string;
    appType:   string;
    createdAt: Date;
    updatedAt: Date;
  
}