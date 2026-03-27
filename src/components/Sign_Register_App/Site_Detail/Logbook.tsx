import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { listOfSiteSignIn } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { Site } from '@/app/type/Sign_Register_Sites';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import { Button } from '@/components/Buttons';
import CustomModal from '@/components/Custom_Modal';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import { SimpleInput } from '@/components/Form/simpleInput';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import ShowSRDetail from '@/components/Sign_Register_App/Models/SR_Detail';
import ExportLogbookModal from '@/components/Sign_Register_App/Models/Logbook_Export_Modal/ExportLogbookModal';
import LogbookPDF from '@/components/pdfs/LogbookPDF';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useTikiPagination } from '@/hooks/usePagination';
import React, { useState, useEffect } from 'react';
import { RefObject } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useQuery } from 'react-query';
const visitorTypes = [
  { id: 1, name: 'Customer' },
  { id: 2, name: 'Supplier' },
  { id: 3, name: 'Employee' },
  { id: 4, name: 'Contractor' },
  { id: 5, name: 'Courier / Delivery Person' },
  { id: 6, name: 'Family member' },
  { id: 7, name: 'Friend' },
];
export function SiteLogBookSiteSection({
  data,
  contentRef,
}: {
  data: Site | undefined;
  contentRef: RefObject<HTMLDivElement>;
}) {
  ///// filter data /////////////////////////////////////
  const [isApplyFilter, setApplyFilter] = useState(false);
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<string[]>([]);
  const [contact, setContact] = useState('');
  const [filterDates, showFilterDates] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [visitorType, setVisitorType] = useState<number[]>([]);
  const [signInStatus, setSignInStatus] = useState<string>('All');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<
    SignInRegisterSubmission | undefined
  >(undefined);
  const [showExportModal, setShowExportModal] = useState(false);
  // Dropdown handling
  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  // Filter handling
  const clearFilters = () => {
    setApplyFilter(false);
    setShowFilterModel(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setContact('');
    showFilterDates(undefined);
    setVisitorType([]);
    setSignInStatus('All');
    setSelectedUser([]);
    setOpenFilterDropdown('');
  };

  const areFiltersApplied = () => {
    return (
      firstName !== '' ||
      lastName !== '' ||
      email !== '' ||
      contact !== '' ||
      filterDates !== undefined ||
      visitorType.length > 0 ||
      (signInStatus !== 'All' && signInStatus !== '') ||
      (selectedUser.length > 0 && !selectedUser.includes('all'))
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  ///////////////////////////////
  const axiosAuth = useAxiosAuth();
  // Same data source as View Site overview & Active Onsite: listOfSiteSignIn (includes Kiosk sign-ins)
  const { data: siteSignInList, isLoading } = useQuery({
    queryKey: ['sitesignIn', data?._id],
    queryFn: () =>
      listOfSiteSignIn({
        axiosAuth,
        siteId: data?._id ?? '',
      }),
    enabled: !!data?._id,
  });
  const { data: users } = useQuery({
    queryKey: ['allOrgUsers'],
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<'asc' | 'desc'>('asc');

  const signInList = (siteSignInList ?? []);

  const filterList = signInList?.filter((user) => {
    // Safe search matching with null checks
    const firstName = (user.firstName || '').toLowerCase();
    const lastName = (user.lastName || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const contact = (user.contact || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const searchLower = searchQuery.toLowerCase().trim();

    const isNameMatch = searchQuery
      ? fullName.includes(searchLower) ||
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        email.includes(searchLower) ||
        contact.includes(searchLower)
      : true;

    if (isApplyFilter) {
      const isDateMatch = filterDates
        ? (() => {
            const userDate = new Date(user.createdAt);
            const fromDate = new Date(filterDates.from);
            fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(filterDates.to);
            toDate.setHours(23, 59, 59, 999);
            return userDate >= fromDate && userDate <= toDate;
          })()
        : true;

      const isVisitorTypeMatch =
        visitorType.length > 0 ? visitorType.includes(user.visitorType) : true;

      const isSignInStatusMatch =
        signInStatus === 'All'
          ? true
          : signInStatus === 'Signed in'
            ? user.signOutAt == null
            : signInStatus === 'Signed out'
              ? user.signOutAt != null
              : true;

      const isFirstNameMatch = firstName
        ? (user.firstName || '').toLowerCase().includes(firstName.toLowerCase())
        : true;

      const isLastNameMatch = lastName
        ? (user.lastName || '').toLowerCase().includes(lastName.toLowerCase())
        : true;

      const isEmailMatch = email
        ? (user.email || '').toLowerCase().includes(email.toLowerCase())
        : true;

      const isContactMatch = contact
        ? (user.contact || '').toLowerCase().includes(contact.toLowerCase())
        : true;

      // Check submittedBy._id for the "Submitted By" filter
      const isUserMatch =
        selectedUser.length > 0 && !selectedUser.includes('all')
          ? selectedUser.includes(user.submittedBy?._id || '')
          : true;

      return (
        isNameMatch &&
        isDateMatch &&
        isVisitorTypeMatch &&
        isSignInStatusMatch &&
        isFirstNameMatch &&
        isLastNameMatch &&
        isEmailMatch &&
        isContactMatch &&
        isUserMatch
      );
    } else {
      return isNameMatch;
    }
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
  }, [searchQuery, isApplyFilter, setCurrentPage]);

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
              <h2 className="mb-1 text-sm font-semibold md:text-xl">Logbook</h2>
              <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                View the sign in history for this site.
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <FilterButton
                isApplyFilter={isApplyFilter}
                setShowModel={setShowFilterModel}
                showModel={showFilterModel}
                setOpenDropdown={setOpenFilterDropdown}
                clearFilters={clearFilters}
              />
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
                      <span className="flex gap-1">First Name</span>
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      <span className="flex gap-1"> Last Name</span>
                    </th>
                    <th className="p-2 text-xs font-semibold text-gray-600 md:text-sm"></th>
                    <th className="flex p-2 text-left text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                      <span
                        className="flex cursor-pointer gap-1"
                        onClick={() => {
                          if (sorting == 'asc') {
                            setSorting('desc');
                          } else {
                            setSorting('asc');
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
                    <th className="p-2 text-xs font-semibold text-gray-600 md:text-sm"></th>
                    <th className="p-2 text-xs font-semibold text-gray-600 md:text-sm"></th>
                  </tr>
                </thead>
                <tbody>
                  {(paginatedItems ?? [])
                    .sort((a, b) => {
                      const dateA = new Date(a.createdAt);
                      const dateB = new Date(b.createdAt);
                      if (sorting === 'asc') {
                        return dateA.getTime() - dateB.getTime();
                      } else {
                        return dateB.getTime() - dateA.getTime();
                      }
                    })
                    .map((user, index) => (
                      <tr
                        key={user._id}
                        className={`border-b border-gray-200 hover:bg-gray-100 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                          {user.firstName}
                        </td>
                        <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                          {user.lastName}
                        </td>
                        <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                          {user.userType == 1 ? (
                            <>
                              <span className="rounded-md bg-[#97F1BB] px-2 py-1 text-sm text-[#1E1E1E]">
                                User
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="rounded-md bg-[#E2A6FF] px-2 py-1 text-sm text-[#1E1E1E]">
                                Guest
                              </span>
                            </>
                          )}
                        </td>
                        <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                          {`${dateFormat(user.createdAt.toString() ?? '')} ${timeFormat(user.createdAt.toString() ?? '')}`}
                        </td>

                        <td>
                          {user?.signOutAt == null ? (
                            <span className="rounded-md border border-[#3BB66C] px-2 py-1 text-sm font-semibold text-[#3BB66C]">
                              Signed in
                            </span>
                          ) : (
                            <span className="rounded-md border border-[#616161] px-2 py-1 text-sm font-semibold text-[#616161]">
                              Signed out
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className="cursor-pointer rounded-md bg-[#E2F3FF] px-2 py-1 text-[#1E1E1E] hover:bg-[#D0E7FF]"
                            onClick={() => {
                              setSelectedDetail(user);
                              setShowDetailModal(true);
                            }}
                          >
                            View
                          </span>
                        </td>
                      </tr>
                    ))}
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
              <Button
                variant="primary"
                onClick={() => setShowExportModal(true)}
              >
                <div>Export</div>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CustomModal
        isOpen={showFilterModel}
        header={
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">Filter By</h2>
            <span className="mt-1 text-base font-normal text-[#616161]">
              Filter by the following selections and options.
            </span>
          </div>
        }
        body={
          <div className="flex max-h-[500px] flex-col gap-4 overflow-y-auto scrollbar-hide">
            <div className="w-full">
              <DateRangePicker
                title="Submitted Date Range"
                handleOnConfirm={(from: Date, to: Date) => {
                  showFilterDates({ from, to });
                }}
                selectedDate={filterDates}
              />
            </div>
            <div className="w-full">
              <CustomSearchSelect
                label="Sign In Status"
                data={[
                  {
                    label: 'All',
                    value: 'All',
                  },
                  {
                    label: 'Signed in',
                    value: 'Signed in',
                  },
                  {
                    label: 'Signed out',
                    value: 'Signed out',
                  },
                ]}
                showImage={false}
                multiple={false}
                showSearch={false}
                isOpen={openFilterDropdown === 'dropdown1'}
                onToggle={() => handleDropdown('dropdown1')}
                returnSingleValueWithLabel={true}
                onSelect={(selected: any) => {
                  setSignInStatus(selected);
                }}
                selected={signInStatus ? [signInStatus] : []}
                placeholder="-"
                searchPlaceholder="Search Users"
              />
            </div>
            <div className="w-full">
              <CustomSearchSelect
                label="Visitor Type"
                data={visitorTypes.map((type) => ({
                  label: type.name,
                  value: type.id,
                }))}
                showImage={false}
                multiple={true}
                showSearch={false}
                isOpen={openFilterDropdown === 'dropdown2'}
                onToggle={() => handleDropdown('dropdown2')}
                onSelect={(selected: any) => {
                  setVisitorType(selected);
                }}
                selected={visitorType}
                placeholder="-"
                searchPlaceholder="Search visitor type"
              />
            </div>
            <SimpleInput
              type="text"
              label="First Name"
              placeholder="Enter First Name"
              name="name"
              className="w-full"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
            />{' '}
            <SimpleInput
              type="text"
              label="Last Name"
              placeholder="Enter Last Name"
              name="name"
              className="w-full"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
            />{' '}
            <SimpleInput
              type="text"
              label="Contact"
              placeholder="Enter Phone Number"
              name="name"
              className="w-full"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
              }}
            />{' '}
            <SimpleInput
              type="text"
              label="Email Address"
              placeholder="Enter Email Address"
              name="name"
              className="w-full"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <div className="w-full">
              <CustomSearchSelect
                label="Submitted By"
                data={[
                  {
                    label: 'All Users',
                    value: 'all',
                  },
                  ...((users ?? []).map((user) => ({
                    label: `${user.firstName} ${user.lastName}`,
                    value: user._id,
                    photo: user.photo,
                  })) ?? []),
                ]}
                showImage={true}
                multiple={false}
                showSearch={true}
                isOpen={openFilterDropdown === 'dropdown3'}
                onToggle={() => handleDropdown('dropdown3')}
                onSelect={(selected: string[]) => {
                  setSelectedUser(selected);
                }}
                selected={selectedUser}
                placeholder="-"
                searchPlaceholder="Search Users"
              />
            </div>
          </div>
        }
        handleCancel={clearFilters}
        cancelButton="Reset"
        handleSubmit={handleApplyFilters}
        submitDisabled={!areFiltersApplied()}
        submitValue={'Apply'}
      />
      {/* /////  Filter Model */}

      {showDetailModal && (
        <ShowSRDetail
          details={selectedDetail}
          handleClose={() => {
            setShowDetailModal(false);
            setSelectedDetail(undefined);
          }}
        />
      )}

      {showExportModal && (
        <ExportLogbookModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          site={data}
          logbookData={filterList}
          onExportPDF={async () => {
            return new Promise<void>((resolve, reject) => {
              try {
                toast.loading('Generating PDF...', {
                  className: 'text-primary-500',
                });

                pdf(<LogbookPDF data={data} logbookData={filterList} />)
                  .toBlob()
                  .then((blob) => {
                    const fileName = `logbook-${data?.siteId || data?._id || 'export'}-${new Date().toISOString().split('T')[0]}.pdf`;

                    saveAs(blob, fileName);

                    const pdfUrl = URL.createObjectURL(blob);
                    window.open(pdfUrl, '_blank');

                    toast.remove();
                    toast.success('PDF generated successfully');

                    setTimeout(() => {
                      URL.revokeObjectURL(pdfUrl);
                    }, 1000);

                    resolve();
                  })
                  .catch((error) => {
                    toast.remove();
                    toast.error('Failed to generate PDF');
                    console.error('Failed to generate PDF', error);
                    reject(error);
                  });
              } catch (error) {
                toast.remove();
                toast.error('Failed to generate PDF');
                console.error('Failed to generate PDF', error);
                reject(error);
              }
            });
          }}
        />
      )}
    </>
  );
}
