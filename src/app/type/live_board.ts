import { UserDetail } from "@/types/interfaces";
import { ProjectDetail } from "./projects";

export interface LiveBoard {
  _id: string;
  title: string;
  projects: ProjectDetail[];
  description: string;
  isHazardOrIncident: string;
  status: string;
  submittedBy: UserDetail;
  referenceId: string;
  images: string[];
  isAddedTopicClose: boolean;
  address: string;
  deletedAt: null;
  createdAt: Date;
  updatedAt: Date;
}
