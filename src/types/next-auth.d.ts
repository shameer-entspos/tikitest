import NextAuth, { Account } from 'next-auth';
import { Organization, User, Team, UserDetail } from './interfaces';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: Account.accessToken;
    refreshToken?: string;
    teams: Team[] | null;
    user: UserDetail;
  }
}
