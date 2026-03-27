// hooks/useChat.ts
import { CHATTYPE } from "@/app/helpers/user/enums";
import { chatSocket, socket } from "@/app/helpers/user/socket.helper";
import useAxiosAuth from "@/hooks/AxiosAuth";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { QueryClient, useQuery, useQueryClient } from "react-query";
import { io } from "socket.io-client";

import {
  AllAcitvitiesRoom,
  ChatRooms,
  getRoomChat,
  getWholeSeenCount,
  Message,
  sendMessage,
} from "./api";
import { ChatContextProps, useChatCotnext } from "./context";
import useShowNotification from "./useNotification";

const useSidebar = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const context = useChatCotnext();
  // useEffect(() => {
  //   const allChatRooms =
  //     queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`) ?? [];
  //   if (allChatRooms) {
  //     const teamCount = (
  //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
  //         ?.teamRooms ?? []
  //     ).length;
  //     const directCount = (
  //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)?.rooms ??
  //       []
  //     ).length;
  //     const projectCount = (
  //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
  //         ?.projectRoom ?? []
  //     ).length;
  //     const activityCount = teamCount + directCount + projectCount;

  //     context.dispatch({
  //       type: CHATTYPE.UPDATESEENCOUNT,
  //       activityCount,
  //       teamCount,
  //       directCount,
  //       projectCount,
  //     });
  //   }
  // }, [queryClient, context]);

  return {};
};

export default useSidebar;
