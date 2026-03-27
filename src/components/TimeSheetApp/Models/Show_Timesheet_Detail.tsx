import { updateReviewStatus } from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { TIMESHEETTYPE } from '@/app/helpers/user/enums';
import { TimeSheet } from '@/app/type/timesheet';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { TimeSheetAllReviewButton } from '../TimeSheet_Helper_Component';
import UserCard from '@/components/UserCard';
import { useSession } from 'next-auth/react';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';

const ShowTimeSheetDetail = ({
  from = 'timesheet',
}: {
  from?: 'review' | 'timesheet';
}) => {
  const [hoveredSharing, setHoveredSharing] = useState<boolean>(false);
  const context = useTimeSheetAppsCotnext();
  const { data: session } = useSession();
  const handleClose = () => {
    context.dispatch({ type: TIMESHEETTYPE.SELECTED_TIMESHEET });
  };
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation(updateReviewStatus, {
    onSuccess: (response) => {
      const data = response.data as TimeSheet;
      context.dispatch({
        type: TIMESHEETTYPE.SELECTED_TIMESHEET,
        selectedTimeSheet: {
          model: data,
          showAs: 'detail',
        },
      });
      queryClient.invalidateQueries('timeSheets');
      // handleClose();
    },
  });
  const handleStatus = (status: 'not' | 'approved' | 'review') => {
    updateStatusMutation.mutate({
      id: context.state.selectedTimeSheet?.model?._id!,
      axiosAuth,
      data: {
        status: status,
        type: 'timesheet',
      },
    });
  };

  return (
    <Modal
      isOpen={true}
      onOpenChange={() => {
        handleClose();
      }}
      placement="top-center"
      size="xl"
      className="pb-4 pl-8 pr-8 pt-8"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 border-b-1 p-0 pb-4">
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                <g clip-path="url(#clip0_444_156587)">
                  <path
                    d="M25 12.5C31.9037 12.5 37.5 18.0963 37.5 25C37.5 31.9037 31.9037 37.5 25 37.5C18.0963 37.5 12.5 31.9037 12.5 25C12.5 18.0963 18.0963 12.5 25 12.5ZM25 17.5C24.6685 17.5 24.3505 17.6317 24.1161 17.8661C23.8817 18.1005 23.75 18.4185 23.75 18.75V25C23.7501 25.3315 23.8818 25.6494 24.1163 25.8837L27.8663 29.6337C28.102 29.8614 28.4178 29.9874 28.7455 29.9846C29.0732 29.9817 29.3868 29.8503 29.6185 29.6185C29.8503 29.3868 29.9817 29.0732 29.9846 28.7455C29.9874 28.4178 29.8614 28.102 29.6337 27.8663L26.25 24.4825V18.75C26.25 18.4185 26.1183 18.1005 25.8839 17.8661C25.6495 17.6317 25.3315 17.5 25 17.5Z"
                    fill="#0063F7"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_444_156587">
                    <rect
                      width="30"
                      height="30"
                      fill="white"
                      transform="translate(10 10)"
                    />
                  </clipPath>
                </defs>
              </svg>

              <div>
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {'Review Timesheet'}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {'View timesheet details below.'}
                </span>
              </div>
            </ModalHeader>
            <ModalBody className="m-0w-full flex flex-col justify-start p-0 pb-8">
              <div className="h-[60vh] max-h-[520px] overflow-y-scroll px-2 py-4">
                <div className="flex w-full justify-between">
                  <div className="flex flex-col">
                    <div className="mb-2 text-[14px] text-[#616161]">
                      Submitted By
                    </div>
                    <span className="mb-2 flex items-center gap-2 text-[14px] text-[#616161]">
                      <PresignedUserAvatar
                        photo={
                          context.state.selectedTimeSheet?.model?.createdBy
                            ?.photo
                        }
                        fallback="/images/user.png"
                        alt="avatar"
                        className="h-[30px] w-[30px] rounded-full border border-gray-500 text-[#616161]"
                      />
                      {`${context.state.selectedTimeSheet?.model?.createdBy.firstName} ${context.state.selectedTimeSheet?.model?.createdBy.lastName}`}
                    </span>
                    <div className="mb-2 flex items-center gap-4 text-[14px] text-[#616161]">
                      <span className="flex items-center gap-2">
                        <svg
                          width="18"
                          height="15"
                          viewBox="0 0 18 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.9151 0.336002H14.6929V2.00267C14.6929 2.16317 14.6612 2.32211 14.5998 2.47039C14.5384 2.61868 14.4484 2.75342 14.3349 2.86691C14.2214 2.9804 14.0866 3.07043 13.9384 3.13185C13.7901 3.19328 13.6311 3.22489 13.4706 3.22489C13.3101 3.22489 13.1512 3.19328 13.0029 3.13185C12.8546 3.07043 12.7199 2.9804 12.6064 2.86691C12.4929 2.75342 12.4029 2.61868 12.3414 2.47039C12.28 2.32211 12.2484 2.16317 12.2484 2.00267V0.336002H5.77619V2.00267C5.77619 2.32682 5.64742 2.6377 5.4182 2.86691C5.18899 3.09612 4.87812 3.22489 4.55396 3.22489C4.22981 3.22489 3.91893 3.09612 3.68972 2.86691C3.46051 2.6377 3.33174 2.32682 3.33174 2.00267V0.336002H1.10952C0.977309 0.334497 0.84614 0.35952 0.72377 0.409592C0.6014 0.459663 0.490314 0.533765 0.397081 0.627516C0.303848 0.721267 0.230362 0.832762 0.18097 0.955407C0.131577 1.07805 0.107281 1.20936 0.109518 1.34156V13.7749C0.107311 13.9048 0.130709 14.0338 0.178377 14.1546C0.226044 14.2754 0.297047 14.3857 0.38733 14.4791C0.477613 14.5724 0.585406 14.6471 0.704555 14.6988C0.823703 14.7505 0.951872 14.7783 1.08174 14.7804H16.9151C17.0449 14.7783 17.1731 14.7505 17.2923 14.6988C17.4114 14.6471 17.5192 14.5724 17.6095 14.4791C17.6998 14.3857 17.7708 14.2754 17.8184 14.1546C17.8661 14.0338 17.8895 13.9048 17.8873 13.7749V1.34156C17.8895 1.21169 17.8661 1.08266 17.8184 0.961836C17.7708 0.841012 17.6998 0.730763 17.6095 0.637385C17.5192 0.544007 17.4114 0.469329 17.2923 0.417617C17.1731 0.365905 17.0449 0.338172 16.9151 0.336002ZM4.55396 11.4471H3.44285V10.336H4.55396V11.4471ZM4.55396 8.66933H3.44285V7.55822H4.55396V8.66933ZM4.55396 5.89156H3.44285V4.78045H4.55396V5.89156ZM7.8873 11.4471H6.77619V10.336H7.8873V11.4471ZM7.8873 8.66933H6.77619V7.55822H7.8873V8.66933ZM7.8873 5.89156H6.77619V4.78045H7.8873V5.89156ZM11.2206 11.4471H10.1095V10.336H11.2206V11.4471ZM11.2206 8.66933H10.1095V7.55822H11.2206V8.66933ZM11.2206 5.89156H10.1095V4.78045H11.2206V5.89156ZM14.554 11.4471H13.4429V10.336H14.554V11.4471ZM14.554 8.66933H13.4429V7.55822H14.554V8.66933ZM14.554 5.89156H13.4429V4.78045H14.554V5.89156Z"
                            fill="#616161"
                          />
                        </svg>
                        {`${dateFormat(
                          context.state.selectedTimeSheet?.model?.createdAt.toString() ??
                            ''
                        )}`}
                      </span>
                      <span className="flex items-center gap-2">
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

                        {`${timeFormat(
                          context.state.selectedTimeSheet?.model?.createdAt.toString() ??
                            ''
                        )}`}
                      </span>
                    </div>
                  </div>

                  {from === 'review' && (
                    <TimeSheetAllReviewButton
                      status={context.state.selectedTimeSheet?.model?.status}
                      handleStatus={handleStatus}
                    />
                  )}
                </div>
                <div className="pt-4">
                  <div className="text-[14px] text-[#616161]">Timesheet ID</div>
                  <span className="text-[16px] font-semibold text-[#1E1E1E]">
                    {context.state.selectedTimeSheet?.model?.referenceId}
                  </span>
                </div>
                <div className="pt-4">
                  <div className="text-[14px] text-[#616161]">Total Hours</div>
                  <span className="text-[16px] font-semibold text-[#1E1E1E]">{`${context.state.selectedTimeSheet?.model?.timeTracker.hours} Hours ${context.state.selectedTimeSheet?.model?.timeTracker.minutes} Minutes`}</span>
                </div>

                <div className="relative pt-4">
                  <div className="text-[14px] text-[#616161]">
                    Assign Projects
                  </div>
                  <div
                    className={
                      'mt-2 flex w-fit items-center gap-1 rounded-md bg-[#97F1BB] px-2 py-1'
                    }
                    onMouseEnter={() => setHoveredSharing(true)}
                    onMouseLeave={() => setHoveredSharing(false)}
                  >
                    {(context.state.selectedTimeSheet?.model?.projects ?? [])
                      .length > 0 &&
                      (context.state.selectedTimeSheet?.model?.projects ??
                        [])[0].name}
                    {(context.state.selectedTimeSheet?.model?.projects ?? [])
                      .length > 1
                      ? ` +${
                          (
                            context.state.selectedTimeSheet?.model?.projects ??
                            []
                          ).length - 1
                        }`
                      : ''}
                  </div>
                  {hoveredSharing && (
                    <div className="absolute rounded-lg border bg-[#97F1BB] text-xs text-[#616161] shadow-lg">
                      {(
                        context.state.selectedTimeSheet?.model?.projects ?? []
                      ).map((pro) => {
                        return (
                          <div
                            className="flex items-start gap-2 px-2 py-1"
                            key={pro._id}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M11.0549 3.375H15.5347C15.8473 3.37497 16.1566 3.4401 16.4426 3.56624C16.7287 3.69238 16.9854 3.87676 17.1962 4.10762C17.4071 4.33848 17.5675 4.61076 17.6673 4.90707C17.767 5.20339 17.804 5.51725 17.7757 5.82863L17.059 13.7036C17.0082 14.2627 16.7503 14.7825 16.3359 15.1611C15.9215 15.5397 15.3805 15.7498 14.8192 15.75H3.17653C2.6152 15.7498 2.07422 15.5397 1.6598 15.1611C1.24539 14.7825 0.987458 14.2627 0.936658 13.7036L0.220033 5.82863C0.173049 5.30758 0.3091 4.78646 0.604783 4.35488L0.560908 3.375C0.560908 2.77826 0.797961 2.20597 1.21992 1.78401C1.64187 1.36205 2.21417 1.125 2.81091 1.125H6.94191C7.5386 1.12513 8.1108 1.36226 8.53266 1.78425L9.46416 2.71575C9.88602 3.13774 10.4582 3.37487 11.0549 3.375ZM1.69266 3.51C1.93416 3.42075 2.19066 3.37575 2.46216 3.375H8.53266L7.73728 2.57963C7.52635 2.36863 7.24025 2.25006 6.94191 2.25H2.81091C2.51621 2.24995 2.23325 2.36553 2.02288 2.57191C1.8125 2.77829 1.69151 3.05898 1.68591 3.35362L1.69266 3.51Z"
                                fill="#616161"
                              />
                            </svg>
                            <span>{pro.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="max-w-xs pt-4">
                  <div className="text-[14px] text-[#616161]">
                    Assigned Customer
                  </div>
                  <UserCard
                    submittedBy={session?.user.user}
                    index={0}
                    name={context.state.selectedTimeSheet?.model?.customer}
                  />
                </div>
                <div className="max-w-xs pt-4">
                  <div className="text-[14px] text-[#616161]">Description</div>
                  <span className="text-[16px] font-semibold text-[#1E1E1E]">{`${context.state.selectedTimeSheet?.model?.description}`}</span>
                </div>
                <div className="pb-16 pt-4">
                  <div className="text-[14px] text-[#616161]">Reference</div>
                  <span className="text-[16px] font-semibold text-[#1E1E1E]">{`${context.state.selectedTimeSheet?.model?.reference}`}</span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-12 border-t-2 border-gray-200 p-0">
              <div className="flex pt-4">
                <Button
                  className="bg-white px-10 font-semibold text-[#0063F7]"
                  onPress={() => {
                    handleClose();
                  }}
                >
                  Close
                </Button>
                <Button
                  isDisabled={
                    context.state.selectedTimeSheet?.model?.status === 'review' ||
                    context.state.selectedTimeSheet?.model?.status === 'approved'
                  }
                  className={
                    context.state.selectedTimeSheet?.model?.status === 'review' ||
                    context.state.selectedTimeSheet?.model?.status === 'approved'
                      ? 'cursor-not-allowed bg-white px-10 font-semibold text-gray-400'
                      : 'bg-white px-10 font-semibold text-[#0063F7]'
                  }
                  onPress={() => {
                    if (
                      context.state.selectedTimeSheet?.model?.status !== 'review' &&
                      context.state.selectedTimeSheet?.model?.status !== 'approved'
                    ) {
                      context.dispatch({
                        type: TIMESHEETTYPE.SELECTED_TIMESHEET,
                        selectedTimeSheet: {
                          showAs: 'edit',
                          model: context.state.selectedTimeSheet?.model,
                        },
                      });
                    }
                  }}
                >
                  Edit
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ShowTimeSheetDetail;
