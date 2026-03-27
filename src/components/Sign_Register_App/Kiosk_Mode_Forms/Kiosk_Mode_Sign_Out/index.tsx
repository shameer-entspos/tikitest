import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  searchKioskSigIn,
  signOutMany,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { SimpleInput } from '@/components/Form/simpleInput';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import { SignOutSearchResult } from './SignOut_Search_Result';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import { toast } from 'react-hot-toast';
import MultiSignOutModel from '../../Models/Sign_Out_Model/SignOutMultiple';

export default function KioskSignOut({ handleClose }: { handleClose: any }) {
  const [searchPhoneQuery, setSearchPhoneQuery] = useState<string>('');
  const [searchEmailQuery, setSearchEmailQuery] = useState<string>('');
  const [activeSearchType, setActiveSearchType] = useState<
    'phone' | 'email' | null
  >(null);

  const axiosAuth = useAxiosAuth();

  const [selectedSection, setSection] = useState<'searchArea' | 'searchResult'>(
    'searchArea'
  );

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchData, setSearchData] = useState<
    SignInRegisterSubmission[] | undefined
  >(undefined);
  const [showSignOutAllModal, setShowSignOutAllModal] = useState(false);
  const queryClient = useQueryClient();

  // Using `useMutation` for search - better for user-triggered actions
  const searchMutation = useMutation(
    (query: string) =>
      searchKioskSigIn({
        axiosAuth,
        query,
      }),
    {
      onSuccess: (result) => {
        setHasSearched(true);
        setErrorMessage('');
        setSearchData(result);
        if (result && result.length > 0) {
          setSection('searchResult');
        } else {
          // No results found - stay on search area to show message
          setSection('searchArea');
        }
      },
      onError: (err: any) => {
        setHasSearched(true);
        setSearchData(undefined);
        const errorMsg =
          err?.message ||
          err?.response?.data?.message ||
          'Failed to search. Please try again.';
        setErrorMessage(errorMsg);
        console.log('onError:', err);
      },
    }
  );

  const handlePhoneSearch = () => {
    if (!searchPhoneQuery || !searchPhoneQuery.trim()) {
      return;
    }
    setActiveSearchType('phone');
    setErrorMessage('');
    setHasSearched(false);
    searchMutation.mutate(searchPhoneQuery.trim());
  };

  const handleEmailSearch = () => {
    if (!searchEmailQuery || !searchEmailQuery.trim()) {
      return;
    }
    setActiveSearchType('email');
    setErrorMessage('');
    setHasSearched(false);
    searchMutation.mutate(searchEmailQuery.trim());
  };

  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh))] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        {/* TopBar */}
        <div className="breadCrumbs flex justify-between border-b-2 border-[#EEEEEE] p-2">
          <span className="flex items-center gap-2 text-xl font-bold">
            <img
              src="/svg/sr/logo.svg"
              alt="show logo"
              className="h-[50px] w-[50px]"
            />
            Guest Sign Out
          </span>
          <button onClick={handleClose}>
            <img src="/svg/timesheet_app/go_back.svg" alt="show logo" />
          </button>
        </div>

        {/* Middle content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {selectedSection === 'searchArea' ? (
            <div className="flex h-full flex-1 flex-col items-center justify-start overflow-auto scrollbar-hide">
              <div className="mt-4 flex w-full max-w-[1080px] flex-col items-start justify-start rounded-md p-6 shadow-md">
                <div className="mb-5 flex flex-col">
                  <h2 className="mb-1 text-lg font-medium">Sign out details</h2>
                  <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                    Please enter either your email address or phone number you
                    used to sign in with.
                  </p>
                </div>

                {/* Phone Number Section */}
                <div className="flex w-full flex-col">
                  <SimpleInput
                    label="Your phone number"
                    type="tel"
                    placeholder="Enter your phone number"
                    name="phone"
                    className="w-full"
                    value={searchPhoneQuery}
                    onChange={(e) => {
                      setSearchPhoneQuery(e.target.value || '');
                      setErrorMessage('');
                      setHasSearched(false);
                    }}
                    disabled={searchMutation.isLoading}
                  />
                  <div className="mt-2 flex w-full justify-end">
                    <Button
                      variant="primary"
                      onClick={handlePhoneSearch}
                      disabled={
                        !searchPhoneQuery ||
                        (typeof searchPhoneQuery === 'string' &&
                          !searchPhoneQuery.trim()) ||
                        searchMutation.isLoading
                      }
                    >
                      {searchMutation.isLoading &&
                      activeSearchType === 'phone' ? (
                        <Loader />
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Or Separator */}
                <div className="flex w-full items-center justify-center py-4">
                  <span className="text-base font-normal text-[#1e1e1e]">
                    Or
                  </span>
                </div>

                {/* Email Address Section */}
                <div className="flex w-full flex-col">
                  <SimpleInput
                    label="Your Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    name="email"
                    className="w-full"
                    value={searchEmailQuery}
                    onChange={(e) => {
                      setSearchEmailQuery(e.target.value || '');
                      setErrorMessage('');
                      setHasSearched(false);
                    }}
                    disabled={searchMutation.isLoading}
                  />
                  <div className="mt-2 flex w-full justify-end">
                    <Button
                      variant="primary"
                      onClick={handleEmailSearch}
                      disabled={
                        !searchEmailQuery ||
                        (typeof searchEmailQuery === 'string' &&
                          !searchEmailQuery.trim()) ||
                        searchMutation.isLoading
                      }
                    >
                      {searchMutation.isLoading &&
                      activeSearchType === 'email' ? (
                        <Loader />
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {(searchMutation.isError || errorMessage) &&
                  !searchMutation.isLoading && (
                    <div className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-red-800">
                          {errorMessage ||
                            'Failed to search. Please try again.'}
                        </span>
                      </div>
                    </div>
                  )}

                {/* No Results Message */}
                {hasSearched &&
                  !searchMutation.isLoading &&
                  !searchMutation.isError &&
                  !errorMessage &&
                  searchData &&
                  searchData.length === 0 && (
                    <div className="mt-4 w-full rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 text-yellow-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-yellow-800">
                          No sign-in records found. Please check your
                          information and try again.
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <SignOutSearchResult
              dataList={searchData}
              onBack={() => {
                setSection('searchArea');
                setSearchPhoneQuery('');
                setSearchEmailQuery('');
              }}
            />
          )}
        </div>

        {/* Bottom Section */}
        <div className="h-16 flex-shrink-0 border-2 border-[#EEEEEE]">
          <div className="flex h-full items-center justify-between rounded-md p-2">
            <Button
              variant="primaryOutLine"
              onClick={() => {
                if (selectedSection === 'searchArea') {
                  handleClose();
                } else {
                  setSection('searchArea');
                  setSearchPhoneQuery('');
                  setSearchEmailQuery('');
                }
              }}
            >
              {selectedSection === 'searchResult' ? '< Back' : 'Back'}
            </Button>
            {selectedSection === 'searchArea' ? (
              <div className="text-sm text-[#616161]"></div>
            ) : (
              <div className="flex items-center gap-4">
                {searchData && searchData.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowSignOutAllModal(true);
                    }}
                  >
                    Sign out all
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showSignOutAllModal && searchData && searchData.length > 0 && (
        <MultiSignOutModel
          handleShowModel={() => {
            setShowSignOutAllModal(false);
            // Refresh search data after sign out
            if (searchPhoneQuery.trim()) {
              searchMutation.mutate(searchPhoneQuery.trim());
            } else if (searchEmailQuery.trim()) {
              searchMutation.mutate(searchEmailQuery.trim());
            }
          }}
          selectedSubmissions={searchData}
        />
      )}
    </>
  );
}
