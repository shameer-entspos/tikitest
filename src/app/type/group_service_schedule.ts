import { UserDetail } from '@/types/interfaces';
import { GroupService } from './service_group';
import { SingleAsset } from './single_asset';

export interface CustomRepeat {
  repeatEvery: number;
  repeatUnit: string; // Day, Week, Month, Year
  selectedDays?: string[]; // For Week
  monthOption?: string; // "day" or "weekday"
  dayOfMonth?: number; // For Month - day option
  weekPosition?: string; // First, Second, Third, Fourth, Last
  weekday?: string; // For Month - weekday option
}

export interface ServiceSchedule {
  _id: string;
  assets: SingleAsset[];
  name: string;
  groupId: GroupService;
  createdBy: UserDetail;
  description: string;
  status: string;
  repeat: string;
  repeatFrequency?: string;
  customRepeat?: CustomRepeat | null;
  serviceDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
