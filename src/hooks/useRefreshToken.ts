'use client';
import axios from '@/app/axios';
import { signOut, useSession } from 'next-auth/react';

export const useRefreshToken = () => {
  const { data: session, status, update } = useSession();

  const refreshToken = async (): Promise<string | null> => {
    try {
      // Wait for session to load - if still loading, return null without logging error
      if (status === 'loading') {
        return null;
      }

      // Check if refresh token exists - only log error if session is loaded but has no token
      if (!session?.user?.refreshToken) {
        // Only log if session exists but no refreshToken (not just loading)
        if (status === 'authenticated' && session?.user) {
          console.log('No refresh token available in session');
        }
        return null;
      }

      // Call refresh endpoint
      const response = await axios.post('organization/refresh', {
        refreshToken: session.user.refreshToken,
      });

      // Success: Update session with new access token and refresh token (token rotation)
      if (response.status === 200 && response.data?.accessToken) {
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken || session.user.refreshToken; // Use new refresh token if provided, otherwise keep old one

        await update({
          user: {
            ...session.user,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken, // Update refresh token for token rotation
          },
        });

        return newAccessToken;
      }

      return null;
    } catch (error: any) {
      // Handle refresh token expiration or invalidation
      if (error?.response?.status === 401) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error;
        
        // Check if it's specifically a refresh token error
        if (
          errorMessage?.includes('refresh token') ||
          errorMessage?.includes('REFRESH_TOKEN_INVALID') ||
          errorMessage?.includes('expired')
        ) {
          console.log('Refresh token expired or invalid - signing out user');
          // Sign out user when refresh token expires
          signOut({ callbackUrl: '/auth/login' });
          return null;
        }
        
        // Other 401 errors (like invalid token format)
        console.log('Authentication failed - signing out user');
        signOut({ callbackUrl: '/auth/login' });
        return null;
      }

      // For other errors (network, timeout, etc.), don't logout
      // Just log and return null - the original request will fail
      console.error('Refresh token error (non-401):', error?.message || error);
      return null;
    }
  };
  return refreshToken;
};
