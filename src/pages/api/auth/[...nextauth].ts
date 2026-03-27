import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { User as AppUser, UserDetail } from '@/types/interfaces';
import type { JWT } from 'next-auth/jwt';
import type { User } from 'next-auth';

const API_TIMEOUT_MS = 30000;

type LoginCredentials = {
  email: string;
  password: string;
};

type AuthToken = JWT & {
  user?: UserDetail;
  accessToken?: string;
  refreshToken?: string;
};

function getCredentials(
  credentials: Record<string, string> | undefined
): LoginCredentials {
  const email = credentials?.email?.trim() ?? '';
  const password = credentials?.password ?? '';

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  return { email, password };
}

function getStatusErrorMessage(status: number): string {
  if (status === 502) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  if (status === 503) {
    return 'Service unavailable. Please try again later.';
  }
  if (status === 500) {
    return 'Server error. Please try again later.';
  }
  return `Login failed (${status}). Please check your connection.`;
}

function isHtmlResponse(payload: string): boolean {
  const text = payload.trim().toLowerCase();
  return text.startsWith('<!doctype') || text.startsWith('<html');
}

async function loginWithApi(
  endpoint: string,
  credentials: LoginCredentials,
  timeoutMs = API_TIMEOUT_MS
): Promise<AppUser> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API URL is not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      const responseText = await res.text().catch(() => '');
      let errorMessage = getStatusErrorMessage(res.status);

      if (isJson && responseText) {
        try {
          const parsed = JSON.parse(responseText) as { message?: string };
          errorMessage = parsed.message || `Login failed (${res.status})`;
        } catch {
          errorMessage = `Login failed (${res.status})`;
        }
      } else if (responseText && isHtmlResponse(responseText)) {
        errorMessage = getStatusErrorMessage(res.status);
      }

      throw new Error(errorMessage);
    }

    if (!isJson) {
      throw new Error('Invalid response format from server');
    }

    return (await res.json()) as AppUser;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }

    throw new Error(error instanceof Error ? error.message : 'Login failed');
  } finally {
    clearTimeout(timeoutId);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'user',
      type: 'credentials',
      name: 'user',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, _req) {
        const parsedCredentials = getCredentials(
          credentials as Record<string, string> | undefined
        );
        return (await loginWithApi(
          '/v1/user/login',
          parsedCredentials
        )) as unknown as User;
      },
    }),
    CredentialsProvider({
      id: 'organization',
      type: 'credentials',
      name: 'organization',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, _req) {
        const parsedCredentials = getCredentials(
          credentials as Record<string, string> | undefined
        );
        return (await loginWithApi(
          '/v1/organization/login',
          parsedCredentials
        )) as unknown as User;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const currentToken = token as AuthToken;

      if (trigger === 'update' && session?.user) {
        const sessionUser = session.user as AppUser;

        return {
          ...currentToken,
          ...sessionUser,
          user: sessionUser.user
            ? { ...(currentToken.user ?? {}), ...sessionUser.user }
            : currentToken.user,
          accessToken: currentToken.accessToken || sessionUser.accessToken,
          refreshToken: currentToken.refreshToken || sessionUser.refreshToken,
        };
      }

      if (!user) {
        return currentToken;
      }

      const signedInUser = user as unknown as AppUser;
      return {
        ...currentToken,
        ...signedInUser,
        user: signedInUser.user,
        accessToken: signedInUser.accessToken,
        refreshToken: signedInUser.refreshToken,
      };
    },
    async session({ session, token }) {
      const authToken = token as AuthToken;
      session.user = {
        ...(authToken as unknown as AppUser),
        accessToken: authToken.accessToken,
        refreshToken: authToken.refreshToken,
      };

      return session;
    },
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};

const handler = NextAuth(authOptions);

export default async function authHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    return await handler(req, res);
  } catch (error) {
    console.error('NextAuth handler error:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Authentication error',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }
}
