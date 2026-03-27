import {
  deleteteJSAComment,
  JSAComment,
  JSACommentList,
  toggleJSALikedComment,
} from '@/app/(main)/(user-panel)/user/apps/api';

import { formatTimeDifference } from '@/app/(main)/(user-panel)/user/chats/api';
import { getPresignedFileUrl } from '@/app/(main)/(user-panel)/user/file/api';
import Loader from '@/components/DottedLoader/loader';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { Menu, Transition } from '@headlessui/react';
import { Avatar } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { Fragment, useEffect, useState } from 'react';
import { HiDotsVertical } from 'react-icons/hi';

import { useMutation, useQuery, useQueryClient } from 'react-query';

import CreateCommentModel from './Model/Comment_Model';
import CustomInfoModal from '../CustomDeleteModel';

function CommentAvatar({
  photo,
  size = 'sm',
}: {
  photo?: string;
  size?: 'sm' | 'md';
}) {
  const src = usePresignedUserPhoto(photo);
  return (
    <Avatar
      as="button"
      className="h-[56px] w-[56px] rounded-full border transition-transform"
      color="secondary"
      name="name"
      size={size}
      src={src}
    />
  );
}

/** Renders a comment attachment via presigned URL (S3 key or full S3 URL — same as other app views). */
function PresignedCommentImage({
  url,
  alt,
  className,
}: {
  url: string;
  alt: string;
  className?: string;
}) {
  const trimmed = url?.trim();
  const src = usePresignedUserPhoto(trimmed ?? '');
  if (!trimmed) return null;
  return <img src={src} alt={alt} className={className} />;
}

const LIGHTBOX_FRAME =
  'flex w-[min(90vw,960px)] h-[min(85vh,720px)] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-lg';

/** Full-size lightbox image: fixed white frame + loader while presigned URL is fetched. */
function LightboxPresignedImage({
  url,
  alt,
}: {
  url: string;
  alt: string;
}) {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const raw = url?.trim() ?? '';
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!raw) {
      setResolvedUrl(null);
      setIsLoading(false);
      return;
    }
    if (!accessToken?.trim()) {
      setResolvedUrl(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setResolvedUrl(null);

    getPresignedFileUrl(axiosAuth, raw, accessToken).then((presigned) => {
      if (cancelled) return;
      setResolvedUrl(presigned);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [raw, accessToken, axiosAuth]);

  if (!raw) return null;

  return (
    <div className={LIGHTBOX_FRAME}>
      {isLoading ? (
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <Loader />
          <p className="text-sm font-medium text-gray-600">Loading image…</p>
        </div>
      ) : resolvedUrl ? (
        <img
          src={resolvedUrl}
          alt={alt}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <p className="px-6 text-center text-sm text-gray-500">
          Could not load this image.
        </p>
      )}
    </div>
  );
}

export function ModuleCommentSection({
  appId,
  moduleId,
  isReadOnly = false,
}: {
  appId?: string;
  moduleId?: string;
  isReadOnly?: boolean;
}) {
  const session = useSession();
  const [showCommentModel, setComment] = useState(false);
  const axiosAuth = useAxiosAuth();
  const accessToken = session?.data?.user?.accessToken;
  const [selectedComment, setEditComment] = useState<JSAComment | undefined>();
  const [selectedDeleteCommet, setDeleteComment] = useState<
    JSAComment | undefined
  >(undefined);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeCommentImages, setActiveCommentImages] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: `comment${moduleId}`,
    queryFn: () => JSACommentList(moduleId!, axiosAuth),
  });
  const deleteCommentMutation = useMutation(deleteteJSAComment, {
    onSuccess: () => {
      setDeleteComment(undefined);
      queryClient.invalidateQueries(`comment${moduleId}`);
    },
  });

  const likeMutation = useMutation(toggleJSALikedComment, {
    onSuccess: () => {
      queryClient.invalidateQueries(`comment${moduleId}`);
    },
  });
  if (isLoading) {
    return <Loader />;
  }
  return (
    <>
      <div className="h-full overflow-auto scrollbar-hide">
        <div className="flex w-full flex-col px-4">
          <div
            className="rounded-lg border-1 border-[#EEEEEE] bg-white px-8 py-5 shadow"
            // style={{ boxShadow: "0px 2px 8px 0px #00000033" }}
          >
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <CommentAvatar photo={session?.data?.user?.user?.photo} />
              </div>
              <div
                className="mt-[6px] w-full cursor-pointer rounded-2xl border border-[#9E9E9E] bg-white px-4 py-3 font-semibold hover:bg-gray-50"
                onClick={() => {
                  setComment(true);
                  setEditComment(undefined);
                }}
              >
                <h3 className="ml-2 text-sm font-normal text-gray-500 lg:text-[16px]">
                  New Comment
                </h3>
              </div>
            </div>
          </div>
        </div>
        {(data ?? []).map((comment, index) => {
          return (
            <div
              key={index}
              className="mx-4 my-4 flex cursor-pointer flex-wrap items-center justify-between rounded-lg border border-[#EEEEEE] pr-2 shadow"
            >
              <div className="m-4 w-full">
                <div className="flex w-full items-center">
                  <CommentAvatar photo={comment.user.photo} size="md" />
                  <span className="mx-2 flex flex-col">
                    <span className="font-bold">{`${comment.user.firstName} ${comment.user.lastName}`}</span>
                    <span className="text-sm text-gray-600">
                      {comment.user.organization?.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatTimeDifference(new Date(comment.createdAt))}
                    </span>
                  </span>
                  {comment.user._id === session.data?.user.user._id && (
                    <Menu
                      as="div"
                      className="relative ml-auto inline-block text-left"
                    >
                      <div className="py-1"></div>
                      <div>
                        <Menu.Button>
                          <HiDotsVertical className="h-4 w-4" />
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
                          <div>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={classNames(
                                    active
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700',
                                    'flex w-full items-center px-4 py-2 text-sm'
                                  )}
                                  onClick={() => {
                                    setComment(true);
                                    setEditComment(comment);
                                  }}
                                >
                                  Edit
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={classNames(
                                    active
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700',
                                    'flex w-full items-center px-4 py-2 text-sm'
                                  )}
                                  onClick={() => {
                                    setDeleteComment(comment);
                                  }}
                                >
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </div>
                <div className="my-3">
                  <span>{comment.content}</span>
                  {(comment.images ?? []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {comment.images.map((image, imageIndex) => (
                        <button
                          key={imageIndex}
                          type="button"
                          className="cursor-pointer"
                          onClick={() => {
                            setActiveImageIndex(imageIndex);
                            setActiveCommentImages(comment.images ?? []);
                            setIsLightboxOpen(true);
                          }}
                        >
                          <PresignedCommentImage
                            url={image}
                            alt={`comment-image-${imageIndex}`}
                            className="h-20 w-20 rounded-md object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex justify-start text-sm text-gray-500">
                    <h1>
                      {comment.likedBy.length > 0
                        ? `Liked by ${comment.likedBy.length}`
                        : ''}
                    </h1>
                  </div>
                </div>
                <div className="w-full border-t-[1px] border-gray-300">
                  <div
                    onClick={() => {
                      likeMutation.mutate({
                        axiosAuth: axiosAuth,
                        id: comment._id,
                      });
                    }}
                  >
                    {comment.likedBy.some(
                      (user) => user._id === session.data?.user.user._id!
                    ) ? (
                      <div className="group relative mt-2">
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

                          <h1 className={`text-base text-[#6990FF]`}>Liked</h1>
                        </div>
                        <div className="absolute left-20 top-8 w-28 -translate-x-1/2 rounded-md bg-[#616161] px-2 py-1 text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          UnLike Post
                        </div>
                      </div>
                    ) : (
                      <div className="group relative mt-2">
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCommentModel && (
        <CreateCommentModel
          handleClose={() => {
            setComment(false);
            setEditComment(undefined);
          }}
          moduleId={moduleId!}
          appId={appId!}
          selectedComment={selectedComment}
        />
      )}
      {selectedDeleteCommet && (
        <CustomInfoModal
          title={'Delete Comment'}
          handleClose={() => {
            setDeleteComment(undefined);
          }}
          onDeleteButton={() => {
            deleteCommentMutation.mutate({
              axiosAuth,
              id: selectedDeleteCommet?._id!,
            });
          }}
          doneValue={deleteCommentMutation.isLoading ? <Loader /> : 'Delete'}
          subtitle={
            'Are you sure you want to delete this comment? This action cannot be undone.'
          }
        />
      )}

      {/* Lightbox for comment images */}
      {isLightboxOpen && activeCommentImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-[95vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white hover:bg-black/80"
              onClick={() => setIsLightboxOpen(false)}
            >
              ✕
            </button>
            
            {/* Previous button */}
            {activeCommentImages.length > 1 && (
              <button
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) =>
                    prev === 0 ? activeCommentImages.length - 1 : prev - 1
                  );
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* Next button */}
            {activeCommentImages.length > 1 && (
              <button
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) =>
                    prev === activeCommentImages.length - 1 ? 0 : prev + 1
                  );
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            <LightboxPresignedImage
              url={activeCommentImages[activeImageIndex] ?? ''}
              alt={`comment-image-${activeImageIndex}`}
            />

            {/* Image counter */}
            {activeCommentImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white">
                {activeImageIndex + 1} / {activeCommentImages.length}
              </div>
            )}

            {/* Navigation dots */}
            {activeCommentImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-2">
                {activeCommentImages.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === activeImageIndex
                        ? 'bg-white'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(index);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
