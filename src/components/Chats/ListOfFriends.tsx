/* eslint-disable @next/next/no-img-element */
import {
  ChatRooms,
  getAllRooms,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useQuery } from 'react-query';
import Loader from '../DottedLoader/loader';
import { Ellipsis } from 'lucide-react';
import { formatDateTime } from '@/utils';

function ListOfFriends() {
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: 'friends',
    queryFn: () => getAllRooms(axiosAuth),
  });
  const context = useChatCotnext();
  if (isLoading) {
    return (
      <div className="flex min-h-min items-center justify-center pt-20">
        <Loader />
      </div>
    );
  }
  if (isSuccess) {
    return (
      <></>
      // <div className="mt-6 flex h-full flex-col overflow-y-auto scrollbar-hide">
      //   <div className="h-full overflow-x-auto overflow-y-auto lg:px-0">
      //     <div className="w-[1400px] table-auto 2xl:w-full">
      //       {/* Table Head */}
      //       <div>
      //         <div className="grid grid-cols-5 items-center gap-4 bg-gray-50 px-2 py-1 text-sm font-semibold text-gray-700">
      //           <p className="py-2 text-left">Name</p>
      //           <p className="py-2 text-left">Email</p>
      //           <p className="py-2 text-left">Type</p>
      //           <p className="py-2 text-left">Reference</p>
      //           <p className="py-2 text-left">Date Added</p>
      //         </div>
      //       </div>

      //       {/* Table Body */}
      //       {data?.map((room: ChatRooms, index: number) => (
      //         <div
      //           key={room._id}
      //           className={`grid cursor-pointer grid-cols-5 items-center gap-4 border-b-2 border-gray-300 p-2 ${
      //             index % 2 !== 0 ? 'bg-gray-100' : 'bg-white'
      //           }`}
      //         >
      //           {/* User */}
      //           <div
      //             className={'flex items-center gap-1'}
      //             onClick={() => {
      //               context.dispatch({
      //                 type: CHATTYPE.SHOWPROFILE,
      //                 roomViewProfile: {
      //                   room: room,
      //                   participant: room.participants[0],
      //                   showFrom: 'direct',
      //                 },
      //               });
      //             }}
      //           >
      //             <img
      //               src={
      //                 room.participants[0].photo
      //                   ? room.participants[0].photo
      //                   : '/images/user.png'
      //               }
      //               alt={`image `}
      //               className="max-h-8 min-h-8 min-w-8 max-w-8 rounded-full object-cover"
      //             />
      //             <h1 className="truncate text-ellipsis text-sm font-semibold text-black">
      //               {room.participants[0].firstName +
      //                 ' ' +
      //                 room.participants[0].lastName}
      //             </h1>
      //           </div>

      //           {/* Organization */}
      //           <p
      //             onClick={() => {
      //               context.dispatch({
      //                 type: CHATTYPE.SHOWPROFILE,
      //                 roomViewProfile: {
      //                   room: room,
      //                   participant: room.participants[0],
      //                   showFrom: 'direct',
      //                 },
      //               });
      //             }}
      //             className="block truncate text-sm text-gray-800"
      //           >
      //             {room.participants[0].email}
      //           </p>

      //           <p
      //             onClick={() => {
      //               context.dispatch({
      //                 type: CHATTYPE.SHOWPROFILE,
      //                 roomViewProfile: {
      //                   room: room,
      //                   participant: room.participants[0],
      //                   showFrom: 'direct',
      //                 },
      //               });
      //             }}
      //             className="block w-max rounded-lg bg-success-500/50 px-2 py-1 text-sm capitalize text-gray-800"
      //           >
      //             {room.type}
      //           </p>

      //           <p
      //             onClick={() => {
      //               context.dispatch({
      //                 type: CHATTYPE.SHOWPROFILE,
      //                 roomViewProfile: {
      //                   room: room,
      //                   participant: room.participants[0],
      //                   showFrom: 'direct',
      //                 },
      //               });
      //             }}
      //             className="block text-sm text-gray-800"
      //           >
      //             {'-'}
      //           </p>

      //           <p className="flex gap-2 text-sm text-gray-800">
      //             {formatDateTime(room.createdAt).date}

      //             <div className="relative">
      //               <Menu as="div" className="relative inline-block text-left">
      //                 <Menu.Button>
      //                   <Ellipsis />
      //                 </Menu.Button>
      //                 <Transition
      //                   as={Fragment}
      //                   enter="transition ease-out duration-100"
      //                   enterFrom="transform opacity-0 scale-95"
      //                   enterTo="transform opacity-100 scale-100"
      //                   leave="transition ease-in duration-75"
      //                   leaveFrom="transform opacity-100 scale-100"
      //                   leaveTo="transform opacity-0 scale-95"
      //                 >
      //                   <Menu.Items className="absolute right-0 z-10 mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      //                     <div className="py-1">
      //                       <Menu.Item>
      //                         {({ active }) => (
      //                           <button
      //                             className={classNames(
      //                               active
      //                                 ? 'bg-gray-100 text-gray-900'
      //                                 : 'text-gray-700',
      //                               'flex w-full items-center px-4 py-2 text-sm'
      //                             )}
      //                             onClick={() => {
      //                               context.dispatch({
      //                                 type: CHATTYPE.SHOWPROFILE,
      //                                 roomViewProfile: {
      //                                   room: room,
      //                                   participant: room.participants[0],
      //                                   showFrom: 'direct',
      //                                 },
      //                               });
      //                             }}
      //                           >
      //                             View
      //                           </button>
      //                         )}
      //                       </Menu.Item>
      //                     </div>
      //                   </Menu.Items>
      //                 </Transition>
      //               </Menu>
      //             </div>
      //           </p>

      //           {/* Actions */}
      //         </div>
      //       ))}
      //     </div>
      //   </div>
      // </div>
    );
  }
  return <></>;
}

export { ListOfFriends };

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
