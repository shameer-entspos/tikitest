import { UserDetail } from "@/types/interfaces";
import { ProjectDetail } from "./projects";

export interface DiscussionTopic {
  _id: string;
  title: string;
  entryId: string;
  description: string;
  status: string;
  projects: ProjectDetail[];
  closedBy?: UserDetail;
  category: string;
  images: string[];
  resolution: string;
  submittedBy: UserDetail;
  createdAt: Date;
  updatedAt: Date;
}
