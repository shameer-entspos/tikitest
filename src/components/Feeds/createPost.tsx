/* eslint-disable @next/next/no-img-element */
import {
  createUserPost,
  getUserTeams,
} from '@/app/(main)/(user-panel)/user/feeds/api';
import { usePostCotnext } from '@/app/(main)/(user-panel)/user/feeds/context';
import { POSTTYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { Dialog } from '@headlessui/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Button } from '../Buttons';
import Loader from '../DottedLoader/loader';
import ImageUpload from './uploadImages';
import { Avatar } from '@nextui-org/react';
import { FaEye } from 'react-icons/fa';
import { X, Image as Imige, Upload } from 'lucide-react';
import CustomHr from '../Ui/CustomHr';
import CustomCheckbox from '../Ui/CustomCheckbox';
import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import CustomModal from '../Custom_Modal';
import toast from 'react-hot-toast';
import { compressImageFiles } from '@/utils/compressImage';

export default function CreatePost() {
  const context = usePostCotnext();
  const session = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const userPhotoDisplay = usePresignedUserPhoto(session?.data?.user?.user?.photo);
  const [text, setText] = useState('');

  const [shareOption, setShareOption] = useState<
    'everyone' | 'organization' | 'team'
  >('everyone');
  const { data } = useQuery({
    queryKey: 'getUserTeams',
    queryFn: () => getUserTeams(axiosAuth),
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Ensure total selected files don't exceed 5
      const remainingSlots = 3 - (context.state.selectedImages! ?? []).length;
      const filesToAdd = Math.min(remainingSlots, files.length);

      // Add selected files
      for (let i = 0; i < filesToAdd; i++) {
        context.dispatch({
          type: POSTTYPE.SELCTIMAGE,
          selectedImages: files[i],
        });
      }
    }

    setImageSelect('text');
  };
  const textArea = useRef<HTMLTextAreaElement | null>(null);
  const createPostMutation = useMutation(createUserPost, {
    onSuccess: () => {
      setImageSelect('text');
      setText('');
      context.dispatch({ type: POSTTYPE.TOGGLE });

      queryClient.invalidateQueries('posts');
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to create post';
      toast.error(message);
    },
  });
  const [teams, setTeams] = useState<string[]>([]);

  // const memoizedImageUpload = useMemo(() => <ImageUpload />, []);
  const [select, setImageSelect] = useState('text');
  const [isCompressing, setIsCompressing] = useState(false);
  const isAddImagesDisabled = (context.state.selectedImages ?? []).length >= 3;

  const handleSubmitPost = async () => {
    const images = context.state.selectedImages ?? [];
    if (images.length > 0) {
      setIsCompressing(true);
      try {
        const compressed = await compressImageFiles(images);
        createPostMutation.mutate({
          axiosAuth,
          content: text ?? '',
          images: compressed,
          sharedWith: shareOption,
          teams: teams,
        });
      } catch (e) {
        toast.error('Failed to process images');
      } finally {
        setIsCompressing(false);
      }
    } else {
      createPostMutation.mutate({
        axiosAuth,
        content: text ?? '',
        images: [],
        sharedWith: shareOption,
        teams: teams,
      });
    }
  };

  return (
    <>
      <div className="flex w-full flex-col">
        <div className="mx-2 rounded-lg bg-white py-5 shadow-primary-shadow sm:px-1">
          <div className="flex items-center space-x-2 px-5">
            <div className="flex-shrink-0">
              <Avatar
                as="button"
                className="h-[50px] w-[50px] rounded-full border transition-transform sm:h-[56px] sm:w-[56px]"
                color="secondary"
                name="name"
                size="sm"
                src={userPhotoDisplay}
              />
            </div>
            <div
              className="w-full cursor-pointer rounded-3xl border-2 border-[#9E9E9E8d] bg-white px-4 py-2.5 font-semibold"
              onClick={() => context.dispatch({ type: POSTTYPE.TOGGLE })}
            >
              <h3 className="ml-2 text-sm text-gray-500 lg:text-base">
                Share a post
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* create post dialog  */}
      <Dialog
        open={context.state.isDialogOpen}
        onClose={() => {
          context.dispatch({ type: POSTTYPE.TOGGLE });
          setImageSelect('text');
          setText('');
          createPostMutation.reset();
        }}
        className="fixed inset-0 z-30 overflow-y-auto"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center bg-secondary-800/70">
          {/* dialog body  */}
          <Dialog.Panel
            className={`w-[90%] ${select === 'category' ? '' : ''} rounded-3xl bg-white py-5 sm:w-11/12 md:w-[596px]`}
          >
            {/* dialog header  */}
            {select !== 'category' && (
              <Dialog.Title className="flex w-full items-center justify-end px-4">
                <button
                  className="rounded-md p-1 outline-none hover:bg-gray-100"
                  onClick={() => {
                    context.dispatch({ type: POSTTYPE.TOGGLE });
                    createPostMutation.reset();
                  }}
                >
                  <X />
                </button>
              </Dialog.Title>
            )}
            {/* create post interface */}

            {select == 'text' && (
              <div className="mx-4 flex flex-col justify-between space-y-3 px-2">
                <textarea
                  className="w-full resize-none text-xl placeholder-gray-700 focus:outline-none"
                  rows={
                    (context.state.selectedImages ?? []).length == 0 ? 6 : 4
                  }
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
                  ref={textArea}
                  maxLength={700}
                  placeholder="Write a post here..."
                />

                {/* image list */}
                {(context.state.selectedImages ?? []).length > 0 && (
                  <div className="mx-28 flex justify-center gap-4">
                    {(context.state.selectedImages ?? []).map(
                      (image, index) => (
                        <div
                          key={index}
                          className="aspect-w-1 aspect-h-1 relative px-1"
                        >
                          <div className="relative h-[54px] w-[70px]">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Selected ${index + 1}`}
                              className="absolute h-[70px] w-[100px] rounded-md object-cover"
                            />
                          </div>

                          <button
                            onClick={() => {
                              context.dispatch({
                                type: POSTTYPE.DESELCTIMAGE,
                                deletetedImageIndex: index,
                              });
                            }}
                            className="relative bottom-[80%] left-[80%] rounded-full bg-[#0063F7] p-1 text-white"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="text-xs font-light text-gray-600 sm:text-[12px]">
                    {`${700 - text.length}`} Characters Left
                  </div>
                  <button
                    onClick={() => {
                      setImageSelect('category');
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-2 py-1 text-sm font-light text-gray-800"
                  >
                    <FaEye className="h-4 w-4" />{' '}
                    {
                      `${shareOption}`
                        .split(' ') // Split the string into an array of words
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        ) // Capitalize the first letter of each word
                        .join(' ') // Join the words back into a single string
                    }
                    {/* {teams.join(', ')} */}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div
                    className="flex cursor-pointer items-center gap-2 text-primary-500"
                    onClick={() => {
                      setImageSelect('image');
                    }}
                  >
                    <Imige /> <span className="font-medium">Photo</span>
                  </div>

                  {/* buttons */}
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      className="h-10 w-20 rounded-full font-medium text-primary-500 outline-none hover:bg-gray-100 sm:h-12 sm:w-24"
                      onClick={() => {
                        context.dispatch({ type: POSTTYPE.TOGGLE });
                        createPostMutation.reset();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className={`rounded-full text-white ${
                        text.length == 0 || text.length == undefined
                          ? 'bg-gray-600'
                          : 'bg-[#0063F7]'
                      } h-10 w-20 outline-none sm:h-12 sm:w-24`}
                      disabled={
                        text.length == 0 ||
                        text.length == undefined ||
                        createPostMutation.isLoading ||
                        isCompressing
                      }
                      onClick={handleSubmitPost}
                    >
                      {createPostMutation.isLoading || isCompressing ? (
                        <Loader />
                      ) : (
                        'Post'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {select == 'image' && (
              <div className="flex w-[100%] flex-col justify-between gap-14 rounded-lg px-4">
                <div className="grid place-content-center rounded-xl py-16">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    multiple
                    disabled={isAddImagesDisabled}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`${
                      isAddImagesDisabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    } flex items-center gap-2 rounded-xl p-2 px-3 font-bold text-primary-500 hover:bg-primary-50`}
                  >
                    Select Images <Upload className="w-4" />
                  </label>
                </div>

                <div className="flex items-center justify-between px-0 text-gray-600">
                  <h1 className="text-xs xl:text-base">Select max 3 images</h1>
                  <div className="flex items-center gap-3 px-4 md:px-0">
                    <button
                      className="h-10 w-20 rounded-full font-medium text-primary-500 outline-none hover:bg-gray-100 sm:h-12 sm:w-24"
                      onClick={() => {
                        setImageSelect('text');
                      }}
                    >
                      {' '}
                      Back
                    </button>

                    <button
                      className={`rounded-full text-white ${
                        text.length == 0 || text.length == undefined
                          ? 'bg-gray-600'
                          : 'bg-[#0063F7]'
                      } h-10 w-20 outline-none sm:h-12 sm:w-24`}
                      disabled={text.length == 0 || text.length == undefined}
                      onClick={() => {
                        setImageSelect('category');
                      }}
                    >
                      {' '}
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
            {select == 'category' && (
              <div className="flex w-full flex-col px-3 py-3">
                <div className="flex items-center justify-between px-5">
                  <div className="space-y-2">
                    <h2 className="text-base font-semibold sm:text-[20px]">
                      Post Audience
                    </h2>

                    <p className="text-xs text-gray-700 sm:text-sm">
                      Select which audience this post will be visible to.
                    </p>
                  </div>

                  <button
                    className="rounded-md p-1 hover:bg-gray-100"
                    onClick={() => setImageSelect('text')}
                  >
                    <X />
                  </button>
                </div>
                <div className="px-4">
                  <CustomHr className="my-4" />
                </div>
                <div className="mb-5 h-[500px] w-full space-y-3 overflow-y-scroll px-3">
                  <div className="mx-4 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-[4px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 sm:text-base">
                        Everyone
                      </span>
                    </div>
                    <CustomCheckbox
                      key={'everyone'}
                      label={''}
                      description={'Internal & External'}
                      checked={shareOption == 'everyone'}
                      onChange={() => {
                        setShareOption('everyone');
                        setTeams([]);
                      }}
                    />
                  </div>
                  <div className="mx-4 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-[4px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 sm:text-base">
                        My Organization
                      </span>
                    </div>
                    <CustomCheckbox
                      key={'organization'}
                      label={''}
                      description={'Internal'}
                      checked={shareOption == 'organization'}
                      onChange={
                        () => {
                          setShareOption('organization');
                          setTeams([]);
                        }
                        // setShareOrg((prev) =>
                        //   prev === '' ? session.data?.user.user?._id! : ''
                        // )
                      }
                    />
                  </div>
                  {(data ?? []).map((filter) => (
                    <div
                      key={filter._id}
                      className="mx-4 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-[4px]"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 sm:text-base">
                          {filter.name}
                        </span>
                      </div>
                      <CustomCheckbox
                        key={'team'}
                        label={''}
                        description={'Team'}
                        checked={teams.includes(filter._id)}
                        onChange={() => {
                          setShareOption('team');
                          setTeams((prev) =>
                            prev.includes(filter._id)
                              ? prev.filter((f) => f !== filter._id)
                              : [...prev, filter._id]
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="px-4">
                  <CustomHr className="my-4" />
                </div>

                <div className="flex justify-center gap-5 px-5 pt-1 font-medium">
                  <button
                    className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-12 sm:w-36 sm:text-base"
                    onClick={() => {
                      setImageSelect('text');
                      setTeams([]);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm text-white hover:bg-primary-600/80 sm:h-12 sm:w-36 sm:text-base"
                    onClick={() => setImageSelect('text')}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
