import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { useState } from 'react';

import { Button } from '@/components/Buttons';

interface AdminSwitchProps {
  adminMode: boolean;
  setAdminMode: (adminMode: boolean) => void;
}

const AdminSwitch: React.FC<AdminSwitchProps> = ({
  adminMode,
  setAdminMode,
}) => {
  const [showConfirmAdmin, setShowConfirmAdmin] = useState(false);

  const handleSwitchToggle = () => {
    if (!adminMode) {
      setShowConfirmAdmin(true);
    } else {
      setAdminMode(false);
    }
  };

  const confirmToggle = () => {
    setAdminMode(!adminMode);
    setShowConfirmAdmin(false);
  };

  return (
    <>
      <div className="hidden items-center justify-center md:flex">
        <label className="flex items-center justify-start gap-2">
          <span className="text-base font-normal text-[#1E1E1E]">
            Admin Mode
          </span>
          <button
            type="button"
            aria-label="Toggle admin mode"
            aria-pressed={adminMode}
            onClick={handleSwitchToggle}
            className={`relative h-8 w-[66px] overflow-hidden rounded-full p-1 transition-colors ${
              adminMode ? 'bg-[#51D18A]' : 'bg-[#E56F73]'
            }`}
          >
            <span
              className={`absolute left-1 top-1 block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                adminMode ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </div>

      {showConfirmAdmin && (
        <Modal
          isOpen={true}
          onOpenChange={() => setShowConfirmAdmin(!adminMode)}
          placement="auto"
          size="xl"
          className="absolute py-2 pl-8"
        >
          <ModalContent className="max-w-[600px] rounded-3xl bg-white">
            {(onCloseModal) => (
              <>
                <ModalHeader className="mb-12 flex flex-row items-center gap-2 px-1 py-5">
                  <div className="flex w-fit gap-4">
                    <svg
                      width="50"
                      height="50"
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                      <path
                        d="M37.7513 31.0419L27.5032 13.2446C27.2471 12.8086 26.8815 12.4471 26.4427 12.1959C26.0038 11.9446 25.5069 11.8125 25.0013 11.8125C24.4956 11.8125 23.9987 11.9446 23.5598 12.1959C23.121 12.4471 22.7554 12.8086 22.4993 13.2446L12.2513 31.0419C12.0049 31.4636 11.875 31.9433 11.875 32.4317C11.875 32.9202 12.0049 33.3998 12.2513 33.8216C12.5041 34.2602 12.869 34.6237 13.3087 34.8748C13.7484 35.1258 14.2469 35.2553 14.7532 35.2501H35.2493C35.7552 35.2549 36.2532 35.1252 36.6925 34.8742C37.1317 34.6231 37.4963 34.2599 37.7489 33.8216C37.9957 33.4 38.1259 32.9205 38.1263 32.432C38.1268 31.9436 37.9973 31.4638 37.7513 31.0419ZM36.1259 32.8829C36.0365 33.0353 35.9083 33.1612 35.7542 33.2477C35.6002 33.3342 35.4259 33.3781 35.2493 33.3751H14.7532C14.5766 33.3781 14.4023 33.3342 14.2483 33.2477C14.0942 33.1612 13.966 33.0353 13.8766 32.8829C13.7957 32.7459 13.753 32.5897 13.753 32.4305C13.753 32.2714 13.7957 32.1152 13.8766 31.9782L24.1247 14.1809C24.2158 14.0293 24.3447 13.9038 24.4987 13.8166C24.6527 13.7295 24.8266 13.6837 25.0036 13.6837C25.1806 13.6837 25.3545 13.7295 25.5085 13.8166C25.6625 13.9038 25.7914 14.0293 25.8825 14.1809L36.1306 31.9782C36.2108 32.1156 36.2526 32.2721 36.2518 32.4312C36.251 32.5903 36.2075 32.7463 36.1259 32.8829ZM24.0638 25.8751V21.1876C24.0638 20.9389 24.1625 20.7005 24.3383 20.5247C24.5142 20.3488 24.7526 20.2501 25.0013 20.2501C25.2499 20.2501 25.4884 20.3488 25.6642 20.5247C25.84 20.7005 25.9388 20.9389 25.9388 21.1876V25.8751C25.9388 26.1237 25.84 26.3622 25.6642 26.538C25.4884 26.7138 25.2499 26.8126 25.0013 26.8126C24.7526 26.8126 24.5142 26.7138 24.3383 26.538C24.1625 26.3622 24.0638 26.1237 24.0638 25.8751ZM26.4075 30.0938C26.4075 30.372 26.325 30.6438 26.1705 30.8751C26.016 31.1064 25.7964 31.2866 25.5394 31.393C25.2824 31.4995 24.9997 31.5273 24.7269 31.4731C24.4541 31.4188 24.2036 31.2849 24.0069 31.0882C23.8102 30.8915 23.6763 30.641 23.622 30.3682C23.5678 30.0954 23.5956 29.8126 23.7021 29.5557C23.8085 29.2987 23.9887 29.0791 24.22 28.9246C24.4512 28.7701 24.7231 28.6876 25.0013 28.6876C25.3742 28.6876 25.7319 28.8357 25.9956 29.0995C26.2593 29.3632 26.4075 29.7209 26.4075 30.0938Z"
                        fill="#0063F7"
                      />
                    </svg>

                    <div>
                      <h2 className="text-xl font-semibold">
                        Enable Admin Mode?
                      </h2>
                      <p className="mt-2 max-w-[400px] text-sm font-normal text-[#616161]">
                        You will be able to see activity from all users in your
                        organization.
                      </p>
                    </div>
                  </div>
                </ModalHeader>

                <ModalFooter className="p-0 pr-2">
                  <div className="flex w-full justify-end border-t-1 pt-2">
                    <Button
                      variant="primaryOutLine"
                      className="mr-4 rounded-lg border-2 border-[#0063F7] bg-transparent px-8 py-1 text-[#0063F7] duration-200"
                      onClick={() => setShowConfirmAdmin(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="rounded-lg bg-[#0063F7] px-8 py-1 text-[#FFFFFF] duration-200"
                      onClick={confirmToggle}
                    >
                      Confirm
                    </Button>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default AdminSwitch;
