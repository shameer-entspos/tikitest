import { useMemo, useState } from 'react';
import { SRTopBar } from './SR_Top_Bar';
import { Switch } from '@material-tailwind/react';
import { Search } from '../Form/search';
import { Button } from '../Buttons';
import CreateManageSitesModel from './Models/Manage_Sites_Models/Create_Manage_Sites';
import ViewManageSitesModel from './Models/Manage_Sites_Models/View_Manage_Sites';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { useQuery, useQueryClient } from 'react-query';
import {
  checkSRPermission,
  getAllSites,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import Loader from '../DottedLoader/loader';
import DeleteSiteModel from './Models/Manage_Sites_Models/DeleteSiteModel';
import SiteQRCodeModal from './Models/Manage_Sites_Models/SiteQRCodeModal';
import { Site } from '@/app/type/Sign_Register_Sites';
import { useSession } from 'next-auth/react';
import AdminSwitch from '../AdminSwitch/AdminSwitch';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { SimpleInput } from '../Form/simpleInput';
import MultiSiteDeleteModel from './Models/Manage_Sites_Models/SiteMultiDeleteModel';
import { getContactList } from '@/app/(main)/(user-panel)/user/chats/api';
import { useRouter, usePathname } from 'next/navigation';

function SiteCreatedByAvatar({
  photo,
  className = 'mr-2 h-8 w-8 rounded-full border border-gray-500 object-cover text-[#1E1E1E]',
}: {
  photo?: string;
  className?: string;
}) {
  const src = usePresignedUserPhoto(photo);
  return <img src={src} alt="avatar" className={className} />;
}

export default function ManageSites() {
  const memoizedTopBar = useMemo(() => <SRTopBar />, []);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname?.split('/').filter(Boolean) ?? [];
  const appId = pathSegments[3]; // /user/apps/sr/[appId]
  const [searchQuery, setSearchQuery] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [showViewDetail, setViewDetail] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedModel, setModel] = useState<Site | undefined>();
  const [showNew, setNew] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleViewDetail = () => setViewDetail(!showViewDetail);
  const handleDelete = () => setDeleteOpen(!isDeleteOpen);
  const handleNew = () => setNew(!showNew);
  const handleShowQRCode = () => setShowQRCode(!showQRCode);
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };

  const axiosAuth = useAxiosAuth();

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryFn: () => getAllSites({ axiosAuth, isAdmin: adminMode }),
    queryKey: ['appsites', adminMode],
    enabled: true,
  });
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryFn: () => getAllAppProjects(axiosAuth),
    queryKey: ['allProjects'],
  });
  // Assigned Customer filter: Tiki Workplace > Contacts > Customers (role 4)
  const { data: contacts } = useQuery({
    queryKey: 'contacts',
    queryFn: () => getContactList(axiosAuth),
  });
  const customersFromContacts = (contacts ?? []).filter(
    (c: any) => c.role === 4
  );
  // Created By filter: site creators only (organization users who created at least one site)
  const siteCreators = useMemo(() => {
    const createdByIds = new Map<
      string,
      { _id: string; firstName?: string; lastName?: string }
    >();
    (data ?? []).forEach((site) => {
      const cb = site.createdBy;
      if (!cb) return;
      const id = (cb as any)?._id ?? cb;
      if (id && !createdByIds.has(id)) {
        createdByIds.set(id, {
          _id: id,
          firstName: (cb as any)?.firstName,
          lastName: (cb as any)?.lastName,
        });
      }
    });
    return Array.from(createdByIds.values());
  }, [data]);

  // multi selection handling
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showSelectedItemsModal, setShowSelectedItemsModal] = useState(false);
  const openSelectedItemsModal = () => {
    setShowSelectedItemsModal(true);
  };
  const [selectedSubmissions, setCheckedSubmissions] = useState<Site[]>([]);
  const handleCancel = () => {
    setCheckedSubmissions([]);
    setIsSelectMode(false); // Exit select mode
  };

  const handleSelectAllChange = () => {
    if ((filterData ?? []).length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions([...(filterData ?? [])]);
    }
  };

  const handleCheckboxChange = (s: Site) => {
    if (selectedSubmissions.some((selectedTs) => selectedTs._id === s._id)) {
      setCheckedSubmissions([
        ...(selectedSubmissions ?? []).filter(
          (selectedTs) => selectedTs._id !== s._id
        ),
      ]);
    } else {
      setCheckedSubmissions([...(selectedSubmissions ?? []), s]);
    }
  };

  // Filter handling

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedSubmittedBy, setSelectedSubmittedBy] = useState<string[]>([]);
  const [siteId, setSiteId] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  // Check app-level permission (backend already checks global apps permission and returns adminMode: true if user has it)
  const { data: permission } = useQuery('SRSettingPermission', () =>
    checkSRPermission(axiosAuth)
  );

  // User can use Admin Mode if Root User or has permission (which includes global apps permission)
  const canUseAdminMode = isRootUser || permission?.adminMode === true;

  const clearFilters = () => {
    setSelectedProjects([]);
    setSelectedCustomers([]);
    setSelectedSubmittedBy([]);
    setSiteId('');
    setSiteName('');
    setSiteAddress('');
    //   firstName: "",
    //   lastName: "",
    //   contactPhone: "",
    //   emailAddress: "",
    // });
    setApplyFilter(false);
  };

  const areFiltersApplied = () => {
    return (
      selectedProjects.length > 0 ||
      selectedCustomers.length > 0 ||
      selectedSubmittedBy.length > 0 ||
      siteId != '' ||
      siteName != '' ||
      siteAddress != ''
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };

  const filterData = (data ?? [])
    .filter((app) => {
      if (searchQuery !== '') {
        const query = searchQuery.toLowerCase();
        return (
          app._id.toLowerCase().includes(query) ||
          app.siteName?.toLowerCase().includes(query) ||
          app.addressLineOne?.toLowerCase().includes(query) ||
          app.addressLineTwo?.toLowerCase().includes(query) ||
          `${app.createdBy?.firstName} ${app.createdBy?.lastName}`
            .toLowerCase()
            .includes(query)
        );
      } else {
        return true;
      }
    })
    .filter((forProject) => {
      if (!isApplyFilter || selectedProjects.length === 0) {
        return true;
      }

      return forProject.projects.some(
        (project) => project._id && selectedProjects.includes(project._id)
      );
    })
    .filter((forCustomer) => {
      if (!isApplyFilter) {
        return true;
      }
      if (selectedCustomers.length === 0) return true;

      return selectedCustomers.some(
        (cust) => cust === forCustomer.assignedCustomer
      );
    })
    .filter((forCreatedBy) => {
      if (!isApplyFilter || selectedSubmittedBy.length === 0) return true;
      const creatorId =
        (forCreatedBy.createdBy as any)?._id ?? forCreatedBy.createdBy;
      return creatorId && selectedSubmittedBy.includes(creatorId);
    })
    .filter((bySiteName) => {
      if (!isApplyFilter || !siteName) {
        return true;
      }
      return bySiteName.siteName == siteName.trim();
    })
    .filter((bySiteAddress) => {
      if (!isApplyFilter || !siteAddress) {
        return true; // Skip filtering if no filter is applied or siteAddress is empty
      }

      // Normalize and trim the `siteAddress` input
      const normalizedAddress = siteAddress.trim().toLowerCase();

      // Check if either `addressLineOne` or `addressLineTwo` matches the input
      return (
        bySiteAddress.addressLineOne
          ?.toLowerCase()
          .includes(normalizedAddress) ||
        bySiteAddress.addressLineTwo?.toLowerCase().includes(normalizedAddress)
      );
    });

  if (isLoading) {
    return <Loader />;
  }
  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
          {/* TopBar */}
          {memoizedTopBar}

          {/* ///////////////// Middle content ////////////////////// */}

          <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
            <div className="sticky top-0 z-20 bg-white pb-2">
              <div className="mt-4 flex flex-col justify-between gap-2 lg:flex-row">
                {/* page logo and name */}
                <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
                  <div className="relative h-[50px] w-[50px] rounded-lg shadow">
                    <img src="/svg/sr/logo.svg" alt="show logo" />
                  </div>
                  <h2 className="ml-2 text-2xl font-bold">Manage Sites</h2>
                </div>

                {/* dropdown filter & search */}
                <div className="flex items-center gap-4">
                  {canUseAdminMode && (
                    <div className="hidden md:flex">
                      <AdminSwitch
                        adminMode={adminMode}
                        setAdminMode={setAdminMode}
                      />
                    </div>
                  )}
                  {/* )} */}

                  <div className="flex flex-grow gap-4">
                    <FilterButton
                      isApplyFilter={isApplyFilter}
                      setShowModel={setShowFilterModel}
                      showModel={showFilterModel}
                      setOpenDropdown={setOpenDropdown}
                      clearFilters={clearFilters}
                    />

                    <div className="Search team-actice flex w-full items-center justify-between">
                      <Search
                        inputRounded={true}
                        type="search"
                        className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
                        name="search"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* /// table section  */}

            <div className="relative flex-1">
              {
                <table className="mt-3 w-full border-collapse font-Open-Sans">
                  <thead className="bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                    <tr>
                      <th className="px-6 py-3">
                        <div className="flex">
                          Site Address
                          <img
                            src="/images/fluent_arrow-sort-24-regular.svg"
                            className="cursor-pointer px-1"
                            alt="image"
                          />
                        </div>
                      </th>
                      <th className="px-2 py-3">
                        <div className="flex">
                          Site Name
                          <img
                            src="/images/fluent_arrow-sort-24-regular.svg"
                            className="cursor-pointer px-1"
                            alt="image"
                          />
                        </div>
                      </th>
                      <th className="px-2 py-3">Submitted By</th>
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
                                  (filterData ?? []).length ==
                                  (selectedSubmissions ?? []).length
                                    ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                    : 'border-[#9E9E9E] bg-white'
                                } transition-colors duration-200 ease-in-out`}
                                onChange={handleSelectAllChange}
                              />
                              {(filterData ?? []).length ==
                                (selectedSubmissions ?? []).length && (
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
                    {(filterData ?? []).map((site, index) => {
                      return (
                        <tr
                          key={site._id}
                          className="relative border-b even:bg-[#F5F5F5]"
                        >
                          <td
                            className="w-400 cursor-pointer truncate px-6 py-2 text-primary-500"
                            onClick={() => {
                              router.push(
                                `/user/apps/sr/site/${site._id}${appId ? `?appId=${appId}` : ''}`
                              );
                            }}
                          >
                            <span>{site.addressLineOne}</span>
                          </td>

                          <td className="sw-72 relative px-2 py-2 text-[#616161]">
                            {site.siteName}
                          </td>

                          <td
                            className="flex cursor-pointer items-center px-2 py-2"
                            onMouseEnter={() => setHoveredUser(index)}
                            onMouseLeave={() => setHoveredUser(null)}
                          >
                            <SiteCreatedByAvatar
                              photo={site.createdBy?.photo}
                            />
                            {`${site.createdBy.firstName} ${site.createdBy.lastName}`}
                            {hoveredUser === index && (
                              <div className="absolute top-8 z-20 mt-2 w-[300px] rounded-lg border bg-gray-50 p-4 text-xs text-[#616161] shadow-lg">
                                <div className="flex items-start">
                                  <SiteCreatedByAvatar
                                    photo={site.createdBy?.photo}
                                    className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-500 bg-gray-200 object-cover"
                                  />
                                  <div className="ml-4 space-y-2">
                                    <p className="text-sm font-semibold text-[#605f5f]">
                                      {`${site.createdBy.firstName} ${site.createdBy.lastName}`}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20px"
                                        viewBox="0 -960 960 960"
                                        width="20px"
                                        fill="#616161"
                                      >
                                        <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280 320-200v-80L480-520 160-720v80l320 200Z" />
                                      </svg>
                                      <p className="text-xs">
                                        {site.createdBy.email}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20px"
                                        viewBox="0 -960 960 960"
                                        width="20px"
                                        fill="#616161"
                                      >
                                        <path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z" />
                                      </svg>
                                      <p className="text-sm">
                                        {site.createdBy.organization?.name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="cursor-pointer pr-4">
                            <div className="flex items-center justify-end">
                              {isSelectMode ? (
                                <div
                                  key={site._id}
                                  className="relative flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                                      selectedSubmissions.some(
                                        (sr) => site._id == sr._id
                                      )
                                        ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                        : 'border-[#9E9E9E] bg-white'
                                    } transition-colors duration-200 ease-in-out`}
                                    checked={selectedSubmissions.some(
                                      (sr) => site._id == sr._id
                                    )}
                                    onChange={() => handleCheckboxChange(site)}
                                  />
                                  {selectedSubmissions.some(
                                    (sr) => site._id == sr._id
                                  ) && (
                                    <svg
                                      onClick={() => handleCheckboxChange(site)}
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
                                <Dropdown placement="bottom-end">
                                  <DropdownTrigger>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      height="24px"
                                      viewBox="0 -960 960 960"
                                      width="24px"
                                      fill="#616161"
                                      className="hover:fill-[#8d8d8d]"
                                    >
                                      <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
                                    </svg>
                                  </DropdownTrigger>
                                  <DropdownMenu aria-label="Dynamic Actions">
                                    <DropdownItem
                                      key="View"
                                      onClick={() => {
                                        router.push(
                                          `/user/apps/sr/site/${site._id}${appId ? `?appId=${appId}` : ''}`
                                        );
                                      }}
                                    >
                                      View
                                    </DropdownItem>
                                    <DropdownItem
                                      key="res"
                                      onClick={() => {
                                        setModel(site);
                                        handleShowQRCode();
                                      }}
                                    >
                                      Site QR Code
                                    </DropdownItem>
                                    <DropdownItem
                                      key="edit"
                                      onClick={() => {
                                        setModel(site);
                                        handleNew();
                                      }}
                                    >
                                      Edit
                                    </DropdownItem>
                                    <DropdownItem
                                      key="del"
                                      onClick={() => {
                                        setModel(site);
                                        handleDelete();
                                      }}
                                    >
                                      Delete
                                    </DropdownItem>
                                  </DropdownMenu>
                                </Dropdown>
                              )}{' '}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              }

              {isLoading && (
                <div className="flex h-full w-full place-content-center items-center justify-center">
                  <Loader />
                </div>
              )}

              {(filterData ?? []).length < 1 && !isLoading && (
                <div className="flex h-full w-full place-content-center items-center justify-center">
                  <div className="flex w-1/2 flex-col items-center justify-center">
                    <img
                      src="/images/empty-box.svg"
                      className="m-2 w-[20%]"
                      alt="image"
                    />
                    <p className="text-1xl m-2">Nothing to see here</p>
                  </div>
                </div>
              )}

              {/* Add Button */}
              <div className="absolute bottom-6 right-6 z-10">
                <Button
                  variant="primaryRounded"
                  onClick={() => {
                    setModel(undefined);
                    handleNew();
                  }}
                >
                  {'+ Add'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-16">
          <div className="flex h-full w-full items-center justify-between rounded-t-xl border-2 border-[#EEEEEE] border-b-transparent p-2">
            <div className="flex-1 text-left text-sm font-normal text-[#616161]">
              Items per page: 50
            </div>
            <div className="absolute left-1/2 flex -translate-x-1/2 transform items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.0364 13.4677C10.2121 13.2919 10.3108 13.0535 10.3108 12.8049C10.3108 12.5563 10.2121 12.3179 10.0364 12.1421L5.39574 7.50145L10.0364 2.86082C10.2071 2.68401 10.3016 2.4472 10.2995 2.20139C10.2974 1.95558 10.1988 1.72044 10.0249 1.54662C9.85112 1.3728 9.61598 1.2742 9.37018 1.27207C9.12437 1.26993 8.88755 1.36443 8.71074 1.5352L3.4073 6.83864C3.23155 7.01445 3.13281 7.25286 3.13281 7.50145C3.13281 7.75004 3.23155 7.98846 3.4073 8.16426L8.71074 13.4677C8.88654 13.6435 9.12496 13.7422 9.37355 13.7422C9.62214 13.7422 9.86055 13.6435 10.0364 13.4677Z"
                  fill="#616161"
                />
              </svg>
              <div className="flex items-center justify-center rounded-lg border-1 border-[#616161] px-3 py-1 text-[14px] text-[#1E1E1E]">
                1
              </div>
              <div className="text-[#616161]">of 1</div>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.96364 1.54011C4.78788 1.71592 4.68915 1.95433 4.68915 2.20292C4.68915 2.45152 4.78788 2.68993 4.96364 2.86574L9.60426 7.50636L4.96364 12.147C4.79286 12.3238 4.69837 12.5606 4.70051 12.8064C4.70264 13.0522 4.80124 13.2874 4.97506 13.4612C5.14888 13.635 5.38401 13.7336 5.62982 13.7357C5.87563 13.7379 6.11245 13.6434 6.28926 13.4726L11.5927 8.16918C11.7685 7.99337 11.8672 7.75495 11.8672 7.50636C11.8672 7.25777 11.7685 7.01936 11.5927 6.84355L6.28926 1.54011C6.11346 1.36436 5.87504 1.26563 5.62645 1.26563C5.37786 1.26563 5.13944 1.36436 4.96364 1.54011Z"
                  fill="#616161"
                />
              </svg>
            </div>
            {isSelectMode && (
              <div className="flex w-fit justify-end gap-4 text-right">
                <Button variant="text" onClick={handleCancel}>
                  <div className="">Cancel</div>
                </Button>
                <Button
                  variant="danger"
                  disabled={(selectedSubmissions ?? []).length === 0}
                  onClick={() => {
                    console.log('selected submissions: ', selectedSubmissions);
                    openSelectedItemsModal();
                  }}
                >
                  <div>Delete ({(selectedSubmissions ?? []).length})</div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNew && (
        <CreateManageSitesModel handleClose={handleNew} site={selectedModel} />
      )}
      {showViewDetail && (
        <ViewManageSitesModel
          handleClose={handleViewDetail}
          site={selectedModel}
        />
      )}
      {isDeleteOpen && (
        <DeleteSiteModel
          isOpen={isDeleteOpen}
          onClose={handleDelete}
          site={selectedModel}
        />
      )}

      {showSelectedItemsModal && (
        <MultiSiteDeleteModel
          handleShowModel={() => {
            setShowSelectedItemsModal(!showSelectedItemsModal);
            handleCancel();
          }}
          selectedSubmissions={selectedSubmissions}
        />
      )}

      {showQRCode && (
        <SiteQRCodeModal
          isOpen={showQRCode}
          onClose={handleShowQRCode}
          site={selectedModel}
        />
      )}

      {/* filter model */}
      <Modal
        isOpen={showFilterModel}
        onOpenChange={() => setShowFilterModel(!showFilterModel)}
        placement="auto"
        size="xl"
        className="absolute h-[700px] px-8 py-2"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="relative flex flex-row items-center gap-2 border-b-2 border-gray-200 px-1 py-5">
                <button
                  onClick={onCloseModal}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="#616161"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="pr-8">
                  <h2 className="text-xl font-semibold">Filter By</h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Filter by the following selections and options.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody className="flex flex-col justify-start gap-8 overflow-y-scroll p-0 pb-16 pt-8 scrollbar-hide">
                <div className="w-full">
                  <CustomSearchSelect
                    isRequired={true}
                    label="Assigned Project"
                    data={(projects ?? []).map((project) => ({
                      label: project.name ?? '',
                      value: project._id ?? '',
                    }))}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggleDropdown('dropdown1')}
                    onSelect={(selected: string[]) =>
                      setSelectedProjects(selected)
                    }
                    selected={selectedProjects}
                    placeholder="All"
                  />
                </div>

                <div className="">
                  <CustomSearchSelect
                    label="Assigned Customer"
                    data={[
                      { label: 'My Organization', value: 'My Organization' },
                      ...customersFromContacts.map((c: any) => ({
                        label: c.customerName
                          ? c.customerName
                          : `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() ||
                            c.email,
                        value: c._id,
                        photo: c.photo,
                      })),
                    ]}
                    multiple={true}
                    onSelect={(selected: string[]) =>
                      setSelectedCustomers(selected)
                    }
                    selected={selectedCustomers}
                    returnSingleValueWithLabel={true}
                    showImage={true}
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleToggleDropdown('dropdown2')}
                  />
                </div>

                <div className="w-full">
                  <CustomSearchSelect
                    label="Created By (site creators only)"
                    data={siteCreators.map((u) => ({
                      label:
                        `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ||
                        u._id,
                      value: u._id,
                    }))}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggleDropdown('dropdown3')}
                    onSelect={(selected: string[]) =>
                      setSelectedSubmittedBy(selected)
                    }
                    placeholder="All"
                  />
                </div>

                <SimpleInput
                  type="text"
                  label="Site Name"
                  placeholder="Enter Site Name"
                  name="siteName"
                  className="w-full"
                  value={siteName}
                  onChange={(value) => {
                    setSiteName(value.target.value);
                  }}
                />

                <SimpleInput
                  type="text"
                  label="Site Address"
                  placeholder="Enter Site Address"
                  name="siteAddress"
                  className="w-full"
                  value={siteAddress}
                  onChange={(value) => {
                    setSiteAddress(value.target.value);
                  }}
                />

                {/*

                

                <SimpleInput
                  type="text"
                  label="Site ID"
                  placeholder="Enter Site ID"
                  name="siteId"
                  className="w-full"
                  value={siteId}
                  onChange={(value) => {
                    setSiteId(value.target.value);
                  }}
                />

                <SimpleInput
                  type="text"
                  label="Site Name"
                  placeholder="Enter Site Name"
                  name="siteName"
                  className="w-full"
                  value={siteName}
                  onChange={(value) => {
                    setSiteName(value.target.value);
                  }}
                />

                <SimpleInput
                  type="text"
                  label="Site Address"
                  placeholder="Enter Site Address"
                  name="siteAddress"
                  className="w-full"
                  value={siteAddress}
                  onChange={(value) => {
                    setSiteAddress(value.target.value);
                  }}
                /> */}
              </ModalBody>
              <ModalFooter className="pt-0">
                <div className="flex w-full justify-center border-t-1 pt-8">
                  <Button
                    variant="primaryOutLine"
                    className="mr-4 rounded-lg border-2 border-[#0063F7] bg-transparent px-8 py-1 text-[#0063F7] duration-200"
                    onClick={clearFilters}
                  >
                    Reset
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleApplyFilters}
                    disabled={!areFiltersApplied()}
                  >
                    Apply
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
