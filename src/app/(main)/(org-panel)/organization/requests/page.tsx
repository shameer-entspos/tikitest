'use client';
import {
  getChatRequests,
  responedChatRequests,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { socket } from '@/app/helpers/user/socket.helper';
import { Button } from '@/components/Buttons';
import { Card } from '@/components/Cards';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import { TeamList } from '@/components/TeamList';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
export default function Page() {
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'accept' | 'reject' | ''>('');
  const [search, setSearch] = useState('');

  const axiosAuth = useAxiosAuth();

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: 'receiveChatRequestOrg',
    queryFn: () => getChatRequests(axiosAuth),
  });

  const queryClient = useQueryClient();
  const responedChatRequestMutation = useMutation(responedChatRequests, {
    onSuccess: async (response) => {
      // socket.emit("newUser", response.room._id);
      await queryClient.invalidateQueries({
        queryKey: 'receiveChatRequestOrg',
        refetchActive: true,
        refetchInactive: false,
      });
      // Invalidate and refetch contacts immediately to show the new contact
      await queryClient.invalidateQueries({
        queryKey: 'contacts',
        refetchActive: true,
        refetchInactive: false,
      });
      setAction('');
    },
    onError: () => {
      setAction('');
    },
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
  if (isLoading) {
    return (
      <div className="items-center justify-center pt-12">
        <Loader />
      </div>
    );
  }
  const filteredUsers = (data ?? []).filter((req) =>
    req.sender?.firstName.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <div className="flex min-h-full w-full max-w-[880px] flex-1 flex-col">
        <div className="w-full max-w-[880px]">
          <div className="page-heading-edit mb-6 flex justify-between">
            <div className="text-lg font-semibold text-black md:text-2xl">
              Requests
            </div>
          </div>

          <div className="team-actice mb-4 flex items-center justify-between">
            <div className="tema-heading hidden md:block"></div>
            <Search
              inputRounded={true}
              type="search"
              className="bg-[#eeeeee] placeholder:text-[#616161]"
              name="search"
              placeholder="Search Requests"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full max-w-[880px]">
          {filteredUsers?.map((req) => {
            return (
              <Card key={req._id}>
                <div className="flex flex-col items-center justify-between md:flex-row">
                  <div className="text-center text-base font-normal text-black md:mr-7 md:w-3/4 md:text-left">
                    <strong>{`${req.sender?.firstName} ${req.sender?.lastName}`}</strong>{' '}
                    from <strong>{req.sender?.organization.name}</strong> would
                    like to be friends?
                  </div>
                  <div className="mt-5 flex gap-4 md:mt-0">
                    <button
                      className="h-[47px] min-w-[97px] rounded-lg bg-[#E0E0E0] px-[20px] py-[10px] text-base font-bold leading-[22px] text-[#616161]"
                      onClick={() => {
                        setAction('reject');
                        actionOnChatRequest({
                          action: 'reject',
                          id: req._id,
                        });
                      }}
                    >
                      {responedChatRequestMutation.isLoading &&
                      action === 'reject' ? (
                        <>
                          <Loader />
                        </>
                      ) : (
                        <>Decline</>
                      )}
                    </button>
                    <button
                      className="h-[47px] min-w-[97px] rounded-lg bg-[#0063F7] px-[20px] py-[10px] text-base font-bold leading-[22px] text-white"
                      onClick={() => {
                        setAction('accept');

                        actionOnChatRequest({
                          action: 'accept',
                          id: req._id,
                        });
                      }}
                    >
                      {responedChatRequestMutation.isLoading &&
                      action === 'accept' ? (
                        <>
                          <Loader />
                        </>
                      ) : (
                        <>Accept</>
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
