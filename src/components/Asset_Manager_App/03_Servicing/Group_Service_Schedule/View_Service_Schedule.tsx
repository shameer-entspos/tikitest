import { GroupService } from '@/app/type/service_group';
import { ServiceSchedule } from '@/app/type/group_service_schedule';
import { SingleAsset } from '@/app/type/single_asset';
import { dateFormat } from '@/app/helpers/dateFormat';
import { useState } from 'react';
import CustomModal from '@/components/Custom_Modal';
import UserCard from '@/components/UserCard';

export const ViewGroupServiceScheduleModel = ({
  model,
  handleClose,
  group,
  assets,
  showFooter = false,
  handleSubmit,
}: {
  handleClose: any;
  model: ServiceSchedule | undefined;
  group: GroupService | undefined;
  assets: SingleAsset[];
  showFooter?: boolean;
  handleSubmit?: any;
}) => {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  return (
    <CustomModal
      isOpen={true}
      header={
        <div className="flex w-full flex-row items-start gap-4 py-2">
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
            <g clipPath="url(#clip0_4088_16397)">
              <path
                d="M29.6875 38.125C28.2041 38.125 26.7541 37.6851 25.5207 36.861C24.2874 36.0369 23.3261 34.8656 22.7584 33.4951C22.1907 32.1247 22.0422 30.6167 22.3316 29.1618C22.621 27.707 23.3353 26.3706 24.3842 25.3217C25.4331 24.2728 26.7695 23.5585 28.2243 23.2691C29.6792 22.9797 31.1872 23.1282 32.5576 23.6959C33.9281 24.2636 35.0994 25.2249 35.9235 26.4582C36.7476 27.6916 37.1875 29.1416 37.1875 30.625C37.1875 32.6141 36.3973 34.5218 34.9908 35.9283C33.5843 37.3348 31.6766 38.125 29.6875 38.125ZM29.6875 25C28.575 25 27.4874 25.3299 26.5624 25.948C25.6374 26.5661 24.9164 27.4446 24.4907 28.4724C24.0649 29.5002 23.9535 30.6312 24.1706 31.7224C24.3876 32.8135 24.9234 33.8158 25.71 34.6025C26.4967 35.3892 27.499 35.9249 28.5901 36.1419C29.6813 36.359 30.8123 36.2476 31.8401 35.8218C32.8679 35.3961 33.7464 34.6751 34.3645 33.7501C34.9826 32.8251 35.3125 31.7375 35.3125 30.625C35.3125 29.1332 34.7199 27.7024 33.665 26.6475C32.6101 25.5926 31.1793 25 29.6875 25Z"
                fill="#0063F7"
              />
              <path
                d="M31.1781 33.4375L28.75 31.0094V26.875H30.625V30.2406L32.5 32.1156L31.1781 33.4375Z"
                fill="#0063F7"
              />
              <path
                d="M36.25 15.625C36.25 15.1277 36.0525 14.6508 35.7008 14.2992C35.3492 13.9475 34.8723 13.75 34.375 13.75H30.625V11.875H28.75V13.75H21.25V11.875H19.375V13.75H15.625C15.1277 13.75 14.6508 13.9475 14.2992 14.2992C13.9475 14.6508 13.75 15.1277 13.75 15.625V34.375C13.75 34.8723 13.9475 35.3492 14.2992 35.7008C14.6508 36.0525 15.1277 36.25 15.625 36.25H19.375V34.375H15.625V15.625H19.375V17.5H21.25V15.625H28.75V17.5H30.625V15.625H34.375V21.25H36.25V15.625Z"
                fill="#0063F7"
              />
            </g>
            <defs>
              <clipPath id="clip0_4088_16397">
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
            <h1>{'View Service Schedule'}</h1>

            <span className="text-base font-normal text-[#616161]">
              {'View service schedule details below.'}
            </span>
          </div>
          <div></div>
        </div>
      }
      body={
        <div className={`max-h-[580px] w-full px-3`}>
          <div className="flex h-[580px] w-full flex-col overflow-y-scroll scrollbar-hide">
            {showAssetDetailWithLabel({
              label: 'Schedule Name',
              value: model?.name,
            })}
            {showAssetDetailWithLabel({
              label: 'Description',
              value: model?.description,
            })}
            {showAssetDetailWithLabel({
              label: 'Service Date',
              value: dateFormat(model?.serviceDate?.toString() ?? ''),
            })}
            {showAssetDetailWithLabel({
              label: 'Group Name',
              value: group?.name,
            })}
            {showAssetDetailWithLabel({
              label: 'Description',
              value: group?.description,
            })}
            <div className="flex flex-col justify-start py-3">
              <span className="text-sm text-[#616161]">
                {'Service Group - Selected Customer'}
              </span>

              <div className="flex cursor-pointer items-center px-2 py-2">
                <img
                  src={'/user.svg'}
                  alt="avatar"
                  className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#1E1E1E]"
                />
                {`${group?.customer}`}
              </div>
            </div>
            <div className="flex flex-col justify-start py-3">
              <span className="text-sm text-[#616161]">
                {'Service Group - Selected Managers'}
              </span>

              <div className="grid cursor-pointer grid-cols-2 flex-wrap items-center px-2 py-2">
                {(group?.managers ?? [])?.map((manager) => (
                  <div key={manager._id}>
                    <UserCard submittedBy={manager} index={0} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-start py-3">
              <span className="border-b border-gray-400 py-2 text-sm font-semibold text-[#1E1E1E]">
                {'Selected Assets'}
              </span>

              <div className="grid cursor-pointer grid-cols-1 flex-wrap items-center py-2">
                {(assets ?? [])?.map((asset) => (
                  <div
                    key={asset._id}
                    className="border-b border-gray-400 py-2 even:bg-[#F0F0F0]"
                  >
                    <div className="grid grid-cols-3 justify-start gap-8 px-3 text-left text-base text-[#1E1E1E]">
                      <span>{asset.atnNum}</span>
                      <span>{asset.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
      handleCancel={handleClose}
      handleSubmit={handleSubmit}
      submitValue={showFooter ? 'Add Log' : ''}
      showFooter={showFooter}
      justifyButton={'justify-end'}
    />
  );
};

const showAssetDetailWithLabel = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {
  return (
    <div className="flex flex-col justify-start py-3">
      <span className="text-sm text-[#616161]">{label}</span>
      <span>{value}</span>
    </div>
  );
};
