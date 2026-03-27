/* eslint-disable @next/next/no-img-element */
'use client';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  MentionsInput,
  Mention,
  OnChangeHandlerFunc,
  SuggestionDataItem,
} from 'react-mentions';

import './textstyle.css';
import { IoAttach, IoMic } from 'react-icons/io5';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket } from '@/app/helpers/user/socket.helper';
import { Menu, Transition } from '@headlessui/react';
import { classNames } from '../Feeds/Post';
import { BiPhotoAlbum } from 'react-icons/bi';
import { uploadMedia } from '@/app/(main)/(user-panel)/user/chats/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { MdDelete } from 'react-icons/md';

export default function AppTextArea({
  handleSendMessage,
  whereToCome,
  bgColor = '#ffffff',
}: {
  handleSendMessage: () => void;
  whereToCome: 'direct' | 'team' | 'project';
  bgColor?: String;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const context = useChatCotnext();

  const [isRecording, setIsRecording] = useState(false);
  const axiosAuth = useAxiosAuth();
  const handleChange: OnChangeHandlerFunc = (event: {
    target: { value: string };
  }) => {
    const { value } = event.target;
    context.dispatch({
      type: CHATTYPE.CHAT,
      messageController: value,
    });
  };

  const users = useMemo(() => {
    return context.state.mentionUsers;
  }, [context.state.mentionUsers]);

  const renderUserSuggestion = useCallback(
    (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focused: boolean
    ) => {
      if (users) {
        const user = users[index];
        if (!user) {
          return suggestion.display;
        }
        return (
          <div className="my-suggestion__wrapper">
            <img
              className="my-suggestion__photo"
              src={`/images/user.png`}
              alt=""
            />
            <div className="my-suggestion__name">{suggestion.display}</div>
          </div>
        );
      } else {
        return (
          <div className="my-suggestion__wrapper">
            <img
              className="my-suggestion__photo"
              src={`/images/user.png`}
              alt=""
            />
            <div className="my-suggestion__name">No user</div>
          </div>
        );
      }
    },
    [users]
  );

  const usersToDisplay = useMemo(() => {
    return (users ?? []).map((user) => ({
      id: user._id,
      display: [user.firstName, user.lastName].filter(Boolean).join(' '),
    }));
  }, [users]);

  const displayTransformHandler = useCallback(
    (id: string, display: string) => {
      const user = (users ?? []).find((item) => item._id === id);
      return `@${user?.firstName || display}`;
    },
    [users]
  );

  //   const dataForApi = useMemo(() => {
  //     return prepareStringForSend(context.state.messageController ?? "", users);
  //   }, [context.state.messageController, users]);
  const inputButtonRef = useRef<HTMLInputElement | null>(null);
  const handleFileSelect = () => {
    if (inputButtonRef.current) {
      inputButtonRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileSize = selectedFiles[0]?.size || 0; // Handle the case where files[0] might be undefined
      const fileSizeInMB = fileSize / (1024 * 1024);

      if (fileSizeInMB > 1) {
        alert('File size should be under 1 MB');
        return;
      }
      uploadAndSendMessage(selectedFiles[0]);
    }
  };

  const uploadAndSendMessage = async (file: File) => {
    if (file) {
      const data = await uploadMedia({ axiosAuth, file: file });
      if (data != null) {
        if (data.media != null) {
          if (
            whereToCome === 'direct' &&
            context.state.roomDetail?._id &&
            (context.state.roomDetail as any).senderId
          ) {
            chatSocket.emit(
              'sendPrivateMessage',
              context.state.roomDetail._id,
              (context.state.roomDetail as any).senderId,
              '',
              'direct',
              (context.state.roomDetail as any).participants[0]?._id,
              data.media[0].mimetype,
              {
                name: data.media[0].name,
                url: data.media[0].file,
                mimetype: data.media[0].mimetype,
              }
            );
          }
          if (
            whereToCome === 'team' &&
            context.state.roomDetail?._id &&
            (context.state.roomDetail as any).senderId
          ) {
            chatSocket.emit(
              'privateTeamMessage',
              context.state.roomDetail._id,
              (context.state.roomDetail as any).senderId,
              '',
              'team',
              data.media[0].mimetype,
              {
                name: data.media[0].name,
                url: data.media[0].file,
                mimetype: data.media[0].mimetype,
              }
            );
          }
          if (
            whereToCome === 'project' &&
            context.state.roomDetail?._id &&
            (context.state.roomDetail as any).senderId
          ) {
            chatSocket.emit(
              'privateProjectMessage',
              context.state.roomDetail._id,
              (context.state.roomDetail as any).senderId,
              '',
              'project',
              data.media[0].mimetype,
              {
                name: data.media[0].name,
                url: data.media[0].file,
                mimetype: data.media[0].mimetype,
              }
            );
          }
        }
      } else {
        console.log(data);
      }
    }
  };

  const recorderControls = useAudioRecorder();

  useEffect(() => {
    if (context.state.recorderStop) {
      setIsRecording(false);

      recorderControls.stopRecording();
      context.dispatch({ type: CHATTYPE.RECORDERSTOP });
    }
  }, [context, recorderControls]);
  ///////////////////////////////
  const addAudioElement = (blob: Blob) => {
    if (blob) {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);

      console.log(blob.size);
      const url = URL.createObjectURL(blob);

      const file = new File([blob], `audio_${timestamp}_${randomId}.mp3`, {
        type: 'audio/mp3',
      });

      if (file != null && isRecording) {
        setIsRecording(false);
        uploadAndSendMessage(file);

        context.dispatch({ type: CHATTYPE.MICTAP });
      }
    }
    // const audio = document.createElement("audio");
    // audio.src = url;
    // audio.controls = true;
    // document.body.appendChild(audio);
  };
  return (
    <div className={`flex items-center justify-center p-3 bg-[${bgColor}]`}>
      {context.state.micTap ? (
        <div className="w-full">
          <AudioRecorder
            onRecordingComplete={(blob) => addAudioElement(blob)}
            recorderControls={recorderControls}
            classes={{
              AudioRecorderStartSaveClass: 'hidden',
              AudioRecorderDiscardClass: 'hidden',
            }}
            audioTrackConstraints={{
              noiseSuppression: true,
              echoCancellation: true,
            }}
            // onNotAllowedOrFound={(err) => console.table(err)}
            showVisualizer={true}
            // // downloadOnSavePress
            downloadFileExtension="mp3"
          />
        </div>
      ) : (
        <div className="w-full">
          <MentionsInput
            onKeyDown={(v) => {
              if (v.code === 'Enter' || v.code === 'NumpadEnter') {
                v.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Write message here ..."
            allowSuggestionsAboveCursor
            value={context.state.messageController ?? ''}
            onChange={handleChange}
            inputRef={inputRef}
            style={{
              control: {
                backgroundColor: `${bgColor}`,
                fontSize: 14,
                fontWeight: 'normal',
              },

              '&multiLine': {
                control: {
                  minHeight: 63,
                },

                highlighter: {
                  padding: 9,
                  border: '1px solid transparent',
                  maxHeight: 63,
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                },
                input: {
                  padding: 9,
                  border: 'none',
                  maxHeight: 63,
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  outline: 'none',
                },
              },

              '&singleLine': {
                display: 'inline-block',
                width: 180,

                highlighter: {
                  padding: 1,
                  border: '2px inset transparent',
                  whiteSpace: 'pre-wrap',
                },
                input: {
                  padding: 1,
                  border: '2px inset',
                  outline: 'none',
                  whiteSpace: 'pre-wrap',
                },
              },

              suggestions: {
                list: {
                  backgroundColor: 'white',
                  border: '1px solid rgba(0,0,0,0.15)',
                  fontSize: 14,
                },
                item: {
                  padding: '5px 15px',
                  borderBottom: '1px solid rgba(0,0,0,0.15)',
                  '&focused': {
                    backgroundColor: '#cee4e5',
                  },
                },
              },
            }}
            className="no-outline"
          >
            <Mention
              trigger="@"
              appendSpaceOnAdd
              data={usersToDisplay}
              renderSuggestion={renderUserSuggestion}
              style={{
                backgroundColor: '#cee4e5',
              }}
              displayTransform={displayTransformHandler}
            />
          </MentionsInput>
        </div>
      )}

      {/* /// audio */}

      {/* ///////////////////////////////// */}

      <input
        type="file"
        // accept="image/*"
        accept="*"
        onChange={handleFileChange}
        className="hidden"
        ref={inputButtonRef}
        multiple
      />
      <Menu as="div" className="relative mt-2 inline-block px-3 text-left">
        <div>
          <Menu.Button>
            <svg
              width="14"
              height="24"
              viewBox="0 0 15 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.625 6.5V20.875C12.625 22.2011 12.0982 23.4729 11.1605 24.4105C10.2229 25.3482 8.95108 25.875 7.625 25.875C6.29892 25.875 5.02715 25.3482 4.08947 24.4105C3.15178 23.4729 2.625 22.2011 2.625 20.875V5.25C2.625 4.4212 2.95424 3.62634 3.54029 3.04029C4.12634 2.45424 4.9212 2.125 5.75 2.125C6.5788 2.125 7.37366 2.45424 7.95971 3.04029C8.54576 3.62634 8.875 4.4212 8.875 5.25V18.375C8.875 18.7065 8.7433 19.0245 8.50888 19.2589C8.27446 19.4933 7.95652 19.625 7.625 19.625C7.29348 19.625 6.97554 19.4933 6.74112 19.2589C6.5067 19.0245 6.375 18.7065 6.375 18.375V6.5H4.5V18.375C4.5 19.2038 4.82924 19.9987 5.41529 20.5847C6.00134 21.1708 6.7962 21.5 7.625 21.5C8.4538 21.5 9.24866 21.1708 9.83471 20.5847C10.4208 19.9987 10.75 19.2038 10.75 18.375V5.25C10.75 3.92392 10.2232 2.65215 9.28553 1.71447C8.34785 0.776784 7.07608 0.25 5.75 0.25C4.42392 0.25 3.15215 0.776784 2.21447 1.71447C1.27678 2.65215 0.75 3.92392 0.75 5.25V20.875C0.75 22.6984 1.47433 24.447 2.76364 25.7364C4.05295 27.0257 5.80164 27.75 7.625 27.75C9.44836 27.75 11.197 27.0257 12.4864 25.7364C13.7757 24.447 14.5 22.6984 14.5 20.875V6.5H12.625Z"
                fill="#616161"
              />
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
            className={`absolute ${`-left-32 bottom-10 right-24`} z-10 mt-2 w-36 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
          >
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? 'bg-white text-gray-900' : 'text-gray-700',
                      'flex w-full items-center px-4 py-2 text-sm'
                    )}
                    onClick={handleFileSelect}
                  >
                    <BiPhotoAlbum className="h-6 w-8" />
                    Attachments
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* <IoAttach
        className="text-gray-600 w-12 h-12 p-2 cursor-pointer"
        onClick={handleSendMessage
                    /> */}
      {context.state.micTap ? (
        <MdDelete
          className="disabled:true h-12 w-12 cursor-pointer p-2 text-gray-600"
          onClick={() => {
            context.dispatch({ type: CHATTYPE.MICTAP });
            recorderControls.stopRecording();
          }}
        />
      ) : (
        <IoMic
          className="disabled:true min-h-12 min-w-12 cursor-pointer p-2 text-gray-600"
          onClick={() => {
            setIsRecording(false);
            if (recorderControls.isRecording) {
              recorderControls.stopRecording();
            }

            context.dispatch({ type: CHATTYPE.MICTAP });
            recorderControls.startRecording();
          }}
        />
      )}
      <div
        className="cursor-pointer p-2"
        onClick={() => {
          if (recorderControls.isRecording) {
            setIsRecording(true);
            recorderControls.stopRecording();
          } else {
            handleSendMessage();
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
            d="M24.98 13.3868L6.88001 4.25551C5.36001 3.48676 3.60001 4.81801 4.08001 6.37426L6.56001 14.5118C6.66001 14.8493 6.66001 15.1868 6.56001 15.5243L4.08001 23.6618C3.60001 25.218 5.36001 26.5493 6.88001 25.7805L24.98 16.6493C25.2888 16.4911 25.5465 16.2579 25.726 15.9742C25.9055 15.6904 26.0002 15.3666 26.0002 15.0368C26.0002 14.7069 25.9055 14.3831 25.726 14.0993C25.5465 13.8156 25.2888 13.5824 24.98 13.4243V13.3868Z"
            fill="#0063F7"
          />
        </svg>
      </div>
    </div>
  );
}
