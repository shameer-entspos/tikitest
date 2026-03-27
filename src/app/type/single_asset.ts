import { UserDetail } from '@/types/interfaces';
import { Category } from './asset_category';

export interface SingleAsset {
  _id: string;
  submittedBy: UserDetail;
  name: string;
  atnNum: string;

  reference: string;
  description?: string;
  category?: Category;
  subcategory?: Category;
  make: string;
  docs?: {
    sharedBy: UserDetail;
    image: string;
    uploadedAt: Date;
  }[];
  model: string;
  serialNumber: string;
  vendor?: string;
  ownerShipStatus: string;
  authorizedBy?: string;
  invoiceNumber: string;
  purchaseDate: Date;
  expireDate?: Date;
  purchasePrice?: string;
  purchaseNote?: string;
  assetLocation?: string;
  retirementDate?: Date;
  retirementMethod?: string;
  serviceProvider?: string;
  status?: string;
  checkedOutBy?: string[];
  checkedOutProject?: string[];
  selectedTeams?: string[];
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
  checkOutDate?: Date;
  checkInDate?: Date;
  checkInCondition?: string;
  isCheckedOut?: boolean;
  checkInpermission?: string;
  lastCheckedInBy?: UserDetail;
  lastCheckedOutBy?: UserDetail;
}
