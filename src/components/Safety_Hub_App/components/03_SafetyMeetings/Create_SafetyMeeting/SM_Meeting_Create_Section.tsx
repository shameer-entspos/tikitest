import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import { useState, useMemo, useEffect } from 'react';
import { WithCreateSafetyMeetingSidebar } from './SM_Create_Sidebar';
import { SMBottomButton } from './SM_Create_Bottom_Button';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { SimpleInput } from '@/components/Form/simpleInput';
import { useSession } from 'next-auth/react';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import useAxiosAuth from '@/hooks/AxiosAuth';

export function SM_Meeting_Create_Section() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const accessToken = session?.user?.accessToken;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] =
    useState<string>('Project Members');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const context = useSafetyHubContext();
  const allTopicImages = useMemo(
    () =>
      (context.state.selected_topic ?? []).flatMap((t) =>
        (t.images ?? []).filter(Boolean)
      ) as string[],
    [context.state.selected_topic]
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
    (context.state.selected_topic ?? [])
      .slice(0, topicIndex)
      .reduce((sum, t) => sum + (t.images?.length ?? 0), 0);

  const appFormValidatorSchema = Yup.object().shape({
    // Email validation
    name: Yup.string().required('title is required'),
  });
  const organizationForm = useFormik({
    initialValues: {
      name: context.state.meeting_payload?.name ?? '',
      leader: context.state.meeting_payload?.leader ?? '',
      agenda: context.state.meeting_payload?.agenda ?? '',
    },

    validationSchema: appFormValidatorSchema,
    onSubmit: (values) => {
      console.log(values);
      context.dispatch({
        type: SAFETYHUBTYPE.UPDATE_MEETING_PAYLOAD,
        meeting_payload: {
          ...values,
        },
      });
      context.dispatch({
        type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
        show_safety_meeting_create_model: 'review',
      });
    },
  });

  return (
    <>
      <WithCreateSafetyMeetingSidebar>
        <div className="h-full w-11/12 overflow-auto scrollbar-hide lg:w-[83%]">
          {/* First Container  */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-2 flex flex-col justify-between px-4 pt-5">
              <div className="flex flex-col font-semibold">
                <h2 className="mb-1 text-sm font-semibold md:text-xl">
                  Meeting Overview
                </h2>
                <span className="text-[10px] font-normal text-[#616161] md:text-sm">
                  Fill the meeting detail out below.
                </span>
              </div>

              {/* /// meeting section  */}
              <div className="mt-6 flex w-full gap-2">
                <div className="w-1/2">
                  <SimpleInput
                    label="Meeting Name"
                    type="text"
                    placeholder="Give it unique identifiable name"
                    name="name"
                    className="w-full"
                    errorMessage={organizationForm.errors.name}
                    value={organizationForm.values.name}
                    isTouched={organizationForm.touched.name}
                    onChange={organizationForm.handleChange}
                  />
                </div>
                <div className="w-1/2">
                  <CustomSearchSelect
                    label="Safety Leader"
                    data={[
                      ...(context.state.SMSelectedProjects ?? []).flatMap(
                        (project) =>
                          (project.members ?? []).map((member) => ({
                            label: `${member.firstName} ${member.lastName} - ${member.organization?.name ?? ''}`,
                            value: `${member.firstName} ${member.lastName} - ${member.organization?.name ?? ''}`,
                            photo: member.photo,
                          }))
                      ),
                    ]}
                    onSelect={(value, item) => {
                      if (typeof value === 'string') {
                        organizationForm.setFieldValue('leader', item);
                      }
                    }}
                    searchPlaceholder="Search Project Members"
                    returnSingleValueWithLabel={true}
                    selected={
                      organizationForm.values.leader
                        ? [organizationForm.values.leader]
                        : []
                    }
                    hasError={false}
                    showImage={true}
                    multiple={false}
                    placeholder="-"
                    isOpen={openDropdown === 'dropdown5'}
                    onToggle={() => handleToggle('dropdown5')}
                  />
                </div>
              </div>
              <div className="py-5">
                <label className="mb-2 block" htmlFor="reasone">
                  Agenda
                </label>
                <textarea
                  rows={3}
                  id="description"
                  name="agenda"
                  placeholder="Describe the agenda of the meeting and any outcomes you wish to achieve"
                  value={organizationForm.values.agenda}
                  className={` ${
                    organizationForm.errors.agenda &&
                    organizationForm.touched.agenda
                      ? 'border-red-500'
                      : 'border-[#EEEEEE]'
                  } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                  onChange={organizationForm.handleChange}
                />
                {organizationForm.errors.agenda &&
                  organizationForm.touched.agenda && (
                    <span className="text-xs text-red-500">
                      {organizationForm.errors.agenda}
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Second Container  */}
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
                      Discussion Topic
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

                {(topic.images ?? []).length > 0 && (
                  <div className="flex flex-col">
                    <h2 className="my-2 text-sm font-normal text-[#616161]">
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
                )}

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
              show_safety_meeting_create_model: 'meeting',
            });
          }}
          onNextClick={() => {
            organizationForm.submitForm();
          }}
        />
      </div>
    </>
  );
}
