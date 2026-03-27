'use client';
import { signOut, useSession } from 'next-auth/react';

import { BiLogOutCircle } from 'react-icons/bi';
import { ChangeEvent, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import CustomModal from '../Custom_Modal';
import { useMutation, useQuery } from 'react-query';
import {
  updateMyUser,
  updateMyUserProfile,
} from '@/app/(main)/(org-panel)/organization/my-Details/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCards } from '../Organization/Billing/Cards/api';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';

function Navbar() {
  const router = useRouter();
  const axiosAuth = useAxiosAuth();
  const { data: session, status, update } = useSession();
  const userPhotoDisplay = usePresignedUserPhoto(session?.user?.user?.photo);
  const { data: card } = useQuery('cards', () => getCards(axiosAuth), {
    retry: false,
    enabled: status === 'authenticated' && !!session?.user?.accessToken,
  });
  const [showImageModel, setImageModel] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>();
  const [userImage, setUserImage] = useState<string | null | undefined>(
    session?.user.user.photo
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedImage(file || null);
  };
  const updateMyUserProfileMutation = useMutation(updateMyUserProfile, {
    onSuccess: (response) => {
      const updatedUser = {
        ...session?.user,
        user: response,
      };

      const updatedSession = {
        ...session,
        user: updatedUser,
      };

      update(updatedSession);
      setImageModel(!showImageModel);
    },
  });
  return (
    <nav className="flex w-full justify-center bg-primary-600 shadow">
      <div className="flex w-full max-w-[1360px] items-center justify-between">
        <div className="">
          <div className="flex items-center justify-between py-3 md:block md:py-5">
            <a href="/organization">
              {/* <h1 className="text-4xl font-bold text-white">Tiki</h1> */}
              <img src="/svg/logo.svg" alt="Logo" />
            </a>
          </div>
        </div>
        <div className="flex items-center">
          <div
            className={`flex-1 justify-self-center md:mt-0 md:block md:pb-0`}
          >
            <ul className="flex items-center justify-center space-y-8 md:space-x-6 md:space-y-0">
              {session?.user && card && (
                <Dropdown
                  placement="bottom-end"
                  className="min-w-0 max-w-[min(400px,95vw)] rounded-2xl bg-white px-0 py-2 shadow-lg"
                >
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="border-2 transition-transform"
                      color="secondary"
                      name="name"
                      size="md"
                      src={userPhotoDisplay}
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Profile Actions"
                    className="max-h-[min(85vh,600px)] min-w-[min(400px,95vw)] overflow-y-auto px-0"
                    variant="light"
                  >
                    <DropdownItem
                      key={'title'}
                      className="relative px-0"
                      textValue="My Account"
                    >
                      <h3 className="pb-3 text-center text-base font-semibold sm:pb-4 sm:text-lg">
                        My Account
                      </h3>
                      <div className="border-b-2 border-gray-300/80" />
                      <button className="absolute right-3 top-2 text-gray-700 sm:right-5 sm:top-2.5">
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </DropdownItem>
                    <DropdownItem
                      key={'profile-pic'}
                      className="flex flex-col items-center py-2"
                      textValue={`User profile: ${session?.user.user.firstName ?? ''} ${session?.user.user.lastName ?? ''}`}
                    >
                      <div className="relative mx-auto flex w-16 flex-col rounded-full sm:w-20">
                        <div className="flex flex-col items-center">
                          <img
                            src={userPhotoDisplay}
                            alt={`image `}
                            style={{ boxShadow: '0 0 10px #0000002d' }}
                            className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
                            onClick={() => {
                              setImageModel(!showImageModel);
                              setUserImage(session?.user.user.photo);
                            }}
                          />
                          {/* <button
                            type="button"
                            onClick={() => {
                              setImageModel(!showImageModel);
                              setUserImage(session?.user.user.photo);
                            }}
                            className="absolute bottom-0 right-0 block whitespace-nowrap rounded-full bg-gray-700 p-2 text-center text-xs font-normal text-white sm:text-base"
                          >
                            <Pencil className="size-3" />
                          </button> */}
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                          ref={inputRef}
                        />
                      </div>

                      <p className="mt-1.5 text-center text-base font-medium text-[#616161] sm:mt-2 sm:text-lg">
                        Hi, {session?.user.user.firstName ?? ''}{' '}
                        {session?.user.user.lastName ?? ''}
                      </p>
                      <p className="mt-1.5 text-center text-sm font-semibold sm:mt-2 sm:text-base">
                        {session?.user.user.userId ?? ''}
                      </p>
                      <p className="mt-1 truncate px-2 text-center text-xs font-medium text-[#616161] sm:text-base">
                        {session?.user.user.email ?? ''}
                      </p>
                      <div className="mt-4 flex flex-col flex-wrap items-center justify-center gap-3 p-3 font-semibold sm:mt-6 sm:gap-6 sm:p-4">
                        <button
                          key="logout"
                          color="danger"
                          className="text-sm text-blue-500 sm:text-base"
                          onClick={() => {
                            signOut({
                              callbackUrl: `/organization`,
                            });
                          }}
                        >
                          Sign Out
                        </button>
                        <button
                          className="mb-2 cursor-pointer rounded-full bg-gray-700 px-2.5 py-1 text-sm text-white sm:mb-3 sm:px-3 sm:text-base"
                          onClick={() => {
                            router.replace('/user/feeds');
                          }}
                        >
                          User Dashboard
                        </button>
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}
            </ul>

            {/* profile update modal */}
            <CustomModal
              size="md"
              isOpen={showImageModel}
              header={
                <>
                  <img src="/svg/update_profile.svg" alt="update_profile" />
                  <div>
                    <h2 className="text-xl font-semibold text-[#1E1E1E]">
                      {'Profile Picture'}
                    </h2>
                    <span className="mt-1 text-base font-normal text-[#616161]">
                      {'Replace or remove your user profile picture.'}
                    </span>
                  </div>
                </>
              }
              body={
                <div className="flex h-[500px] flex-col items-center justify-center overflow-auto px-3">
                  <img
                    src={
                      selectedImage
                        ? URL.createObjectURL(selectedImage!)
                        : userImage
                          ? userPhotoDisplay
                          : '/images/user.png'
                    }
                    alt={`image `}
                    className="my-4 h-36 w-36 rounded-full object-cover"
                  />
                  <div className="mt-4 flex gap-6">
                    <span
                      className="cursor-pointer text-sm font-semibold text-primary-500"
                      onClick={() => inputRef.current?.click()}
                    >
                      {session?.user.user.photo || selectedImage
                        ? 'Replace Photo'
                        : 'Add Photo'}
                    </span>
                    <span
                      className="cursor-pointer text-sm text-red-400"
                      onClick={() => {
                        setSelectedImage(null);
                        setUserImage(null);
                      }}
                    >
                      Remove Photo
                    </span>
                  </div>
                </div>
              }
              handleCancel={() => {
                setImageModel(!showImageModel);
                setSelectedImage(null);
              }}
              handleSubmit={() => {
                updateMyUserProfileMutation.mutate({
                  axiosAuth,
                  id: session?.user.user._id!,
                  selectedImage: selectedImage,
                });
              }}
              isLoading={updateMyUserProfileMutation.isLoading}
              submitValue={'Save'}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

export { Navbar };
