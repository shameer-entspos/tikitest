'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRefreshToken } from './useRefreshToken';
import { axiosAuth } from '@/app/axios';
import { AxiosInstance, AxiosError } from 'axios';

function useAxiosAuth(): AxiosInstance {
  const { data: session, status } = useSession();
  const refreshToken = useRefreshToken();

  useEffect(() => {
    const requestIntercept = axiosAuth.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization'] && session?.user?.accessToken) {
          config.headers['Authorization'] =
            `Bearer ${session.user.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosAuth.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const prevRequest = error.config as any;

        // Only handle 401 errors and ensure we haven't already tried to refresh
        // Also check that session is loaded (not loading) before attempting refresh
        if (
          error.response?.status === 401 &&
          prevRequest &&
          !prevRequest._retry &&
          status !== 'loading' // Don't attempt refresh if session is still loading
        ) {
          prevRequest._retry = true;

          try {
            // Attempt to refresh the token - returns new access token or null
            const newAccessToken = await refreshToken();

            // Only retry the original request if refresh was successful
            if (newAccessToken) {
              // Update the authorization header with the new token
              prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

              // Retry the original request
              return axiosAuth(prevRequest);
            }

            // If refresh failed, the refreshToken function will handle logout
            // Just reject the error here
            return Promise.reject(error);
          } catch (refreshError) {
            // If refresh throws an error, reject the original error
            return Promise.reject(error);
          }
        }

        // For non-401 errors or if we've already tried refreshing, just reject
        return Promise.reject(error);
      }
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
      axiosAuth.interceptors.response.eject(responseIntercept);
    };
  }, [refreshToken, session, status]);

  return axiosAuth;
}

export default useAxiosAuth;
