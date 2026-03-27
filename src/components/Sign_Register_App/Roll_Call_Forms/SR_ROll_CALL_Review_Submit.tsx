import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';

import { SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { WithRollCallSidebar } from './With_Roll_Call_Sidebar';
import { SRBottomButton } from './SR_Button_Bottom';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import toast from 'react-hot-toast';
import {
  createRollCall,
  getAllSRList,
  updateRollCall,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { useRouter, usePathname } from 'next/navigation';

export function SRReview() {
  const router = useRouter();
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();
  const { data, isLoading } = useQuery({
    queryKey: 'allSRList',
    queryFn: () => getAllSRList({ axiosAuth }),
  });
  const { state, dispatch } = useSRAppCotnext();

  // Get appId from pathname or state
  const pathSegments = pathname?.split('/').filter(Boolean) ?? [];
  const appId = state.sr_app_id || pathSegments[3] || '';

  const textRef = useRef<HTMLParagraphElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const copyText = () => {
    if (textRef.current) {
      const textToCopy = textRef.current.innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success('Submission ID copied successfully');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };
  const queryClient = useQueryClient();
  const createMutation = useMutation(createRollCall, {
    onSuccess: (response) => {
      queryClient.invalidateQueries('rollcalls');
      const rollCallId =
        response?.data?._id || response?._id || response?.data?.data?._id;
      dispatch({ type: SR_APP_ACTION_TYPE.SHOW_ROLL_CALL_FORM });
      if (rollCallId && appId) {
        router.push(`/user/apps/sr/${appId}/${rollCallId}`);
      }
    },
  });
  const updateMutation = useMutation(updateRollCall, {
    onSuccess: () => {
      queryClient.invalidateQueries('rollcalls');
      const rollCallId = state.roll_call_detail?.id;
      dispatch({ type: SR_APP_ACTION_TYPE.SHOW_ROLL_CALL_FORM });
      if (rollCallId && appId) {
        router.push(`/user/apps/sr/${appId}/${rollCallId}`);
      }
    },
  });
  const handleSubmitButton = async () => {
    // Get selected user emails for quick lookup
    const selectedUserEmails = new Set(
      (state.selected_roll_call_user ?? []).map((u) => u.email)
    );

    const mapData = {
      reviewStatus: state.reviewStatus, // public OR private
      publicReviewEditable: state.reviewPublicStatusEditable,
      projects: (state.SRSelectedProjects ?? []).map((p) => p.id),
      sites: (state.SRSelectedSites ?? []).map((s) => s.id),
      title: state.roll_call_detail?.title ?? '',
      description: state.roll_call_detail?.description ?? '',
      users: (filterUsers ?? []).map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.contact || '',
        status: selectedUserEmails.has(user.email) ? 'present' : 'absent',
      })),
    };
    if (state.showEditRollCallForm) {
      updateMutation.mutate({
        axiosAuth,
        data: mapData,
        id: state.roll_call_detail?.id ?? '',
      });
    } else {
      createMutation.mutate({
        axiosAuth,
        data: mapData,
      });
    }
  };

  // Get selected site IDs
  const selectedSiteIds =
    (state.SRSelectedSites ?? []).map((site) => site.id) ?? [];

  // Filter and process data to show only currently signed-in users from selected sites
  const filterUsers = (() => {
    if (!data || data.length === 0) return [];

    // Step 1: Filter by selected sites and currently signed in
    const filteredBySites = (data ?? []).filter((e) => {
      // Only show users who are currently signed in
      if (e.signOutAt != null) return false;

      // If sites are selected, filter by them
      if (selectedSiteIds.length > 0) {
        return selectedSiteIds.includes(e.site?._id);
      }

      // If no sites selected, show all signed-in users
      return true;
    });

    // Step 2: Remove duplicates by email (keep the most recent one)
    const uniqueUsersMap = new Map<string, (typeof data)[0]>();
    filteredBySites.forEach((user) => {
      if (user.email) {
        const existing = uniqueUsersMap.get(user.email);
        if (!existing) {
          uniqueUsersMap.set(user.email, user);
        } else {
          // Keep the most recent sign-in
          const existingDate = existing.signInAt
            ? new Date(existing.signInAt).getTime()
            : new Date(existing.createdAt).getTime();
          const currentDate = user.signInAt
            ? new Date(user.signInAt).getTime()
            : new Date(user.createdAt).getTime();
          if (currentDate > existingDate) {
            uniqueUsersMap.set(user.email, user);
          }
        }
      }
    });

    // Step 3: Convert map to array and apply search filter
    const selectedEmails = new Set(
      (state.selected_roll_call_user ?? []).map((u) => u.email)
    );
    const list = Array.from(uniqueUsersMap.values()).filter((e) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const fullName =
        `${e?.firstName || ''} ${e?.lastName || ''}`.toLowerCase();
      const email = (e?.email || '').toLowerCase();
      const contact = (e?.contact || '').toLowerCase();
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        contact.includes(query)
      );
    });
    // Step 4: Present first, Absent last; then sort by name A-Z within each group
    return [...list].sort((a, b) => {
      const aPresent = selectedEmails.has(a.email ?? '');
      const bPresent = selectedEmails.has(b.email ?? '');
      if (aPresent !== bPresent) return aPresent ? -1 : 1;
      const aName = `${a?.firstName ?? ''} ${a?.lastName ?? ''}`.toLowerCase();
      const bName = `${b?.firstName ?? ''} ${b?.lastName ?? ''}`.toLowerCase();
      return aName.localeCompare(bName);
    });
  })();

  const reviewStatusAsPriviate = state.reviewStatus == 'private';
  const reviewStatusAsPublic = state.reviewStatus == 'public';

  return (
    <>
      <WithRollCallSidebar>
        <div className="h-full w-11/12 overflow-auto scrollbar-hide lg:w-[83%]">
          {/* First Container  */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-2 flex justify-between px-4 pt-5">
              <div className="flex flex-col font-semibold">
                <div className="mb-2">Review</div>
                <p className="text-sm font-normal text-[#616161]">
                  Take a look and review before you save.
                </p>
              </div>
            </div>
            <>
              <label className="mb-2 inline-flex flex-col justify-center px-4 pt-2">
                <div>
                  <input
                    type="radio"
                    className="h-4 w-4 border-2 border-black accent-[#616161] checked:bg-black checked:text-black"
                    name="public"
                    value="public"
                    checked={reviewStatusAsPublic}
                    onChange={() => {
                      dispatch({
                        type: SR_APP_ACTION_TYPE.REVIEW_STATUS_TOGGLE,
                        reviewStatus: 'public',
                      });
                    }}
                  />
                  <span className="ml-2 text-gray-700">Public</span>
                  <span className="mx-2 text-sm text-gray-500">
                    Visible to all assigned Project Members.
                  </span>
                </div>
                <div className="ml-6">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                    name="editable"
                    value={'0'}
                    checked={state.reviewPublicStatusEditable}
                    onChange={() => {
                      dispatch({
                        type: SR_APP_ACTION_TYPE.REVIEW_STATUS_EDITABLE,
                      });
                    }}
                  />
                  <span className="ml-2 text-gray-600">
                    Allow Project Members to edit this entry.
                  </span>
                </div>
              </label>
              <label className="mb-2 inline-flex items-center px-4">
                <input
                  type="radio"
                  className="h-4 w-4 border-2 border-black accent-[#616161] checked:bg-black checked:text-black"
                  name="private"
                  value="private"
                  checked={reviewStatusAsPriviate}
                  onChange={() => {
                    dispatch({
                      type: SR_APP_ACTION_TYPE.REVIEW_STATUS_TOGGLE,
                      reviewStatus: 'private',
                    });
                  }}
                />
                <span className="ml-2 text-gray-700">Private</span>
                <span className="mx-2 text-sm text-gray-500">
                  Only accessible and visible to you.
                </span>
              </label>
            </>
          </div>
          {/* Second Container  */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-4 flex justify-between px-4 pt-5">
              <div className="flex flex-col">
                <h2 className="mb-1 text-xl font-semibold">
                  Assigned Projects
                </h2>
              </div>
              <div
                className="cursor-pointer text-[#0063F7]"
                onClick={() => {
                  dispatch({
                    type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
                    createNewRollCall: 'project',
                  });
                }}
              >
                Edit Section
              </div>
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-start gap-2 px-4 pt-2">
              {(state.SRSelectedProjects ?? []).map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex gap-2 rounded-xl bg-[#97F1BB] px-3 py-1 text-black"
                  >
                    <span>{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Third Container  */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-4 flex justify-between px-4 pt-5">
              <div className="flex flex-col">
                <h2 className="mb-1 text-xl font-semibold">Selected Sites</h2>
              </div>
              <div
                className="cursor-pointer text-[#0063F7]"
                onClick={() => {
                  dispatch({
                    type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
                    createNewRollCall: 'site',
                  });
                }}
              >
                Edit Section
              </div>
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-start gap-2 px-4 pt-2">
              {(state.SRSelectedSites ?? []).map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex gap-2 rounded-xl bg-[#CFC7FF] px-3 py-1 text-black"
                  >
                    <span>{item.siteName}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Forth Container  */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-4 flex justify-between px-4 pt-5">
              <div className="flex flex-col">
                <h2 className="mb-1 text-xl font-semibold">
                  Roll Call Details
                </h2>
              </div>
              <div
                className="cursor-pointer text-[#0063F7]"
                onClick={() => {
                  dispatch({
                    type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
                    createNewRollCall: 'details',
                  });
                }}
              >
                Edit Section
              </div>
            </div>
            <div className="mb-4 flex flex-col flex-wrap items-start justify-start gap-2 px-4 pt-2">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Topic Title</span>
                <div className="mt-4 flex items-center gap-2">
                  <span ref={textRef}>{state.roll_call_detail?.title}</span>
                  <span
                    className="cursor-pointer"
                    onClick={() => {
                      copyText();
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.525 1.25H7.09125C5.98875 1.25 5.115 1.25 4.43187 1.3425C3.72812 1.4375 3.15875 1.6375 2.71 2.08813C2.26062 2.53875 2.06125 3.11062 1.96688 3.81687C1.875 4.50312 1.875 5.38 1.875 6.48687V10.1356C1.875 11.0781 2.45 11.8856 3.26688 12.2244C3.225 11.6556 3.225 10.8588 3.225 10.195V7.06375C3.225 6.26312 3.225 5.5725 3.29875 5.02C3.37812 4.4275 3.55687 3.86 4.01562 3.39937C4.47437 2.93875 5.04 2.75938 5.63 2.67938C6.18 2.60563 6.8675 2.60563 7.66562 2.60563H9.58437C10.3819 2.60563 11.0681 2.60563 11.6187 2.67938C11.4537 2.25836 11.1657 1.89681 10.7923 1.64185C10.4188 1.38689 9.9772 1.25034 9.525 1.25Z"
                        fill="#616161"
                      />
                      <path
                        d="M4.125 7.12219C4.125 5.41844 4.125 4.56656 4.6525 4.03719C5.17937 3.50781 6.0275 3.50781 7.725 3.50781H9.525C11.2219 3.50781 12.0706 3.50781 12.5981 4.03719C13.125 4.56656 13.125 5.41844 13.125 7.12219V10.1347C13.125 11.8384 13.125 12.6903 12.5981 13.2197C12.0706 13.7491 11.2219 13.7491 9.525 13.7491H7.725C6.02812 13.7491 5.17937 13.7491 4.6525 13.2197C4.125 12.6903 4.125 11.8384 4.125 10.1347V7.12219Z"
                        fill="#616161"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Description</span>
                <span className="text-sm font-normal text-black">
                  {state.roll_call_detail?.description}
                </span>
              </div>
            </div>
          </div>
          {/* Fifth Container  */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
              <div className="flex flex-col">
                <h2 className="mb-1 text-sm font-semibold md:text-xl">
                  Attendance
                </h2>
                <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                  Select people who are in attendance
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
                    placeholder="Search Requests"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div
                  className="cursor-pointer text-[#0063F7]"
                  onClick={() => {
                    dispatch({
                      type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
                      createNewRollCall: 'attendance',
                    });
                  }}
                >
                  Edit Section
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-scroll p-5 pt-2">
              {
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                        <span className="flex gap-1">
                          First Name{' '}
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
                        <span className="flex gap-1">
                          {' '}
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
                      <th className="hidden p-2 text-left text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                        Phone
                      </th>
                      <th className="hidden p-2 text-left text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                        Email
                      </th>
                      <th className="p-2 text-xs font-semibold text-gray-600 md:text-sm">
                        <span className="flex gap-1 text-center">
                          Status
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
                    </tr>
                  </thead>
                  <tbody>
                    {(filterUsers ?? []).map((user, index) => (
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
                          {user.contact}
                        </td>
                        <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                          {user.email}
                        </td>
                        <td className="flex justify-center p-2">
                          {(state.selected_roll_call_user ?? []).some(
                            (u1) => u1.email === user.email
                          ) ? (
                            <span className="rounded-lg bg-[#97F1BB] px-2 py-1">
                              Present
                            </span>
                          ) : (
                            <span className="rounded-lg bg-[#FFA8A8] px-2 py-1">
                              Absent
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>

            <div className="flex justify-between border-t-2 border-gray-200 px-3 py-2">
              <div className="font-Open-Sans text-sm font-normal text-[#616161]">
                Items per page: 0
              </div>
              <div></div>
              <div className="font-Open-Sans text-base font-semibold text-[#616161]"></div>
            </div>
          </div>
        </div>
      </WithRollCallSidebar>
      <div className="h-16">
        <SRBottomButton
          onCancel={() => {
            dispatch({
              type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
              createNewRollCall: 'review',
            });
          }}
          loading={createMutation.isLoading}
          onNextClick={handleSubmitButton}
        />
      </div>
    </>
  );
}
