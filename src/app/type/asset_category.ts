export interface Category {
  deletedAt: Date;
  _id: string;
  name: string;
  isSubCategory: boolean;
  createdAt: Date;
  assets: string[];
  updatedAt: Date;
  parentCategory?: string;
  isUnCategorized: boolean;
}
