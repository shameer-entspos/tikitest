import { IUser } from '@/models/user';

declare module 'next' {
  export interface NextApiRequest {
    user?: IUser;
  }
}
