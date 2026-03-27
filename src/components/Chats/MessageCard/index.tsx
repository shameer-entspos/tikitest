'use client';
/* eslint-disable @next/next/no-img-element */

import { Message } from '@/app/(main)/(user-panel)/user/chats/api';
import { getPresignedFileUrl } from '@/app/(main)/(user-panel)/user/file/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { chatSocket } from '@/app/helpers/user/socket.helper';
import { classNames } from '@/components/Feeds/Post';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useAttachmentDownloader } from '@/hooks/useAttachmentDownloader';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { Menu, Transition } from '@headlessui/react';
import { useSession } from 'next-auth/react';
import React, { Fragment, useCallback, useState } from 'react';
import { BiSave } from 'react-icons/bi';
import { Loader2 } from 'lucide-react';
import { MdOutlineDelete } from 'react-icons/md';
import { MdFileDownload } from 'react-icons/md';
import FileCard from './FileCard';
import { ShowMentionText } from './ShowMentionText';

declare global {
  interface Window {
    handleUserClick: (userId: string) => void;
  }
}

/** Photo/Video: 220×250px dark blur card + center badge (icon + file size). Click → view on same card. */
function MediaPlaceholderCard({
  onView,
  isFetching,
  fileSizeLabel = '—',
}: {
  onView: () => void;
  isFetching: boolean;
  fileSizeLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onView}
      disabled={isFetching}
      className="relative flex h-[250px] w-[220px] flex-shrink-0 items-center justify-center overflow-hidden rounded-lg focus:outline-none disabled:opacity-70"
      aria-label="View media"
    >
      {/* Dark blurred background */}
      <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-md" />
      <div className="absolute inset-0 bg-teal-950/20" />
      {/* Center: when fetching show Loader2 spinner; else icon + file size */}
      <div className="relative z-10 flex items-center gap-2 rounded-full bg-gray-700 px-4 py-2.5 shadow-lg">
        {isFetching ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" aria-hidden />
        ) : (
          <>
            <MdFileDownload className="h-5 w-5 text-white" aria-hidden />
            <span className="text-sm font-medium text-white">{fileSizeLabel}</span>
          </>
        )}
      </div>
    </button>
  );
}

/** Placeholder + Play + Download for audio only. */
function AttachmentPlaceholder({
  type,
  onView,
  onDownload,
  onViewLabel = 'Play',
  isFetching,
}: {
  type: 'video' | 'audio';
  onView: () => void;
  onDownload: () => void;
  onViewLabel?: string;
  isFetching?: boolean;
}) {
  const labels = { video: 'Video', audio: 'Audio' };
  const icons = { video: '▶️', audio: '🎵' };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200 text-3xl">
        {icons[type]}
      </div>
      <p className="text-xs text-gray-500">{labels[type]}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onView}
          disabled={isFetching}
          className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isFetching ? 'Loading...' : onViewLabel}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={isFetching}
          className="flex items-center gap-1 rounded border border-gray-400 bg-white px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
        >
          <MdFileDownload className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  );
}

function MessageCard({
  message,
  isSender,
  messageClass,
  whereToCome,
}: {
  message: Message;
  isSender: boolean;
  messageClass: any;
  whereToCome: 'direct' | 'team' | 'project';
}) {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const { downloadAttachment } = useAttachmentDownloader();
  const context = useChatCotnext();
  const senderPhotoDisplay = usePresignedUserPhoto(message.sender?.photo);
  const sessionPhotoDisplay = usePresignedUserPhoto(session?.user?.user?.photo);
  const rawMediaUrl = message.media?.url;
  const accessToken = session?.user?.accessToken;

  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const mediaSize = (message.media as { size?: number } | undefined)?.size;
  const fileSizeLabel =
    typeof mediaSize === 'number' ? `${Math.round(mediaSize / 1024)} kB` : '—';

  const fetchAndSetUrl = useCallback(() => {
    if (!rawMediaUrl?.trim() || !accessToken?.trim()) return;
    setFetchingUrl(true);
    getPresignedFileUrl(axiosAuth, rawMediaUrl, accessToken)
      .then((url) => {
        if (url) setViewUrl(url);
      })
      .finally(() => setFetchingUrl(false));
  }, [rawMediaUrl, accessToken, axiosAuth]);

  return (
    <>
      <div className={`flex w-full min-w-0 ${messageClass}`}>
        {!isSender && (
          <img
            src={senderPhotoDisplay}
            alt={`image `}
            className="mr-2 h-[40px] w-[40px] flex-shrink-0 rounded-full object-cover"
          />
        )}
        <div
          className={`min-w-0 max-w-full rounded-lg p-4 ${
            context.state.filteredMessageIds?.includes(message._id) &&
            `shadow-md shadow-primary-400`
          } ${
            isSender ? 'items-end bg-[#E2F3FF]' : 'items-start bg-[#E0E0E0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`mr-3 text-sm font-semibold text-blue-gray-700`}>
                {isSender ? (
                  <>You</>
                ) : (
                  <>{`${message.sender.firstName} ${message.sender.lastName}`}</>
                )}
              </span>

              <div className={`flex justify-end`}>
                <h1
                  className={`text-xs font-thin ${
                    isSender ? 'text-gray-900' : 'text-gray-900'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true, // Use 12-hour format
                  })}
                </h1>
              </div>
            </div>

            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button>
                  <svg
                    width="12px"
                    height="12px"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#000000"
                    className="bi bi-three-dots-vertical"
                  >
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
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
                  className={`absolute ${
                    isSender ? `right-0 top-5` : `left-5 right-0 top-0`
                  } z-10 mt-2 w-56 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
                >
                  <div className="py-1">
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
                            if (whereToCome === 'direct') {
                              chatSocket.emit('deleteMessage', {
                                roomId: message.roomId,
                                userId: (context.state.roomDetail as any)
                                  .senderId,
                                messageId: message._id,
                              });
                            }
                            if (whereToCome === 'team') {
                              chatSocket.emit('deleteTeamMessage', {
                                roomId: message.roomId,
                                userId: (context.state.roomDetail as any)
                                  .senderId,
                                messageId: message._id,
                              });
                            }
                            if (whereToCome === 'project') {
                              chatSocket.emit('deleteProjectMessage', {
                                roomId: message.roomId,
                                userId: (context.state.roomDetail as any)
                                  .senderId,
                                messageId: message._id,
                              });
                            }
                          }}
                        >
                          <MdOutlineDelete className="h-6 w-8" />
                          Delete Message
                        </button>
                      )}
                    </Menu.Item>
                    {message.mimetype === 'image' && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() =>
                              downloadAttachment(
                                message.media?.url,
                                message.media?.name || 'image.png'
                              )
                            }
                            className={classNames(
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700',
                              'flex w-full cursor-pointer items-center px-4 py-2 text-sm'
                            )}
                          >
                            <BiSave className="h-6 w-8" />
                            Save Image
                          </button>
                        )}
                      </Menu.Item>
                    )}
                    {message.mimetype === 'video' && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() =>
                              downloadAttachment(
                                message.media?.url,
                                message.media?.name || 'video.mp4'
                              )
                            }
                            className={classNames(
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700',
                              'flex w-full cursor-pointer items-center px-4 py-2 text-sm'
                            )}
                          >
                            <BiSave className="h-6 w-8" />
                            Save Video
                          </button>
                        )}
                      </Menu.Item>
                    )}
                    {message.mimetype === 'audio' && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() =>
                              downloadAttachment(
                                message.media?.url,
                                message.media?.name || 'audio.mp3'
                              )
                            }
                            className={classNames(
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700',
                              'flex w-full cursor-pointer items-center px-4 py-2 text-sm'
                            )}
                          >
                            <BiSave className="h-6 w-8" />
                            Save Audio
                          </button>
                        )}
                      </Menu.Item>
                    )}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Video: placeholder + Play → fetch URL then show video */}
          {/* Video: 220×250 dark blur card → click to fetch and show video on same card */}
          {message.mimetype === 'video' && (
            <>
              {viewUrl ? (
                <video
                  controls
                  className="h-[250px] w-[220px] flex-shrink-0 rounded-lg object-contain"
                >
                  <source src={viewUrl} type="video/mp4" />
                </video>
              ) : (
                <MediaPlaceholderCard
                  onView={fetchAndSetUrl}
                  isFetching={fetchingUrl}
                  fileSizeLabel={fileSizeLabel}
                />
              )}
              <div className="mr-5 mt-1 break-words text-sm text-gray-800">
                <ShowMentionText text={message.message} isClickable={true} />
              </div>
            </>
          )}

          {/* Image: 220×250 dark blur card → click to fetch and show image on same card. Save = dropdown only. */}
          {message.mimetype === 'image' && (
            <>
              {viewUrl ? (
                <img
                  src={viewUrl}
                  alt="message media"
                  className="h-[250px] w-[220px] flex-shrink-0 rounded-lg object-cover pr-2"
                />
              ) : (
                <MediaPlaceholderCard
                  onView={fetchAndSetUrl}
                  isFetching={fetchingUrl}
                  fileSizeLabel={fileSizeLabel}
                />
              )}
              <div className="mr-5 mt-1 break-words text-sm text-gray-800">
                <ShowMentionText text={message.message} isClickable={true} />
              </div>
            </>
          )}

          {/* Audio: placeholder + Play → fetch URL then show audio */}
          {message.mimetype === 'audio' && (
            <>
              {viewUrl ? (
                <audio controls>
                  <source src={viewUrl} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <AttachmentPlaceholder
                  type="audio"
                  onViewLabel="Play"
                  onView={fetchAndSetUrl}
                  onDownload={() =>
                    downloadAttachment(
                      message.media?.url,
                      message.media?.name || 'audio.mp3'
                    )
                  }
                  isFetching={fetchingUrl}
                />
              )}
              <div className="mr-5 mt-1 break-words text-sm text-gray-800">
                <ShowMentionText
                  text={message.message ?? ''}
                  isClickable={true}
                />
              </div>
            </>
          )}

          {/* File: no auto-fetch, FileCard has Download that refetches on click */}
          {message.mimetype === 'file' && <FileCard message={message} />}
          {/* {isPopupOpen && (
            <ImagePopup
              imageUrl={message.media!}
              // onClose={handleClosePopup}
            />
          )} */}
          {/* // only text */}

          {message.mimetype === 'text' && (
            <div className="mr-5 break-words text-sm text-gray-800">
              <ShowMentionText text={message.message} isClickable={true} />
            </div>
          )}
        </div>
        {isSender && (
          <img
            src={sessionPhotoDisplay}
            alt={`image `}
            className="ml-2 h-[40px] w-[40px] rounded-full object-cover"
          />
        )}
      </div>
    </>
  );
}

export default MessageCard;
