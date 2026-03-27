import { listOfSiteSignIn } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { Site } from '@/app/type/Sign_Register_Sites';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import ShowSRDetail from '@/components/Sign_Register_App/Models/SR_Detail';
import MultiSignOutModel from '@/components/Sign_Register_App/Models/Sign_Out_Model/SignOutMultiple';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useTikiPagination } from '@/hooks/usePagination';
import React, { useState, useEffect } from 'react';
import { RefObject } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useQuery } from 'react-query';

export function SiteActiveOnSiteSection({
  data,
  contentRef,
}: {
  data: Site | undefined;
  contentRef: RefObject<HTMLDivElement>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<{
    field: 'firstName' | 'lastName' | 'date';
    direction: 'asc' | 'desc';
  }>({ field: 'date', direction: 'desc' });

  // Selection mode state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<
    SignInRegisterSubmission[]
  >([]);
  const [showSelectedItemsModal, setShowSelectedItemsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<
    SignInRegisterSubmission | undefined
  >(undefined);

  const axiosAuth = useAxiosAuth();
  // Same data source as View Site overview & Logbook: listOfSiteSignIn (includes Kiosk sign-ins)
  const { data: siteSignInList, isLoading } = useQuery({
    queryKey: ['sitesignIn', data?._id],
    queryFn: () =>
      listOfSiteSignIn({
        axiosAuth,
        siteId: data?._id ?? '',
      }),
    enabled: !!data?._id,
  });

  // Active Onsite: all sign-ins where sign_out_timestamp IS NULL (includes Kiosk)
  const activeOnSiteList =
    (siteSignInList ?? []).filter((entry) => entry.signOutAt == null) ?? [];
  const activeOnSiteCount = activeOnSiteList.length;

  // Filter and sort the list
  const filterList = activeOnSiteList
    .filter((user) => {
      // Safe search matching with null checks
      const firstName = (user.firstName || '').toLowerCase();
      const lastName = (user.lastName || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const contact = (user.contact || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const searchLower = searchQuery.toLowerCase().trim();

      return searchQuery
        ? fullName.includes(searchLower) ||
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            email.includes(searchLower) ||
            contact.includes(searchLower)
        : true;
    })
    .sort((a, b) => {
      if (sorting?.field === 'firstName') {
        const firstNameA = (a.firstName || '').toLowerCase();
        const firstNameB = (b.firstName || '').toLowerCase();
        return sorting.direction === 'asc'
          ? firstNameA.localeCompare(firstNameB)
          : firstNameB.localeCompare(firstNameA);
      }
      if (sorting?.field === 'lastName') {
        const lastNameA = (a.lastName || '').toLowerCase();
        const lastNameB = (b.lastName || '').toLowerCase();
        return sorting.direction === 'asc'
          ? lastNameA.localeCompare(lastNameB)
          : lastNameB.localeCompare(lastNameA);
      }
      // Default: sort by date
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sorting?.direction === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

  // Pagination
  const itemsPerPage = 10;
  const {
    currentPage,
    totalPages,
    paginatedItems,
    handlePageChange,
    setCurrentPage,
  } = useTikiPagination(filterList, itemsPerPage);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, setCurrentPage]);

  // Selection handlers
  const handleCancel = () => {
    setSelectedSubmissions([]);
    setIsSelectMode(false);
  };

  const handleSelectAllChange = () => {
    if (filterList.length === selectedSubmissions.length) {
      handleCancel();
    } else {
      setSelectedSubmissions([...filterList]);
    }
  };

  const handleCheckboxChange = (submission: SignInRegisterSubmission) => {
    if (selectedSubmissions.some((s) => s._id === submission._id)) {
      setSelectedSubmissions(
        selectedSubmissions.filter((s) => s._id !== submission._id)
      );
    } else {
      setSelectedSubmissions([...selectedSubmissions, submission]);
    }
  };

  const openSelectedItemsModal = () => {
    setShowSelectedItemsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-56">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div
        className="h-full overflow-auto pb-5 scrollbar-hide"
        ref={contentRef}
      >
        <div
          className="mx-4 mt-6 flex h-[656px] flex-col overflow-y-auto rounded-lg"
          style={{
            boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col">
              <h2 className="mb-1 text-sm font-semibold md:text-xl">
                Active On-Site {activeOnSiteCount >= 0 && `(${activeOnSiteCount})`}
              </h2>
              <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                View people currently signed-in on this site.
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              {/* SearchBox */}
              <div className="Search team-actice flex items-center justify-between">
                <Search
                  inputRounded={true}
                  type="search"
                  className="rounded-md bg-[#eeeeee] text-xs placeholder:text-[#616161] md:text-sm"
                  name="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-scroll p-5 pt-2">
            {
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      <span
                        className="flex cursor-pointer gap-1"
                        onClick={() => {
                          if (
                            sorting?.field === 'firstName' &&
                            sorting?.direction === 'asc'
                          ) {
                            setSorting({
                              field: 'firstName',
                              direction: 'desc',
                            });
                          } else {
                            setSorting({
                              field: 'firstName',
                              direction: 'asc',
                            });
                          }
                        }}
                      >
                        First Name
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                            fill="#0063F7"
                          />
                        </svg>
                      </span>
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      <span
                        className="flex cursor-pointer gap-1"
                        onClick={() => {
                          if (
                            sorting?.field === 'lastName' &&
                            sorting?.direction === 'asc'
                          ) {
                            setSorting({
                              field: 'lastName',
                              direction: 'desc',
                            });
                          } else {
                            setSorting({
                              field: 'lastName',
                              direction: 'asc',
                            });
                          }
                        }}
                      >
                        Last Name
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                            fill="#0063F7"
                          />
                        </svg>
                      </span>
                    </th>
                    <th className="hidden p-2 text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                      <span className="flex gap-1">User Type</span>
                    </th>
                    <th className="flex p-2 text-left text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                      <span
                        className="flex cursor-pointer gap-1"
                        onClick={() => {
                          if (
                            sorting?.field === 'date' &&
                            sorting?.direction === 'asc'
                          ) {
                            setSorting({
                              field: 'date',
                              direction: 'desc',
                            });
                          } else {
                            setSorting({
                              field: 'date',
                              direction: 'asc',
                            });
                          }
                        }}
                      >
                        Date & Time
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                            fill="#0063F7"
                          />
                        </svg>
                      </span>
                    </th>
                    <th className="w-[100px] rounded-r-lg bg-[#F5F5F5] px-4 py-3 text-right text-sm font-normal text-[#0063F7]">
                      {isSelectMode ? (
                        <div className="flex items-center justify-end gap-2">
                          <div
                            className="cursor-pointer"
                            onClick={handleCancel}
                          >
                            Cancel
                          </div>
                          <div className="relative flex items-center justify-center gap-2">
                            <input
                              type="checkbox"
                              className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                                filterList.length === selectedSubmissions.length
                                  ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                  : 'border-[#9E9E9E] bg-white'
                              } transition-colors duration-200 ease-in-out`}
                              checked={
                                filterList.length ===
                                  selectedSubmissions.length &&
                                filterList.length > 0
                              }
                              onChange={handleSelectAllChange}
                            />
                            {filterList.length === selectedSubmissions.length &&
                              filterList.length > 0 && (
                                <svg
                                  onClick={handleSelectAllChange}
                                  className="z-21 absolute inset-0 m-auto h-4 w-4 cursor-pointer text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer"
                          onClick={() => setIsSelectMode(!isSelectMode)}
                        >
                          Select
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-sm text-gray-500"
                      >
                        No active users found on this site.
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((user, index) => (
                      <tr
                        key={user._id}
                        className={`border-b border-gray-200 hover:bg-gray-100 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                          {user.firstName || '-'}
                        </td>
                        <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                          {user.lastName || '-'}
                        </td>
                        <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                          {user.userType == 1 ? (
                            <span className="rounded-md bg-[#97F1BB] px-2 py-1 text-sm text-[#1E1E1E]">
                              User
                            </span>
                          ) : (
                            <span className="rounded-md bg-[#E2A6FF] px-2 py-1 text-sm text-[#1E1E1E]">
                              Guest
                            </span>
                          )}
                        </td>
                        <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                          {user.createdAt
                            ? `${dateFormat(user.createdAt.toString() ?? '')} ${timeFormat(user.createdAt.toString() ?? '')}`
                            : '-'}
                        </td>
                        <td className="cursor-pointer pr-4">
                          <div className="flex items-center justify-end">
                            {isSelectMode ? (
                              <div
                                key={user._id}
                                className="relative flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                                    selectedSubmissions.some(
                                      (s) => user._id == s._id
                                    )
                                      ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                      : 'border-[#9E9E9E] bg-white'
                                  } transition-colors duration-200 ease-in-out`}
                                  checked={selectedSubmissions.some(
                                    (s) => user._id == s._id
                                  )}
                                  onChange={() => handleCheckboxChange(user)}
                                />
                                {selectedSubmissions.some(
                                  (s) => user._id == s._id
                                ) && (
                                  <svg
                                    onClick={() => handleCheckboxChange(user)}
                                    className="z-21 absolute inset-0 m-auto h-4 w-4 cursor-pointer text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                            ) : (
                              <span
                                className="cursor-pointer rounded-md bg-[#E2F3FF] px-2 py-1 text-sm text-[#1E1E1E] hover:bg-[#D0E7FF]"
                                onClick={() => {
                                  setSelectedDetail(user);
                                  setShowDetailModal(true);
                                }}
                              >
                                View
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            }
          </div>

          <div className="flex items-center justify-between border-t-2 border-gray-200 px-3 py-2">
            <div className="font-Open-Sans text-sm font-normal text-[#616161] md:w-1/3">
              Items per page: {itemsPerPage}
            </div>

            <div className="flex flex-1 items-center justify-center space-x-2 md:w-1/3">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaAngleLeft />
              </button>

              {/* Current Page */}
              <div className="rounded-lg border border-gray-700 px-3 py-1 text-gray-700">
                {currentPage}
              </div>

              {/* Total Pages */}
              <span className="text-sm text-gray-700">
                of {totalPages || 1}
              </span>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaAngleRight />
              </button>
            </div>

            <div className="flex w-fit justify-end gap-4 text-right md:w-1/3">
              {isSelectMode ? (
                <>
                  <Button variant="text" onClick={handleCancel}>
                    <div className="">Cancel</div>
                  </Button>
                  <Button
                    variant="danger"
                    disabled={selectedSubmissions.length === 0}
                    onClick={openSelectedItemsModal}
                  >
                    <div>Sign out ({selectedSubmissions.length})</div>
                  </Button>
                </>
              ) : (
                <div className="hidden md:block" />
              )}
            </div>
          </div>
        </div>
      </div>

      {showSelectedItemsModal && (
        <MultiSignOutModel
          handleShowModel={() => {
            setShowSelectedItemsModal(false);
            handleCancel();
          }}
          selectedSubmissions={selectedSubmissions}
        />
      )}

      {showDetailModal && (
        <ShowSRDetail
          details={selectedDetail}
          handleClose={() => {
            setShowDetailModal(false);
            setSelectedDetail(undefined);
          }}
        />
      )}
    </>
  );
}
