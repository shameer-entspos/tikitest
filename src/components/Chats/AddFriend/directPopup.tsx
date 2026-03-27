import {
  searchPeoples,
  sendRequestToUsers,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

function DirectPopupUserAvatar({ photo }: { photo?: string }) {
  const src = usePresignedUserPhoto(photo);
  return <img src={src} alt="user image" className="h-9 w-9 rounded-full object-cover" />;
}

// direct function
export function DirectFriendRequest() {
  const axiosAuth = useAxiosAuth();
  const context = useChatCotnext();
  /// hit search api
  const { data, isLoading, isSuccess } = useQuery(
    ['searchPeopleRequest', axiosAuth, context.state.searchText],

    () => searchPeoples(axiosAuth, context.state.searchText ?? ''),
    {
      // enabled: true,
    }
  );
  const [sentRequestId, setSentRequestId] = useState('');
  const queryClient = useQueryClient();
  /// sent request
  const sendRequestToUsersMutation = useMutation(sendRequestToUsers, {
    onSuccess: () => {
      queryClient.invalidateQueries('searchPeopleRequest');
      queryClient.invalidateQueries('sentChatRequest');
      // context.dispatch({ type: CHATTYPE.TOGGLE });
    },
  });
  return (
    <div className="mt-8">
      <div className="mb-4 text-xs text-black">Select contact to message</div>

      <div className="mb-2">
        <Search
          type="text"
          name="search"
          className="h-9 rounded-lg border border-[#505050ed] bg-[#FAFAFA] text-sm"
          inputRounded={false}
          inputFullWidth={false}
          value={context.state.searchText}
          onChange={(event) => {
            context.dispatch({
              type: CHATTYPE.SEARCH,
              searchText: event.target.value,
            });
          }}
          placeholder="Search your contacts"
        />
      </div>

      <div className={`${'max-h-72 overflow-y-scroll scrollbar-hide'}`}>
        {isLoading ? (
          <>
            <Loader />
          </>
        ) : (
          <>
            {isSuccess ? (
              <>
                {(data ?? [])?.map((user) => {
                  return (
                    <div key={user._id} className="py-1 text-sm font-thin">
                      <div className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-3">
                        <div className="flex w-1/2 items-center gap-2">
                          <DirectPopupUserAvatar photo={user.photo} />
                          <div className="flex flex-col overflow-hidden text-gray-500">
                            <span className="text-gray-800">{`${user.firstName} ${user.lastName}`}</span>
                            <span> {`${user.email}`}</span>
                          </div>
                        </div>

                        <div className="w-1/2 text-end text-xs text-gray-700">
                          {user.status === 'Already Added' && (
                            <>{user.status}</>
                          )}
                          {user.status === 'Request Sent' && <>{user.status}</>}
                          {user.status === 'Request Received' && (
                            <>{user.status}</>
                          )}
                          {user.status === 'Not Added' && (
                            <div
                              className="cursor-pointer text-primary-400"
                              onClick={async () => {
                                setSentRequestId(user._id);
                                // sendRequestToUsersMutation.mutate({
                                //   axiosAuth: axiosAuth,
                                //   Ids: [user._id],
                                // });
                              }}
                            >
                              {' '}
                              {sendRequestToUsersMutation.isLoading &&
                              sentRequestId === user._id ? (
                                <div className="flex justify-end">
                                  {' '}
                                  <Loader />
                                </div>
                              ) : (
                                <p className="text-xs">
                                  {' '}
                                  {sendRequestToUsersMutation.isSuccess &&
                                  sentRequestId === user._id ? (
                                    <>!Done</>
                                  ) : (
                                    <>Send Request</>
                                  )}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    // <div
                    //   className="flex items-center justify-between bg-gray-50 p-2 border border-[#fff]  rounded-lg"
                    //   key={user._id}
                    // >
                    //   <div className="flex items-center">
                    //     <input
                    //       type="checkbox"
                    //       name="user"
                    //       checked={isUserSelected(user._id)}
                    //       disabled={
                    //         user.status === "Already Added" ||
                    //         user.status ===
                    //           "Request Already Sent" ||
                    //         user.status ===
                    //           "Request Already Received"
                    //       }
                    //       onChange={(e) => {
                    //         handlePeopleSelect(user._id);
                    //       }}
                    //       className="mr-1 w-3 h-3 rounded-none border-[#616161] "
                    //     />
                    //     <div className="text-xs text-[#616161] font-Open-Sans">
                    //       {user.email}
                    //     </div>
                    //   </div>
                    //   <div className="relative inline-flex text-xs">
                    //     {user.status}
                    //   </div>
                    // </div>
                  );
                })}
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </div>

      {/* <div className="text-center flex gap-7 justify-center">
      <Button
        variant="primaryOutLine"
        className="mt-[24px]"
        onClick={() => { }}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        className={`mt-[24px]  
                        ${context.state.userId?.length === 0 ||
            context.state.userId?.length === undefined
            ? `bg-[#75757544] `
            : ``
          }
                        `}
        disabled={
          context.state.userId?.length === 0 ||
          context.state.userId?.length === undefined
        }
        onClick={async () => {
          sendRequestToUsersMutation.mutate({
            axiosAuth: axiosAuth,
            Ids: context.state.userId ?? [],
          });
        }}
      >
        {sendRequestToUsersMutation.isLoading ? (
          <Loader />
        ) : (
          <p className="text-xs"> Send Requests</p>
        )}
      </Button> */}
      {/* {sendRequestToUsersMutation.isSuccess ? <Button
                        variant="primary"
                        className={`mt-[24px] 
                        ${context.state.userId?.length === 0 || context.state.userId?.length === undefined ? `bg-[#75757544] ` : ``
                            }
                        `
                        }
                        disabled={context.state.userId?.length === 0 || context.state.userId?.length === undefined}
                        onClick={async () => {
                            context.dispatch({ type: PEOPLETYPE.TOGGLE })
                        }}
                    >
                        <>Finish</>
                    </Button> : <>
                        </>} */}
      {/* </div> */}

      {/* new members details */}
    </div>
  );
}
