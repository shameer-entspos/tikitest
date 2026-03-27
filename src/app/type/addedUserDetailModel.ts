export type AddedUserDetailModel = {
  role?: number | null;
  type?: number | null;
  _id?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  userId?: string | null;
  password?: string | null;
  phone?: string | null;
  organization?: string | null;
  status?: string;
  active?: boolean;
  createdAt?: string;
};
