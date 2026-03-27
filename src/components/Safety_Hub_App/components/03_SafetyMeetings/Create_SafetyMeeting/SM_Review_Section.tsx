import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { WithCreateSafetyMeetingSidebar } from './SM_Create_Sidebar';
import { SMBottomButton } from './SM_Create_Bottom_Button';
import {
  createSafetyMeeting,
  getDiscussionTopicList,
  updateSafetyMeeting,
} from '@/app/(main)/(user-panel)/user/apps/sh/api';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { useSession } from 'next-auth/react';
import MeetingCreatedSuccessfully from '../meeting_created_sucess_dialog';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';

export function SM_Review_Section() {
  const [close, setClose] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const { state, dispatch } = useSafetyHubContext();
  const context = useSafetyHubContext();
  const accessToken = session?.user?.accessToken;
  const allTopicImages = useMemo(
    () =>
      (state.selected_topic ?? []).flatMap((t) =>
        (t.images ?? []).filter(Boolean)
      ) as string[],
    [state.selected_topic]
  );
  const [resolvedUrls, setResolvedUrls] = useState<string[] | null>(null);

  useEffect(() => {
    if (!allTopicImages.length || !accessToken?.trim()) {
      setResolvedUrls(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, allTopicImages, accessToken).then(
      (urls) => {
        if (!cancelled && urls && urls.length === allTopicImages.length)
          setResolvedUrls(urls);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [allTopicImages.join('|'), accessToken, axiosAuth]);

  const getTopicOffset = (topicIndex: number) =>
    (state.selected_topic ?? [])
      .slice(0, topicIndex)
      .reduce((sum, t) => sum + (t.images?.length ?? 0), 0);

  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: 'discussionTopics',
    queryFn: () => getDiscussionTopicList({ axiosAuth }),
  });
  const createMutation = useMutation(createSafetyMeeting, {
    onSuccess: () => {
      setClose(true);
      queryClient.invalidateQueries('safetyMeetings');
    },
  });

  const updateMutation = useMutation(updateSafetyMeeting, {
    onSuccess: () => {
      setClose(true);
      queryClient.invalidateQueries('safetyMeetings');
    },
  });
  const handleSubmit = () => {
    const data = {
      projects: (state.SMSelectedProjects ?? []).map((item) => item.id) ?? [],
      topics:
        (state.selected_topic ?? []).map((item) => ({
          _id: item._id,
          isOpen: item.status?.toLowerCase() === 'open',
        })) ?? [],
      attendance:
        (state.selected_attendence ?? []).map((item) => item._id) ?? [],
      name: state.meeting_payload?.name ?? '',
      leader: state.meeting_payload?.leader ?? '',
      agenda: state.meeting_payload?.agenda ?? '',
      allowPublicToEdit: state.reviewPublicStatusEditable ?? false,
      viewStatus: state.reviewStatus ?? 'public',
    };
    if (state.selected_safety_meeting_model) {
      updateMutation.mutate({
        axiosAuth,
        data,
        id: state.selected_safety_meeting_model._id,
      });
    } else {
      createMutation.mutate({ axiosAuth, data });
    }
  };
  var filterSites =
    (data ?? []).filter((e) =>
      `${e?.title}`.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  return (
    <>
      <WithCreateSafetyMeetingSidebar>
        <div className="h-full w-11/12 overflow-auto scrollbar-hide lg:w-[83%]">
          {/* First Container  */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-2 flex justify-between px-4 pt-5">
              <div className="flex flex-col font-semibold">
                <div className="mb-2">
                  <>Review & Submit</>
                </div>
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
                    className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                    name="option"
                    value="1"
                    checked={state.reviewStatus == 'public'}
                    onChange={() => {
                      dispatch({
                        type: SAFETYHUBTYPE.REVIEW_STATUS_TOGGLE,
                        reviewStatus: 'public',
                      });
                    }}
                  />
                  <span className="ml-2 text-gray-700">Public</span>
                  <span className="mx-2 text-sm text-gray-500">
                    Accessible and visible to the all project members.
                  </span>
                </div>
                <div className="ml-6 mt-2 flex">
                  <CustomBlueCheckBox
                    checked={state.reviewPublicStatusEditable ?? false}
                    onChange={() => {
                      if (state.reviewStatus === 'public') {
                        dispatch({
                          type: SAFETYHUBTYPE.REVIEW_STATUS_EDITABLE,
                        });
                      }
                    }}
                  />

                  <span className="ml-2 text-gray-600">
                    Allow other users to edit this entry.
                  </span>
                </div>
              </label>
              <label className="mb-2 inline-flex items-center px-4">
                <input
                  type="radio"
                  className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                  name="option"
                  value="1"
                  checked={state.reviewStatus == 'private'}
                  onChange={() => {
                    if (state.reviewPublicStatusEditable) {
                      dispatch({
                        type: SAFETYHUBTYPE.REVIEW_STATUS_EDITABLE,
                      });
                    }
                    dispatch({
                      type: SAFETYHUBTYPE.REVIEW_STATUS_TOGGLE,
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

          {/* Project Container  */}
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
                  context.dispatch({
                    type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
                    show_safety_meeting_create_model: 'project',
                  });
                }}
              >
                Edit Section
              </div>
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-start gap-2 px-4 pt-2">
              {(state.SMSelectedProjects ?? []).map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex gap-2 rounded-xl bg-[#E2E2E2] px-3 py-1 text-black"
                  >
                    <span>{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* //// Attendance container  */}
          <div className="mx-2 my-4 flex h-[500px] flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
              <div className="flex flex-col">
                <h2 className="mb-1 text-sm font-semibold md:text-xl">
                  Attendance
                </h2>
                <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                  View people who attended the safety meeting.
                </p>
              </div>
              <div className="flex flex-row items-center justify-end gap-2">
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
                    context.dispatch({
                      type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
                      show_safety_meeting_create_model: 'attendence',
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
                          Full Name
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
                        Email Address
                      </th>
                      <th className="hidden p-2 text-left text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                        Organization
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(state.selected_attendence ?? []).map((topic, index) => (
                      <tr
                        key={topic._id}
                        className={`border-b border-gray-200 hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                          {`${topic.firstName} ${topic.lastName}`}
                        </td>
                        <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                          {topic.email}
                        </td>
                        <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                          {topic?.organization?.name}
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
              <div className="font-Open-Sans text-base font-semibold text-[#616161]">
                {`${(context.state.selected_topic ?? []).length}`} Selected
              </div>
            </div>
          </div>
          {/* /// over view */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] py-5 shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-4 flex justify-start px-6">
              <div className="flex flex-col">
                <h2 className="mb-1 text-xl font-semibold">Meeting Overview</h2>
              </div>
            </div>
            <div className="flex flex-col flex-wrap items-start justify-start px-6">
              <div className="flex w-full flex-row justify-between">
                <div className="w-1/2">
                  {showAssetDetailWithLabel({
                    label: 'Meeting Name',
                    value: state.meeting_payload?.name ?? '',
                  })}
                </div>
                <div className="w-1/2">
                  {showAssetDetailWithLabel({
                    label: 'Safety Leader',
                    value: state.meeting_payload?.leader ?? '',
                  })}
                </div>
              </div>
              {showAssetDetailWithLabel({
                label: 'Agenda',
                value: state.meeting_payload?.agenda ?? '',
              })}
            </div>
          </div>
          {/* Topic Container  */}

          {(context.state.selected_topic ?? []).map((topic, i) => {
            return (
              <div
                key={i}
                className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] px-4 shadow lg:mx-0 lg:ml-2"
              >
                {/* form top  */}
                <div className="mb-2 flex justify-between pt-5">
                  <div className="flex w-1/2 flex-col">
                    <h2 className="mb-1 text-sm font-normal text-[#616161]">
                      Disucssion Topic
                    </h2>
                    <span className="text-sm">{topic.title}</span>
                  </div>
                  <div className="flex w-1/2 flex-col">
                    <h2 className="mb-1 text-sm font-normal text-[#616161]">
                      Category
                    </h2>
                    <span className="text-sm">{topic.category}</span>
                  </div>

                  {/* /// second section  */}
                </div>
                <div className="flex w-1/2 flex-col">
                  <h2 className="mb-1 text-sm font-normal text-[#616161]">
                    Description
                  </h2>
                  <span className="text-sm">{topic.description}</span>
                </div>

                <div className="flex flex-col">
                  <h2 className="my-2 text-lg font-normal text-[#616161]">
                    Photos
                  </h2>
                  <div className="flex gap-4">
                    {(topic.images ?? []).map((url, index) => {
                      const offset = getTopicOffset(i);
                      const resolved = resolvedUrls?.[offset + index] ?? url;
                      return (
                        <div key={index}>
                          <img
                            src={resolved}
                            alt=""
                            className="h-[100px] w-[100px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* // resolution tag */}
                <div className="py-5">
                  <label className="mb-2 block" htmlFor="reasone">
                    Resolution
                  </label>
                  <textarea
                    rows={3}
                    id="resolution"
                    name="resolution"
                    placeholder="Describe the agenda of the meeting and any outcomes you wish to achieve"
                    value={topic.resolution}
                    className={` ${'border-[#EEEEEE]'} w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                    onChange={(value) => {
                      context.dispatch({
                        type: SAFETYHUBTYPE.UPDATE_RESOLUTION,
                        resolutionPayload: {
                          resolution: value.target.value,
                          id: topic._id,
                        },
                      });
                    }}
                  />
                </div>

                {/* /// submitted by  */}
                <div className="flex flex-col justify-start gap-2 py-6">
                  <span className="text-gray-400">{'Submitted By'}</span>

                  <span className="flex cursor-pointer items-center gap-1">
                    {topic?.submittedBy && (
                      <div className="flex items-center">
                        <img
                          src={'/images/User-profile.png'}
                          alt="avatar"
                          className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                        />
                        <span className="text-[#616161]">
                          {session?.user.user._id === topic?.submittedBy._id ? (
                            'Me'
                          ) : (
                            <>
                              {topic?.submittedBy
                                ? `${topic?.submittedBy.firstName} ${topic?.submittedBy.lastName}`
                                : ''}
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </span>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex gap-1">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_3381_22010)">
                          <path
                            d="M17.9151 3.336H15.6929V5.00267C15.6929 5.16317 15.6612 5.32211 15.5998 5.47039C15.5384 5.61868 15.4484 5.75342 15.3349 5.86691C15.2214 5.9804 15.0866 6.07043 14.9384 6.13185C14.7901 6.19328 14.6311 6.22489 14.4706 6.22489C14.3101 6.22489 14.1512 6.19328 14.0029 6.13185C13.8546 6.07043 13.7199 5.9804 13.6064 5.86691C13.4929 5.75342 13.4029 5.61868 13.3414 5.47039C13.28 5.32211 13.2484 5.16317 13.2484 5.00267V3.336H6.77619V5.00267C6.77619 5.32682 6.64742 5.6377 6.4182 5.86691C6.18899 6.09612 5.87812 6.22489 5.55396 6.22489C5.22981 6.22489 4.91893 6.09612 4.68972 5.86691C4.46051 5.6377 4.33174 5.32682 4.33174 5.00267V3.336H2.10952C1.97731 3.3345 1.84614 3.35952 1.72377 3.40959C1.6014 3.45966 1.49031 3.53377 1.39708 3.62752C1.30385 3.72127 1.23036 3.83276 1.18097 3.95541C1.13158 4.07805 1.10728 4.20936 1.10952 4.34156V16.7749C1.10731 16.9048 1.13071 17.0338 1.17838 17.1546C1.22604 17.2754 1.29705 17.3857 1.38733 17.4791C1.47761 17.5724 1.58541 17.6471 1.70455 17.6988C1.8237 17.7505 1.95187 17.7783 2.08174 17.7804H17.9151C18.0449 17.7783 18.1731 17.7505 18.2923 17.6988C18.4114 17.6471 18.5192 17.5724 18.6095 17.4791C18.6998 17.3857 18.7708 17.2754 18.8184 17.1546C18.8661 17.0338 18.8895 16.9048 18.8873 16.7749V4.34156C18.8895 4.21169 18.8661 4.08266 18.8184 3.96184C18.7708 3.84101 18.6998 3.73076 18.6095 3.63739C18.5192 3.54401 18.4114 3.46933 18.2923 3.41762C18.1731 3.3659 18.0449 3.33817 17.9151 3.336ZM5.55396 14.4471H4.44285V13.336H5.55396V14.4471ZM5.55396 11.6693H4.44285V10.5582H5.55396V11.6693ZM5.55396 8.89156H4.44285V7.78045H5.55396V8.89156ZM8.8873 14.4471H7.77619V13.336H8.8873V14.4471ZM8.8873 11.6693H7.77619V10.5582H8.8873V11.6693ZM8.8873 8.89156H7.77619V7.78045H8.8873V8.89156ZM12.2206 14.4471H11.1095V13.336H12.2206V14.4471ZM12.2206 11.6693H11.1095V10.5582H12.2206V11.6693ZM12.2206 8.89156H11.1095V7.78045H12.2206V8.89156ZM15.554 14.4471H14.4429V13.336H15.554V14.4471ZM15.554 11.6693H14.4429V10.5582H15.554V11.6693ZM15.554 8.89156H14.4429V7.78045H15.554V8.89156Z"
                            fill="#616161"
                          />
                          <path
                            d="M5.55556 5.55382C5.7029 5.55382 5.84421 5.49529 5.94839 5.3911C6.05258 5.28691 6.11111 5.14561 6.11111 4.99826V1.66493C6.11111 1.51759 6.05258 1.37628 5.94839 1.27209C5.84421 1.16791 5.7029 1.10938 5.55556 1.10938C5.40821 1.10938 5.26691 1.16791 5.16272 1.27209C5.05853 1.37628 5 1.51759 5 1.66493V4.99826C5 5.14561 5.05853 5.28691 5.16272 5.3911C5.26691 5.49529 5.40821 5.55382 5.55556 5.55382Z"
                            fill="#616161"
                          />
                          <path
                            d="M14.4462 5.55382C14.5935 5.55382 14.7348 5.49529 14.839 5.3911C14.9432 5.28691 15.0017 5.14561 15.0017 4.99826V1.66493C15.0017 1.51759 14.9432 1.37628 14.839 1.27209C14.7348 1.16791 14.5935 1.10938 14.4462 1.10938C14.2988 1.10938 14.1575 1.16791 14.0533 1.27209C13.9492 1.37628 13.8906 1.51759 13.8906 1.66493V4.99826C13.8906 5.14561 13.9492 5.28691 14.0533 5.3911C14.1575 5.49529 14.2988 5.55382 14.4462 5.55382Z"
                            fill="#616161"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_3381_22010">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <span>
                        {dateFormat(
                          topic?.updatedAt.toString() ?? new Date().toString()
                        )}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 1.875C8.39303 1.875 6.82214 2.35152 5.486 3.24431C4.14985 4.1371 3.10844 5.40605 2.49348 6.8907C1.87852 8.37535 1.71762 10.009 2.03112 11.5851C2.34463 13.1612 3.11846 14.6089 4.25476 15.7452C5.39106 16.8815 6.8388 17.6554 8.4149 17.9689C9.99099 18.2824 11.6247 18.1215 13.1093 17.5065C14.594 16.8916 15.8629 15.8502 16.7557 14.514C17.6485 13.1779 18.125 11.607 18.125 10C18.1227 7.84581 17.266 5.78051 15.7427 4.25727C14.2195 2.73403 12.1542 1.87727 10 1.875ZM14.375 10.625H10C9.83424 10.625 9.67527 10.5592 9.55806 10.4419C9.44085 10.3247 9.375 10.1658 9.375 10V5.625C9.375 5.45924 9.44085 5.30027 9.55806 5.18306C9.67527 5.06585 9.83424 5 10 5C10.1658 5 10.3247 5.06585 10.4419 5.18306C10.5592 5.30027 10.625 5.45924 10.625 5.625V9.375H14.375C14.5408 9.375 14.6997 9.44085 14.8169 9.55806C14.9342 9.67527 15 9.83424 15 10C15 10.1658 14.9342 10.3247 14.8169 10.4419C14.6997 10.5592 14.5408 10.625 14.375 10.625Z"
                          fill="#616161"
                        />
                      </svg>

                      <span>
                        {timeFormat(
                          topic?.updatedAt?.toString() ?? new Date().toString()
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-start gap-2 pt-8">
                    <input
                      type="checkbox"
                      checked={topic.status == 'open'}
                      onChange={() => {
                        context.dispatch({
                          type: SAFETYHUBTYPE.UPDATE_TOPIC_CLOSE,
                          topciStatusPayload: {
                            status: topic.status == 'open' ? 'close' : 'open', //'open','close'
                            id: topic._id,
                          },
                        });
                      }}
                      className="h-4 w-4 cursor-pointer"
                    />

                    <span>{`Marks 'Topic' as close`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </WithCreateSafetyMeetingSidebar>
      <div className="h-16">
        <SMBottomButton
          isDisabled={(context.state.selected_topic ?? []).length < 1}
          onCancel={() => {
            context.dispatch({
              type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
              show_safety_meeting_create_model: 'project',
            });
          }}
          nextValue={
            context.state.show_safety_meeting_create_model == 'review'
              ? 'Submit'
              : 'Next'
          }
          loading={createMutation.isLoading || updateMutation.isLoading}
          onNextClick={() => {
            handleSubmit();
          }}
        />
      </div>
      {close && (
        <MeetingCreatedSuccessfully
          handleClose={() => {
            setClose(false);
          }}
          addDisucssion={() => {}}
          onDeleteButton={() => {
            dispatch({
              type: SAFETYHUBTYPE.CLEAR_SAFETY_MEETING_CREATE_MODEL,
            });
          }}
        />
      )}
    </>
  );
}

const showAssetDetailWithLabel = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="flex flex-col justify-start py-2">
      <span className="text-sm text-[#616161]">{label}</span>
      <span className="text-sm text-[#1E1E1E]">{value}</span>
    </div>
  );
};
