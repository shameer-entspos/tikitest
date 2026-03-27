/* eslint-disable @next/next/no-img-element */
import {
  ChatRequestList,
  formatTimeDifference,
  responedChatRequests,
  sentChatRequests,
} from '@/app/(main)/(user-panel)/user/chats/api';

import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import Image from 'next/image';
import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from 'react-query';

import Loader from '../DottedLoader/loader';

function SentRequestAvatar({ photo }: { photo?: string }) {
  const src = usePresignedUserPhoto(photo);
  return (
    <img
      src={src}
      alt=""
      className="max-h-12 min-h-12 min-w-12 max-w-12 rounded-full object-cover"
    />
  );
}

function SentChatRequests() {
  const queryClient = useQueryClient();
  const [loader, setLoader] = useState<ChatRequestList | null>(null);
  const responedChatRequestMutation = useMutation(responedChatRequests, {
    onSuccess: async () => {
      // Invalidate and immediately refetch to update the UI
      await queryClient.invalidateQueries({
        queryKey: 'sentChatRequest',
        refetchActive: true,
        refetchInactive: false,
      });

      queryClient.invalidateQueries('friends');
      setLoader(null);
    },
  });

  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: 'sentChatRequest',
    queryFn: () => sentChatRequests(axiosAuth),
  });
  const actionOnChatRequest = ({
    action,
    id,
  }: {
    action: 'accept' | 'reject';
    id: string;
  }) => {
    responedChatRequestMutation.mutate({
      axiosAuth: axiosAuth,
      body: {
        action: action,
        id: id,
      },
    });
  };
  return (
    <>
      {isLoading && (
        <div className="h-auto items-center justify-center pt-12">
          <Loader />
        </div>
      )}
      {isSuccess && (
        <div className="flex h-[65vh] flex-col overflow-y-scroll px-3 scrollbar-hide">
          {data.map((e) => (
            <div
              key={e._id}
              className="bg-slate-100 mt-2 flex flex-col items-center gap-1 rounded-xl bg-white p-3 lg:px-4"
              style={{
                boxShadow: '0px 0px 10px #0000002d',
              }}
            >
              <div className="flex w-full gap-2">
                <SentRequestAvatar photo={e.receiver?.photo} />

                <div className="w-full flex-col justify-between">
                  <div className="flex w-full items-center justify-between">
                    <h1 className="text-base font-medium">
                      {`${e.receiver?.firstName} ${e.receiver?.lastName}`}
                    </h1>
                    <h1 className="text-sm text-gray-500">
                      {formatTimeDifference(new Date(e.createdAt))}
                    </h1>
                  </div>

                  <div className="mt-1 flex w-full items-center justify-between">
                    <h1 className="w-28 truncate text-ellipsis text-xs font-medium text-gray-600">{`${e.receiver?.email}`}</h1>
                    <h1 className="text-xs text-gray-500">Sent</h1>
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1 px-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 0C1.73478 0 1.48043 0.105357 1.29289 0.292893C1.10536 0.48043 1 0.734784 1 1V15C1 15.2652 1.10536 15.5196 1.29289 15.7071C1.48043 15.8946 1.73478 16 2 16H5V12.5C5 12.3674 5.05268 12.2402 5.14645 12.1464C5.24021 12.0527 5.36739 12 5.5 12H8.5C8.63261 12 8.75979 12.0527 8.85355 12.1464C8.94732 12.2402 9 12.3674 9 12.5V16H12C12.2652 16 12.5196 15.8946 12.7071 15.7071C12.8946 15.5196 13 15.2652 13 15V1C13 0.734784 12.8946 0.48043 12.7071 0.292893C12.5196 0.105357 12.2652 0 12 0L2 0ZM3 2.5C3 2.36739 3.05268 2.24021 3.14645 2.14645C3.24021 2.05268 3.36739 2 3.5 2H4.5C4.63261 2 4.75979 2.05268 4.85355 2.14645C4.94732 2.24021 5 2.36739 5 2.5V3.5C5 3.63261 4.94732 3.75979 4.85355 3.85355C4.75979 3.94732 4.63261 4 4.5 4H3.5C3.36739 4 3.24021 3.94732 3.14645 3.85355C3.05268 3.75979 3 3.63261 3 3.5V2.5ZM6 2.5C6 2.36739 6.05268 2.24021 6.14645 2.14645C6.24021 2.05268 6.36739 2 6.5 2H7.5C7.63261 2 7.75979 2.05268 7.85355 2.14645C7.94732 2.24021 8 2.36739 8 2.5V3.5C8 3.63261 7.94732 3.75979 7.85355 3.85355C7.75979 3.94732 7.63261 4 7.5 4H6.5C6.36739 4 6.24021 3.94732 6.14645 3.85355C6.05268 3.75979 6 3.63261 6 3.5V2.5ZM9.5 2H10.5C10.6326 2 10.7598 2.05268 10.8536 2.14645C10.9473 2.24021 11 2.36739 11 2.5V3.5C11 3.63261 10.9473 3.75979 10.8536 3.85355C10.7598 3.94732 10.6326 4 10.5 4H9.5C9.36739 4 9.24021 3.94732 9.14645 3.85355C9.05268 3.75979 9 3.63261 9 3.5V2.5C9 2.36739 9.05268 2.24021 9.14645 2.14645C9.24021 2.05268 9.36739 2 9.5 2ZM3 5.5C3 5.36739 3.05268 5.24021 3.14645 5.14645C3.24021 5.05268 3.36739 5 3.5 5H4.5C4.63261 5 4.75979 5.05268 4.85355 5.14645C4.94732 5.24021 5 5.36739 5 5.5V6.5C5 6.63261 4.94732 6.75979 4.85355 6.85355C4.75979 6.94732 4.63261 7 4.5 7H3.5C3.36739 7 3.24021 6.94732 3.14645 6.85355C3.05268 6.75979 3 6.63261 3 6.5V5.5ZM6.5 5H7.5C7.63261 5 7.75979 5.05268 7.85355 5.14645C7.94732 5.24021 8 5.36739 8 5.5V6.5C8 6.63261 7.94732 6.75979 7.85355 6.85355C7.75979 6.94732 7.63261 7 7.5 7H6.5C6.36739 7 6.24021 6.94732 6.14645 6.85355C6.05268 6.75979 6 6.63261 6 6.5V5.5C6 5.36739 6.05268 5.24021 6.14645 5.14645C6.24021 5.05268 6.36739 5 6.5 5ZM9 5.5C9 5.36739 9.05268 5.24021 9.14645 5.14645C9.24021 5.05268 9.36739 5 9.5 5H10.5C10.6326 5 10.7598 5.05268 10.8536 5.14645C10.9473 5.24021 11 5.36739 11 5.5V6.5C11 6.63261 10.9473 6.75979 10.8536 6.85355C10.7598 6.94732 10.6326 7 10.5 7H9.5C9.36739 7 9.24021 6.94732 9.14645 6.85355C9.05268 6.75979 9 6.63261 9 6.5V5.5ZM3.5 8H4.5C4.63261 8 4.75979 8.05268 4.85355 8.14645C4.94732 8.24021 5 8.36739 5 8.5V9.5C5 9.63261 4.94732 9.75979 4.85355 9.85355C4.75979 9.94732 4.63261 10 4.5 10H3.5C3.36739 10 3.24021 9.94732 3.14645 9.85355C3.05268 9.75979 3 9.63261 3 9.5V8.5C3 8.36739 3.05268 8.24021 3.14645 8.14645C3.24021 8.05268 3.36739 8 3.5 8ZM6 8.5C6 8.36739 6.05268 8.24021 6.14645 8.14645C6.24021 8.05268 6.36739 8 6.5 8H7.5C7.63261 8 7.75979 8.05268 7.85355 8.14645C7.94732 8.24021 8 8.36739 8 8.5V9.5C8 9.63261 7.94732 9.75979 7.85355 9.85355C7.75979 9.94732 7.63261 10 7.5 10H6.5C6.36739 10 6.24021 9.94732 6.14645 9.85355C6.05268 9.75979 6 9.63261 6 9.5V8.5ZM9.5 8H10.5C10.6326 8 10.7598 8.05268 10.8536 8.14645C10.9473 8.24021 11 8.36739 11 8.5V9.5C11 9.63261 10.9473 9.75979 10.8536 9.85355C10.7598 9.94732 10.6326 10 10.5 10H9.5C9.36739 10 9.24021 9.94732 9.14645 9.85355C9.05268 9.75979 9 9.63261 9 9.5V8.5C9 8.36739 9.05268 8.24021 9.14645 8.14645C9.24021 8.05268 9.36739 8 9.5 8Z"
                      fill="#616161"
                    />
                  </svg>

                  <h1 className="pl- w-36 truncate text-xs text-gray-600">
                    {e.receiver?.organization.name}
                  </h1>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="font-base rounded-xl bg-primary-500 px-3 py-1 text-sm text-white"
                    onClick={() => {
                      setLoader(e);
                      actionOnChatRequest({
                        action: 'reject',
                        id: e._id,
                      });
                    }}
                  >
                    {responedChatRequestMutation.isLoading &&
                    loader?._id == e._id ? (
                      <div className="mt-1 inline-block h-3 items-center">
                        <Loader />
                      </div>
                    ) : (
                      'Cancel'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export { SentChatRequests };
