import {
  deleteMultipleHazards,
  deleteMultiplePPE,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { signOutMany } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { JSAAPPACTIONTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';

interface SingoutMultiSelectModalProps {
  handleShowModel: () => void;
  selectedSubmissions: SignInRegisterSubmission[];
}

const MultiSignOutModel: React.FC<SingoutMultiSelectModalProps> = ({
  handleShowModel,
  selectedSubmissions,
}) => {
  const { state, dispatch } = useSRAppCotnext();
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();

  const singoutMultipleMutation = useMutation(signOutMany, {
    onSuccess: () => {
      queryClient.invalidateQueries('allSRList');
      handleShowModel();
    },
    onError: () => {
      toast.error('Sugnout Failed');
    },
  });

  // const handleClose = () => {
  //   dispatch({
  //     type: SR_APP_ACTION_TYPE.SIGNOUT_MULTIPLE,
  //     // showMultiHazardsDeleteModel: [],
  //   });
  // };

  return (
    <Modal
      isOpen={true}
      onOpenChange={handleShowModel}
      placement="top-center"
      size="xl"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="relative flex flex-row items-start gap-2 px-5 py-5">
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
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                <path
                  d="M15 25C15 25.3315 15.1317 25.6495 15.3661 25.8839C15.6005 26.1183 15.9185 26.25 16.25 26.25H25.7375L22.8625 29.1125C22.7453 29.2287 22.6523 29.367 22.5889 29.5193C22.5254 29.6716 22.4928 29.835 22.4928 30C22.4928 30.165 22.5254 30.3284 22.5889 30.4807C22.6523 30.633 22.7453 30.7713 22.8625 30.8875C22.9787 31.0047 23.117 31.0977 23.2693 31.1611C23.4216 31.2246 23.585 31.2572 23.75 31.2572C23.915 31.2572 24.0784 31.2246 24.2307 31.1611C24.383 31.0977 24.5213 31.0047 24.6375 30.8875L29.6375 25.8875C29.7513 25.7686 29.8405 25.6284 29.9 25.475C30.025 25.1707 30.025 24.8293 29.9 24.525C29.8405 24.3716 29.7513 24.2314 29.6375 24.1125L24.6375 19.1125C24.521 18.996 24.3826 18.9035 24.2303 18.8404C24.078 18.7774 23.9148 18.7449 23.75 18.7449C23.5852 18.7449 23.422 18.7774 23.2697 18.8404C23.1174 18.9035 22.979 18.996 22.8625 19.1125C22.746 19.229 22.6535 19.3674 22.5904 19.5197C22.5273 19.672 22.4949 19.8352 22.4949 20C22.4949 20.1648 22.5273 20.328 22.5904 20.4803C22.6535 20.6326 22.746 20.771 22.8625 20.8875L25.7375 23.75H16.25C15.9185 23.75 15.6005 23.8817 15.3661 24.1161C15.1317 24.3505 15 24.6685 15 25ZM31.25 12.5H18.75C17.7554 12.5 16.8016 12.8951 16.0983 13.5983C15.3951 14.3016 15 15.2554 15 16.25V20C15 20.3315 15.1317 20.6495 15.3661 20.8839C15.6005 21.1183 15.9185 21.25 16.25 21.25C16.5815 21.25 16.8995 21.1183 17.1339 20.8839C17.3683 20.6495 17.5 20.3315 17.5 20V16.25C17.5 15.9185 17.6317 15.6005 17.8661 15.3661C18.1005 15.1317 18.4185 15 18.75 15H31.25C31.5815 15 31.8995 15.1317 32.1339 15.3661C32.3683 15.6005 32.5 15.9185 32.5 16.25V33.75C32.5 34.0815 32.3683 34.3995 32.1339 34.6339C31.8995 34.8683 31.5815 35 31.25 35H18.75C18.4185 35 18.1005 34.8683 17.8661 34.6339C17.6317 34.3995 17.5 34.0815 17.5 33.75V30C17.5 29.6685 17.3683 29.3505 17.1339 29.1161C16.8995 28.8817 16.5815 28.75 16.25 28.75C15.9185 28.75 15.6005 28.8817 15.3661 29.1161C15.1317 29.3505 15 29.6685 15 30V33.75C15 34.7446 15.3951 35.6984 16.0983 36.4017C16.8016 37.1049 17.7554 37.5 18.75 37.5H31.25C32.2446 37.5 33.1984 37.1049 33.9017 36.4017C34.6049 35.6984 35 34.7446 35 33.75V16.25C35 15.2554 34.6049 14.3016 33.9017 13.5983C33.1984 12.8951 32.2446 12.5 31.25 12.5Z"
                  fill="#0063F7"
                />
              </svg>

              <div className="pr-8">
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {`Sign out (${selectedSubmissions.length})`}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  Are you sure you want to sign selected people out?
                </span>
              </div>
            </ModalHeader>
            <ModalBody className="my-4"></ModalBody>
            <ModalFooter className="border-t-2 border-gray-200">
              <Button
                variant="primaryOutLine"
                className="text-blue"
                onClick={handleShowModel}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-700 px-10 font-semibold text-white"
                onClick={() => {
                  singoutMultipleMutation.mutate({
                    axiosAuth,
                    data: {
                      ids: selectedSubmissions.map((sr) => sr._id),
                    },
                  });
                }}
              >
                {singoutMultipleMutation.isLoading ? <Loader /> : <>Confirm</>}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MultiSignOutModel;
