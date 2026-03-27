/* eslint-disable @next/next/no-img-element */
import { useAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/context";
import { APPACTIONTYPE } from "@/app/helpers/user/enums";
import { Button } from "../Buttons";
import { useMutation, useQueryClient } from "react-query";
import { deleteAppSumbission } from "@/app/(main)/(user-panel)/user/apps/api";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { PresignedUserAvatar } from "@/components/common/PresignedUserAvatar";
import Loader from "../DottedLoader/loader";
import { useEffect } from "react";
import {
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { format } from "date-fns";
function ShowSubmitAppDetail() {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const context = useAppsCotnext();
  const deleteSubmissionMutation = useMutation(deleteAppSumbission, {
    onSuccess: () => {
      queryClient.invalidateQueries("submission");
      queryClient.invalidateQueries("singleAppSubmission");
    },
  });
  const handleDelete = ({ id }: { id: string }) => {
    deleteSubmissionMutation.mutate({
      axiosAuth: axiosAuth,
      id: id,
    });
  };
  const { onOpenChange } = useDisclosure();
  useEffect(() => {
    if (deleteSubmissionMutation.isSuccess) {
      context.dispatch({ type: APPACTIONTYPE.TOGGLE_SUBMITSUBMISSION });
    }
  });
  return (
    <Modal
      className=""
      isOpen={true}
      placement={"center"}
      backdrop={"blur"}
      onOpenChange={onOpenChange}
      scrollBehavior={"outside"}
      onClose={() => {
        context.dispatch({ type: APPACTIONTYPE.TOGGLE_SUBMITSUBMISSION });
      }}
    >
      <ModalContent className="  h-[650px]  W-[90%] md:min-w-[600px] md:min-h-[755px]">
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-left text-lg mt-3">
              <div className="w-full bg-white rounded-lg flex items-center relative">
                <div className="text-right absolute top-3 right-3 z-10 text-primary-500"></div>
                <div className="min-w-[80px] w-20 h-20 px-3 pt-[19px] pb-5 bg-[#AD96EC]  rounded-xl shadow justify-center items-center inline-flex">
                  <div className="text-center text-black text-xl font-semibold">
                    {context.state.submitAppDetail?.app_id?.name.substring(
                      0,
                      1
                    )}
                  </div>
                </div>
                <div className=" w-full text-center mr-10 text-black text-xl font-semibold">
                  {context.state.submitAppDetail?.app_id?.name}
                </div>
              </div>

              <div
                className="h-1  absolute  top-[116px] right-0 w-[100%] mt-"
                style={{ boxShadow: "0px 2px 4px 0px #0000001A" }}
              ></div>
            </ModalHeader>
            <ModalBody className="">
              <div
                className="w-full  md:w-[503px] h-[348px] bg-white rounded-md  px-4 md:px-10 py-2 mx-auto  mt-6 "
                style={{ boxShadow: "0px 2px 8px 0px #00000033" }}
              >
                <div className="   mb-4 md:mb-10 text-center text-black pt-5 text-[22px] md:text-[32px] font-bold">
                  {context.state.submitAppDetail?.type}
                </div>
                <div className="flex justify-between flex-col md:flex-row    ">
                  <div className="w-full md:w-[50%] ">
                    <div className="mb-5">
                      <div className="text-black text-sm font-normal underline">
                        Full Name
                      </div>
                      <div className="text-black text-lg  font-semibold">{`${context.state.submitAppDetail?.firstName} ${context.state.submitAppDetail?.lastName}`}</div>
                    </div>
                    {context.state.submitAppDetail?.company != "" && (
                      <div className="mb-5">
                        <div className="text-black text-sm font-normal underline">
                          Company
                        </div>
                        <div className="text-black text-lg md:text-xl font-semibold">
                          {}
                        </div>
                      </div>
                    )}
                    <div className="mb-0">
                      <div className="text-black text-sm font-normal underline">
                        Date & Time
                      </div>
                      <div className="text-black text-sm  mt-2 font-semibold">
                        {`${format(
                          new Date(
                            context.state.submitAppDetail?.createdAt ?? ""
                          ),
                          "yyyy-MM-dd"
                        )}`}
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-[35%]  ">
                    <div className="w-full md:w-[134px] h-[120px] md:h-[160px]">
                      <PresignedUserAvatar
                        photo={context.state.submitAppDetail?.photo}
                        fallback="/images/user.png"
                        alt=""
                        className="mt-4 h-full w-full rounded-lg object-cover md:mt-0 md:rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4 md:mt-10">
                <div
                  className="inline-block  text-center text-red-500 text-base font-semibold mx-auto"
                  onClick={() => {
                    handleDelete({ id: context.state.submitAppDetail?._id! });
                  }}
                >
                  {deleteSubmissionMutation.isLoading ? (
                    <Loader />
                  ) : (
                    <>Delete Submission</>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-4 mb-12">
              <button
                className="text-xs md:text-sm font-bold text-[#0063F7] border-3  border-[#0063F7] leading-[22px] w-[120px]  md:min-w-[188px] py-[8px] px-[20px] h-[47px] rounded-lg mt-[2px]  "
                onClick={() => {
                  context.dispatch({
                    type: APPACTIONTYPE.TOGGLE_SUBMITSUBMISSION,
                  });
                }}
              >
                Back
              </button>
              <button
                className="text-[12px] md:text-sm bg-[#0063F7] font-bold text-white leading-[22px] w-[120px]  md:min-w-[188px] py-[8px] px-[10px] md:px-[20px] h-[47px] rounded-lg mt-[2px]"
                type="submit"
                disabled
              >
                Print
              </button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export { ShowSubmitAppDetail };
