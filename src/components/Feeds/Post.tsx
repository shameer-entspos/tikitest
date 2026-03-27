/* eslint-disable @next/next/no-img-element */
'use client';
import { formatTimeDifference } from '@/app/(main)/(user-panel)/user/chats/api';
import {
  deletePost,
  getAllPost,
  Post,
  toggleLikedPost,
} from '@/app/(main)/(user-panel)/user/feeds/api';
import { usePostCotnext } from '@/app/(main)/(user-panel)/user/feeds/context';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { MdOutlineDelete } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Loader from '../DottedLoader/loader';
import { CommentSection } from './commentSection';
import PostContent from './postContent';
import PostImageList from './postImages';
import { Avatar } from '@nextui-org/react';
// @ts-ignore
import { useSession } from 'next-auth/react';
import CustomHr from '../Ui/CustomHr';
import { EllipsisIcon, X } from 'lucide-react';

function PostCreatorAvatar({ photo }: { photo?: string }) {
  const src = usePresignedUserPhoto(photo);
  return (
    <Avatar
      as="button"
      className="h-[50px] w-[50px] border-2 transition-transform"
      color="secondary"
      name="name"
      size="sm"
      src={src}
    />
  );
}

export default function Posts({
  shareOptions,
  teams,
}: {
  shareOptions: Array<'everyone' | 'organization' | 'team' | 'my post'>;
  teams: string[];
}) {
  let [deletedPost, setDeletePost] = useState<string | undefined>(undefined);

  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: 'posts',
    queryFn: () => getAllPost(axiosAuth),
  });
  const likeMutation = useMutation(toggleLikedPost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
    },
  });
  const [selectedPost, SetSelectedPost] = useState<Post | null>(null);
  const deleteMutation = useMutation(deletePost, {
    onSuccess: () => {
      setDeletePost(undefined);
      queryClient.invalidateQueries('posts');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader />
      </div>
    );
  }
  if (isSuccess) {
    const filterData = (data ?? [])
      .filter((filter) => {
        // If "everyone" is selected, show all posts (internal + external)
        if (shareOptions.includes('everyone')) return true;

        // Check if post was created by current user (works for all post types including team posts)
        const isMyPostMatch =
          shareOptions.includes('my post') &&
          filter?.createdBy?._id == session?.user.user._id;

        // Check if post is from same organization (works for all post types including team posts)
        const isOrgMatch =
          shareOptions.includes('organization') &&
          filter?.orgId == session?.user.user.organization?._id;

        // Check if post is shared with teams
        const isTeamPost = filter?.sharedWith === 'team';
        const hasTeamFilter = shareOptions.includes('team');

        // For team posts: only show if team filter is selected AND matches selected teams
        // OR if "My Post" or "Organization" matches (so user can see their team posts)
        let isTeamMatch = false;
        if (isTeamPost) {
          if (hasTeamFilter && teams.length > 0) {
            // Team filter selected: only show if post teams match selected teams
            isTeamMatch = (filter?.teams ?? []).some((s) => teams.includes(s));
          } else {
            // Team filter not selected: show if "My Post" or "Organization" matches
            isTeamMatch = isMyPostMatch || isOrgMatch;
          }
        }

        // Check direct sharedWith match for non-team posts (everyone, organization, etc.)
        const isSharedWithMatch =
          !isTeamPost &&
          filter?.sharedWith &&
          shareOptions.includes(
            filter.sharedWith as
              | 'everyone'
              | 'organization'
              | 'team'
              | 'my post'
          );

        return isTeamMatch || isMyPostMatch || isOrgMatch || isSharedWithMatch;
      })
      .sort((a: Post, b: Post) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    return (
      <div className="space-y-4">
        {filterData.map((post: Post) => {
          return (
            <div
              className="m-2 flex w-auto flex-col items-center justify-center rounded-lg bg-white shadow-primary-shadow"
              key={post._id}
            >
              <div className="w-full space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* <img src="/images/User.png" alt="User Avatar" className="w-10 h-10 rounded-full" /> */}
                    <PostCreatorAvatar photo={post?.createdBy?.photo} />
                    <div>
                      <p className="font-semibold text-[#000000]">
                        {`${post?.createdBy?.firstName ?? ''} ${post?.createdBy?.lastName ?? ''}`}
                      </p>
                      <p className="text-medium text-[#616161]">
                        {`${post?.createdBy?.organization?.name ?? ''}`}
                      </p>

                      <div className="flex">
                        <span className="text-sm text-[#616161]">
                          {post?.createdAt
                            ? `${formatTimeDifference(new Date(post.createdAt))}-`
                            : ''}
                        </span>

                        <p className="text-sm text-[#616161]">
                          {post?.sharedWith
                            ? `Shared: ${post.sharedWith
                                .split(' ') // Split the string into an array of words
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ) // Capitalize the first letter of each word
                                .join(' ')}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {post?.createdBy?._id == session?.user.user._id && (
                    <div className="flex justify-end">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <div>
                          <Menu.Button className="rounded-md p-1 hover:bg-gray-100">
                            <EllipsisIcon />
                          </Menu.Button>
                        </div>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items
                            className={`absolute right-0 top-5 z-10 mt-2 w-auto origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
                          >
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={classNames(
                                      active
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700',
                                      'flex w-full items-center gap-1 px-4 py-2 text-sm'
                                    )}
                                    onClick={() => setDeletePost(post._id)}
                                  >
                                    <MdOutlineDelete className="h-5 w-5" />
                                    Delete
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  )}
                </div>

                <PostContent content={post.content} onClick={() => {}} />

                <PostImageList
                  key={post._id}
                  images={post?.images ?? []}
                  axiosAuth={axiosAuth}
                  accessToken={session?.user?.accessToken}
                />

                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    {(post.likes ?? []).length == 1 &&
                    (post.likes ?? []).some(
                      (id) => session?.user.user._id === id
                    )
                      ? `Liked by you`
                      : (post.likes ?? []).length > 1 &&
                          (post.likes ?? []).some(
                            (id) => id == session?.user.user._id
                          )
                        ? `like by you ${(post.likes.length - 1) > 1 ? `${post.likes.length - 1} others` : `${post.likes.length - 1} other`}`
                        : (post.likes ?? []).length > 1
                          ? `${(post.likes ?? []).length} likes`
                          : `${(post.likes ?? []).length} like`}
                  </span>
                  <span>
                    {(post.comments ?? []).length}
                    {(post.comments ?? []).length > 1
                      ? ' comments'
                      : ' comment'}
                  </span>
                </div>

                <CustomHr size="small" />

                <div className="flex gap-8">
                  <div
                    onClick={() => {
                      likeMutation.mutate({
                        axiosAuth: axiosAuth,
                        postId: post._id,
                      });
                    }}
                  >
                    {(post.likes ?? []).some(
                      (id) => session?.user.user._id === id
                    ) ? (
                      <>
                        <div className="group relative">
                          <div className="group flex cursor-pointer items-center gap-1">
                            <svg
                              width="30"
                              height="30"
                              viewBox="0 0 30 30"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18.7245 2.55512C17.526 1.29962 15.5865 1.97462 15.078 3.44012C14.658 4.64912 14.112 6.09812 13.581 7.16462C11.991 10.3536 11.064 12.1671 8.50498 14.4381C8.12991 14.7539 7.70314 15.0025 7.24348 15.1731C5.54848 15.8421 3.95848 17.5971 4.37398 19.6806L4.90348 22.3281C5.04 23.0112 5.36408 23.6427 5.83938 24.1519C6.31469 24.6612 6.92243 25.0279 7.59448 25.2111L15.9945 27.5016C16.8969 27.7474 17.8407 27.803 18.7657 27.6648C19.6908 27.5266 20.5771 27.1976 21.3683 26.6987C22.1595 26.1999 22.8384 25.5421 23.3619 24.7669C23.8855 23.9918 24.2422 23.1164 24.4095 22.1961L25.437 16.5546C25.555 15.906 25.529 15.2395 25.361 14.602C25.1929 13.9646 24.8869 13.3718 24.4645 12.8657C24.0421 12.3596 23.5136 11.9525 22.9165 11.6731C22.3194 11.3938 21.6682 11.249 21.009 11.2491H19.6845L19.6995 11.1711C19.8195 10.5576 19.9635 9.71612 20.0595 8.79662C20.157 7.88162 20.2095 6.86912 20.133 5.92712C20.058 5.00312 19.857 4.05362 19.377 3.33212C19.1809 3.05583 18.9627 2.79597 18.7245 2.55512Z"
                                fill="#616161"
                              />
                            </svg>

                            <h1 className={`text-base text-[#6990FF]`}>
                              Liked
                            </h1>
                          </div>
                          <div className="absolute left-20 top-8 w-28 -translate-x-1/2 rounded-md bg-[#616161] px-2 py-1 text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            UnLike Post
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="group relative">
                          <div className="group flex cursor-pointer items-center gap-1">
                            <svg
                              width="30"
                              height="30"
                              viewBox="0 0 30 30"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M15.0657 3.60596C15.4595 2.63096 16.5563 1.58096 17.9645 1.97284C19.0707 2.28034 19.7888 2.94784 20.2013 3.84034C20.5838 4.67096 20.6776 5.64971 20.6963 6.58158C20.7151 7.58471 20.5051 8.78658 20.2595 9.84033C20.1498 10.306 20.0279 10.7686 19.8938 11.2278H22.4907C23.0733 11.2279 23.648 11.3637 24.169 11.6245C24.69 11.8853 25.1431 12.2639 25.4923 12.7303C25.8415 13.1967 26.0772 13.738 26.1808 14.3114C26.2843 14.8848 26.2528 15.4744 26.0888 16.0335L23.5313 24.7447C23.3559 25.3425 23.063 25.8993 22.6698 26.3826C22.2767 26.8659 21.7911 27.266 21.2416 27.5594C20.692 27.8529 20.0895 28.0338 19.4691 28.0917C18.8488 28.1496 18.2232 28.0833 17.6288 27.8966L7.58633 24.7428C7.04304 24.5722 6.54575 24.28 6.13218 23.8886C5.71862 23.4971 5.39964 23.0166 5.19945 22.4835L4.22445 19.8885C3.91416 19.0626 3.90499 18.1538 4.19854 17.3218C4.4921 16.4898 5.06958 15.788 5.82945 15.3397L9.33945 13.2697C9.69315 12.99 10.0213 12.6794 10.3201 12.3416C10.9651 11.6122 11.852 10.3991 12.7426 8.50721C13.127 7.68971 13.4495 7.04658 13.742 6.46346C14.2163 5.52033 14.6138 4.73096 15.0657 3.60596ZM10.3482 14.8503C10.3377 14.8568 10.3271 14.863 10.3163 14.8691L6.78195 16.9541C6.40202 17.1782 6.11327 17.5291 5.9665 17.9451C5.81972 18.3611 5.82431 18.8155 5.97945 19.2285L6.95445 21.8235C7.05452 22.0903 7.2141 22.3308 7.42106 22.5267C7.62802 22.7226 7.87691 22.8688 8.14883 22.9541L18.1876 26.1078C18.5443 26.2202 18.9198 26.2603 19.2922 26.2259C19.6646 26.1914 20.0263 26.0829 20.3563 25.907C20.6863 25.731 20.9779 25.4909 21.214 25.2009C21.4501 24.9109 21.6259 24.5767 21.7313 24.2178L24.287 15.5066C24.3692 15.2269 24.385 14.9319 24.3333 14.645C24.2815 14.3582 24.1636 14.0873 23.9889 13.854C23.8142 13.6206 23.5874 13.4312 23.3267 13.3009C23.066 13.1705 22.7785 13.1027 22.487 13.1028H18.6132C18.4632 13.1027 18.3154 13.0667 18.1823 12.9976C18.0491 12.9286 17.9344 12.8286 17.8479 12.7061C17.7614 12.5836 17.7055 12.4421 17.685 12.2935C17.6645 12.1449 17.68 11.9936 17.7301 11.8522C17.9176 11.3235 18.2026 10.4066 18.4351 9.41096C18.6713 8.40221 18.8382 7.38221 18.8232 6.61721C18.8045 5.73971 18.7126 5.08721 18.4988 4.62596C18.3151 4.22283 18.0282 3.93596 17.4638 3.77846C17.3832 3.75596 17.2876 3.76346 17.1638 3.84408C17.0023 3.95943 16.8784 4.11988 16.8076 4.30533C16.3757 5.358 15.8971 6.3909 15.3732 7.40096C15.0826 7.98033 14.777 8.58971 14.4413 9.30408C13.4776 11.3553 12.4913 12.7203 11.7226 13.5847C11.3401 14.016 11.0138 14.3216 10.7738 14.526C10.6519 14.6296 10.5256 14.7278 10.3951 14.8203L10.3651 14.8391L10.3557 14.8466L10.3482 14.8503Z"
                                fill="#616161"
                              />
                            </svg>

                            <h1 className={`text-base`}>Like</h1>
                          </div>
                          <div className="absolute left-20 top-8 w-24 -translate-x-1/2 rounded-md bg-[#616161] px-2 py-1 text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            Like Post
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div
                    className="flex cursor-pointer items-center gap-1"
                    onClick={() => {
                      if (selectedPost) {
                        if (selectedPost?._id === post?._id) {
                          SetSelectedPost(null);
                        } else {
                          SetSelectedPost(post);
                        }
                      } else {
                        SetSelectedPost(post);
                      }
                    }}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule={'evenodd'}
                        clipRule={'evenodd'}
                        d="M5.73994 19.13C2.92994 12.2337 8.00369 4.6875 15.4499 4.6875H15.8512C17.1756 4.6875 18.487 4.94836 19.7106 5.45518C20.9341 5.96199 22.0459 6.70485 22.9824 7.64133C23.9188 8.57781 24.6617 9.68957 25.1685 10.9131C25.6753 12.1367 25.9362 13.4481 25.9362 14.7725C25.9362 17.7502 24.7533 20.606 22.6477 22.7115C20.5422 24.8171 17.6864 26 14.7087 26H4.93369C4.73947 26.0002 4.54999 25.94 4.39143 25.8278C4.23287 25.7157 4.11306 25.557 4.04856 25.3738C3.98407 25.1906 3.97806 24.9919 4.03138 24.8051C4.08469 24.6184 4.1947 24.4528 4.34619 24.3312L6.80994 22.3525C6.86262 22.3103 6.90022 22.2522 6.91712 22.1868C6.93402 22.1215 6.92931 22.0524 6.90369 21.99L5.73994 19.13ZM15.4499 6.5625C9.33369 6.5625 5.16744 12.7587 7.47494 18.4225L8.63994 21.2838C8.81745 21.7199 8.84946 22.2017 8.73123 22.6575C8.61299 23.1134 8.35082 23.5189 7.98369 23.8138L7.59744 24.125H14.7087C17.1891 24.125 19.568 23.1396 21.3219 21.3857C23.0758 19.6318 24.0612 17.2529 24.0612 14.7725C24.0612 12.5951 23.1962 10.5068 21.6565 8.96715C20.1169 7.42748 18.0286 6.5625 15.8512 6.5625H15.4499Z"
                        fill="#616161"
                      />
                    </svg>
                    <h1>Comment</h1>
                  </div>
                </div>
              </div>
              {selectedPost?._id == post._id && (
                <div className="w-full">
                  <CustomHr size="small" />
                  <CommentSection post={post} key={post._id} />
                </div>
              )}
            </div>
          );
        })}
        {/*delete post dialog*/}
        <Dialog
          open={deletedPost != undefined}
          onClose={() => setDeletePost(undefined)}
          className="relative z-50"
        >
          <div className="fixed inset-0 flex w-screen items-center justify-center bg-gray-800/50 p-4">
            <Dialog.Panel className="w-[96%] rounded-2xl border bg-white sm:w-11/12 md:w-[456px]">
              <div className="flex min-h-[120px] items-start justify-between px-6 py-4 lg:py-6">
                <div>
                  <Dialog.Title className="text-base font-semibold sm:text-[20px]">
                    Delete Post
                  </Dialog.Title>

                  <p className="text-xs text-gray-600 sm:text-sm">
                    Are you sure you want to delete this post?
                  </p>
                </div>

                <button
                  className="rounded-md p-1 hover:bg-gray-100"
                  onClick={() => setDeletePost(undefined)}
                >
                  <X />
                </button>
              </div>

              <CustomHr />

              <div className="flex justify-end gap-3 px-6 py-3 font-medium">
                <button
                  className="h-9 w-20 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-10 sm:w-24 sm:text-base"
                  onClick={() => {
                    setDeletePost(undefined);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="h-9 w-20 rounded-lg bg-red-500 text-sm text-white hover:bg-red-600/80 sm:h-10 sm:w-24 sm:text-base"
                  onClick={() => {
                    deleteMutation.mutate({
                      axiosAuth,
                      postId: deletedPost ?? '',
                    });
                  }}
                >
                  {deleteMutation.isLoading ? <Loader /> : 'Delete'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    );
  }
  return <></>;
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
