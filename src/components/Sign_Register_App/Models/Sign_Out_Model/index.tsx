import { submitSignOut } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { timeFormat } from '@/app/helpers/dateFormat';
import { getVisitorTypeLabel, SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import CustomModal from '@/components/Custom_Modal';
import Loader from '@/components/DottedLoader/loader';
import UserCard from '@/components/UserCard';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQueryClient } from 'react-query';
import { getPresignedFileUrl } from '@/app/(main)/(user-panel)/user/file/api';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function SignOutModel({
  handleClose,
  details,
}: {
  handleClose: () => void;
  details: SignInRegisterSubmission | undefined;
}) {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const rawPhoto = details?.photo?.trim();
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!rawPhoto || !accessToken?.trim()) {
      setResolvedUrl(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrl(axiosAuth, rawPhoto, accessToken).then((url) => {
      if (!cancelled && url) setResolvedUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [rawPhoto, accessToken, axiosAuth]);

  const displayPhoto = resolvedUrl ?? rawPhoto ?? '/images/User-profile.png';

  const signoutMutation = useMutation(submitSignOut, {
    onSuccess: (res) => {
      queryClient.invalidateQueries('allSRList');
      handleClose();
    },
  });
  return (
    <>
      <CustomModal
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
              <g clipPath="url(#clip0_1_50713)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22.5 9.48895C22.5001 9.35698 22.5315 9.22692 22.5917 9.10947C22.6519 8.99203 22.7392 8.89056 22.8463 8.81342C22.9533 8.73628 23.0772 8.68568 23.2077 8.66578C23.3381 8.64588 23.4715 8.65725 23.5967 8.69895L34.43 12.3098C34.596 12.3651 34.7404 12.4712 34.8427 12.6132C34.945 12.7551 35 12.9256 35 13.1006V36.8989C35 37.0739 34.945 37.2445 34.8427 37.3864C34.7404 37.5284 34.596 37.6345 34.43 37.6898L23.5967 41.3006C23.4715 41.3423 23.3381 41.3537 23.2077 41.3338C23.0772 41.3139 22.9533 41.2633 22.8463 41.1861C22.7392 41.109 22.6519 41.0075 22.5917 40.8901C22.5315 40.7727 22.5001 40.6426 22.5 40.5106V37.4998H15V11.6665H22.5V9.48895ZM27.5 24.1665C27.5 25.0873 27.1267 25.8331 26.6667 25.8331C26.2067 25.8331 25.8333 25.0873 25.8333 24.1665C25.8333 23.2456 26.2067 22.4998 26.6667 22.4998C27.1267 22.4998 27.5 23.2456 27.5 24.1665ZM22.5 13.3331H16.6667V35.8331H22.5V13.3331Z"
                  fill="#0063F7"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_50713">
                  <rect
                    width="40"
                    height="40"
                    fill="white"
                    transform="translate(5 5)"
                  />
                </clipPath>
              </defs>
            </svg>

            <div>
              <h1>Sign in Badge</h1>
              <span className="text-base font-normal text-[#616161]">
                view sign in details below.
              </span>
            </div>
          </div>
        }
        body={
          <div className="h-[60vh] max-h-[520px] w-full overflow-auto px-6">
            <div className="mx-auto flex h-full w-full flex-col justify-between bg-white px-5 text-left">
              <div className="mb-4">
                <div className="relative">
                  {/* check and show url image here  */}
                  <img
                    src={
                      details?.photo && details.photo.trim() !== ''
                        ? displayPhoto
                        : '/images/User-profile.png'
                    }
                    alt="Profile"
                    className="mx-auto h-36 w-36 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      // Fallback to default image if photo fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/User-profile.png';
                    }}
                  />
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transform rounded px-2 py-1 text-xs text-black ${details?.userType === 1 ? 'bg-[#97F1BB]' : 'bg-[#E2A6FF]'}`}>
                    {details?.userType === 1 ? 'User' : 'Guest'}
                  </span>
                </div>
              </div>
              <div className="mb-4 flex justify-between">
                <div>
                  <h2 className="text-sm text-gray-600">Sign in - Timestamp</h2>
                  <p className="text-base font-semibold">
                    {timeFormat(details?.createdAt.toString() ?? '')}
                  </p>
                </div>
                <div>
                  <h2 className="text-sm text-gray-600">
                    Sign out - Timestamp
                  </h2>
                  <p className="text-base font-semibold">
                    {details?.signOutAt ? (
                      timeFormat(details?.signOutAt.toString() ?? '')
                    ) : (
                      <>Not signed out</>
                    )}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <h2 className="text-sm text-gray-600">Visitor Type</h2>
                <p className="text-base font-semibold">
                  {getVisitorTypeLabel(details?.visitorType)}
                </p>
              </div>
              <div className="mb-4">
                <h2 className="text-sm text-gray-600">Full Name</h2>
                <p className="text-base font-semibold">{`${details?.firstName} ${details?.lastName}`}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-sm text-gray-600">Contact Phone</h2>
                <p className="text-base font-semibold">{details?.contact}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-sm text-gray-600">Contact Email</h2>
                <p className="text-base font-semibold">{details?.email}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-sm text-gray-600">Site Name</h2>
                <p className="text-base font-semibold">
                  {details?.site?.siteName}
                </p>
              </div>{' '}
              <div className="mb-4">
                <h2 className="text-sm text-gray-600">Address</h2>
                <p className="text-base font-semibold">
                  {details?.site?.addressLineOne}
                </p>
              </div>{' '}
              <div className="mb-4">
                <h2 className="text-sm text-gray-600">Reason For Visit</h2>
                <p className="text-base font-semibold">{details?.reason}</p>
              </div>{' '}
              <div className="mb-4">
                <h2 className="text-sm text-gray-600">Submitted By</h2>
                <div>
                  <UserCard submittedBy={details?.submittedBy} index={0} />
                </div>
              </div>
            </div>
          </div>
        }
        handleCancel={handleClose}
        isOpen={true}
        handleSubmit={() => {
          signoutMutation.mutate({
            axiosAuth,
            id: details?._id ?? '',
          });
        }}
        submitValue={
          signoutMutation.isLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <>Sign Out</>
          )
        }
      />
    </>
  );
}
