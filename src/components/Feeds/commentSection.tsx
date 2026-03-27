/* eslint-disable @next/next/no-img-element */
import { formatTimeDifference } from '@/app/(main)/(user-panel)/user/chats/api';
import {
  Comment,
  createPostComment,
  deltePostComment,
  getPostComments,
  Post,
} from '@/app/(main)/(user-panel)/user/feeds/api';

import useAxiosAuth from '@/hooks/AxiosAuth';
import { Avatar } from '@nextui-org/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { IoMdSend } from 'react-icons/io';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { Menu, Transition } from '@headlessui/react';
import { Ellipsis } from 'lucide-react';
import { classNames } from '@/components/Feeds/Post';
import { MdOutlineDelete } from 'react-icons/md';

export function CommentSection({ post }: { post: Post }) {
  const axiosAuth = useAxiosAuth();

  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: `comments${post._id}`,
    queryFn: () => getPostComments(axiosAuth, post._id),
  });
  const deleteMutation = useMutation(deltePostComment, {
    onSuccess: () => {
      queryClient.invalidateQueries(`comments${post._id}`);

      queryClient.invalidateQueries('posts');
    },
  });

  const [prevMessagesLength, setPrevMessagesLength] = useState(
    (data ?? []).length
  );

  const commentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if ((data ?? []).length > prevMessagesLength) {
      scrollToBottom();
    }
    setPrevMessagesLength((data ?? []).length);
    // Update the previous messages length
  }, [data, prevMessagesLength]);

  function scrollToBottom() {
    const container = commentRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }

  return (
    <>
      <div className="max-h-[220px] overflow-y-auto px-6" ref={commentRef}>
        {(data ?? []).map((comment: Comment) => {
          console.log(comment);
          return (
            <div
              className="flex w-full items-start gap-2 py-1"
              key={comment._id}
            >
              <div className="w-[6%]">
                <Avatar
                  as="button"
                  className="h-9 w-9 border-2 transition-transform"
                  color="secondary"
                  name="name"
                  size="sm"
                  src={`${
                    comment.userId.photo
                      ? comment.userId.photo
                      : '/images/user.png'
                  }`}
                />
              </div>
              {/* <img src={`${comment.userId.photo
                                ? comment.userId.photo
                                : "/images/user.png"
                                }`} alt="User Avatar" className="w-8 h-8 rounded-full" /> */}
              <div className="w-[95%]">
                <div className="w-[98%] rounded-lg bg-gray-200 px-4 py-2">
                  <div className="flex w-full justify-between">
                    <p className="text-sm font-semibold text-gray-800">
                      {comment.userId.firstName + ' ' + comment.userId.lastName}
                    </p>
                    <div>
                      <span className="pl-2 text-sm text-gray-700">
                        {format(
                          new Date(comment.createdAt),
                          'yyyy-MM-dd hh:mm a'
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="pb-1 text-base font-normal text-black">
                    {comment.text}
                  </p>
                </div>
                <div className="py-1 pl-3 text-sm font-thin">
                  {formatTimeDifference(new Date(comment.createdAt))} ago
                </div>
              </div>

              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button>
                  <Ellipsis className="h-5 w-7 rounded-md px-1 hover:bg-gray-100" />
                </Menu.Button>

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
                    className={`absolute right-3 top-2 z-10 mt-2 w-auto origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
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
                              deleteMutation.mutate({
                                axiosAuth,
                                id: comment._id,
                              });
                            }}
                          >
                            <MdOutlineDelete className="h-6 w-8" />
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          );
        })}
      </div>

      <CommentTextarea post={post} />
    </>
  );
}

function CommentTextarea({ post }: { post: Post }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);
  const axiosAuth = useAxiosAuth();

  const queryClient = useQueryClient();
  const createCommentMutation = useMutation(createPostComment, {
    onSuccess: () => {
      queryClient.invalidateQueries(`comments${post._id}`);
      queryClient.invalidateQueries('posts');
    },
  });

  const handleSendMessage = () => {
    createCommentMutation.mutate({ axiosAuth, content: text, id: post._id });
    setText('');
  };
  return (
    <>
      <div className="flex w-auto items-start bg-gray-100/80 px-5 pb-5 pt-2.5">
        <textarea
          ref={textareaRef}
          value={text ?? ''}
          onChange={(e) => {
            setText(e.target.value);
          }}
          placeholder="write comment ..."
          className="w-full resize-none bg-transparent focus:outline-none"
          onKeyDown={(v) => {
            if (v.code === 'Enter' || v.code === 'NumpadEnter') {
              v.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <IoMdSend
          className="h-6 w-max cursor-pointer text-blue-600"
          onClick={handleSendMessage}
        />
      </div>
    </>
  );
}
