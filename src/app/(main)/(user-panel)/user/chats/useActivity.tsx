// hooks/useChat.ts
import { CHATTYPE } from "@/app/helpers/user/enums";
import { chatSocket, socket } from "@/app/helpers/user/socket.helper";
import useAxiosAuth from "@/hooks/AxiosAuth";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";

import { getRoomChat, Message, sendMessage } from "./api";
import { useChatCotnext } from "./context";
import useShowNotification from "./useNotification";

const useActivity = () => {
  // const context = useChatCotnext();
  // const axiosAuth = useAxiosAuth();
  // const queryClient = useQueryClient();
  // const session = useSession();
  // const notification = useShowNotification();
  // useEffect(() => {
  //   ////////////////////////Direct////////////////////////////////
  //   //TODO private message
  //   chatSocket.on("privateMessage", (message) => {
  //     const newData = message["message"] as Message;
  //     if (newData) {
  //       if (newData.roomId === context.state.roomDetail?._id) {
  //         // Update the messages list when a new message is received
  //         if (Notification.permission === "granted") {
  //           // notification.showNotification();
  //         } else if (Notification.permission !== "denied") {
  //           Notification.requestPermission().then((permission) => {
  //             if (permission === "granted") {
  //               // notification.showNotification();
  //             }
  //           });
  //         }
  //         queryClient.setQueryData<Message[]>(
  //           `messages${context.state.roomDetail?._id}`,
  //           (prev) => {
  //             return prev ? [...prev, newData] : [newData];
  //           }
  //         );
  //       }
  //     }
  //   });
  //   //TODO clear private chat
  //   chatSocket.on("clearChat", (response) => {
  //     queryClient.invalidateQueries(`messages${context.state.roomDetail?._id}`);
  //   });
  //   chatSocket.on("deleteMessage", (response) => {
  //     const { id, userId } = response;
  //     if (context.state.roomDetail?.senderId === userId) {
  //       const allMessages =
  //         queryClient.getQueryData<Message[]>(
  //           `messages${context.state.roomDetail?._id}`
  //         ) ?? [];
  //       const updatedMessages = allMessages.filter(
  //         (message) => message._id !== id
  //       );
  //       queryClient.setQueryData<Message[]>(
  //         `messages${context.state.roomDetail?._id}`,
  //         updatedMessages
  //       );
  //     }
  //   });
  //   //////////////////////////TEAM/////////////////////////////
  //   //TODO private team message
  //   chatSocket.on("privateTeamMessage", (message) => {
  //     const newData = message["message"] as Message;
  //     if (newData) {
  //       if (newData.roomId === context.state.roomDetail?._id) {
  //         // Update the messages list when a new message is received
  //         queryClient.setQueryData<Message[]>(
  //           `messages${context.state.roomDetail?._id}`,
  //           (prev) => {
  //             return prev ? [...prev, newData] : [newData];
  //           }
  //         );
  //       }
  //     }
  //   });
  //   //TODO clear private chat
  //   chatSocket.on("clearTeamChat", (response) => {
  //     const { roomId } = response;
  //     queryClient.invalidateQueries(`messages${context.state.roomDetail?._id}`);
  //   });
  //   /// team leave
  //   chatSocket.on("teamLeave", (response) => {
  //     const { success, roomId } = response;
  //     if (success) {
  //       if (context.state.roomDetail?._id === roomId) {
  //         queryClient.invalidateQueries(`teamsRoom`).then((v) => {
  //           context.dispatch({ type: CHATTYPE.UPDATEROOMDETAIL });
  //         });
  //       }
  //     }
  //   });
  //   // pinnedChatToggle
  //   chatSocket.on("pinnedTeamChatToggle", (response) => {
  //     queryClient.invalidateQueries(`teamsRoom`);
  //   });
  //   chatSocket.on("deleteTeamMessage", (response) => {
  //     const { id, userId } = response;
  //     if (context.state.roomDetail?.senderId === userId) {
  //       const allMessages =
  //         queryClient.getQueryData<Message[]>(
  //           `messages${context.state.roomDetail?._id}`
  //         ) ?? [];
  //       const updatedMessages = allMessages.filter(
  //         (message) => message._id !== id
  //       );
  //       queryClient.setQueryData<Message[]>(
  //         `messages${context.state.roomDetail?._id}`,
  //         updatedMessages
  //       );
  //     }
  //     // queryClient.invalidateQueries(`messages${context.state.roomDetail?._id}`);
  //   });
  //   ///////////////////////////Project/////////////////////////////////
  //   //TODO private message
  //   chatSocket.on("ProjectMessage", (message) => {
  //     const newData = message["message"] as Message;
  //     if (newData) {
  //       if (newData.roomId === context.state.roomDetail?._id) {
  //         // Update the messages list when a new message is received
  //         queryClient.setQueryData<Message[]>(
  //           `messages${context.state.roomDetail?._id}`,
  //           (prev) => {
  //             return prev ? [...prev, newData] : [newData];
  //           }
  //         );
  //       }
  //     }
  //   });
  //   //TODO clear private chat
  //   chatSocket.on("clearProjectChat", (response) => {
  //     queryClient.invalidateQueries(`messages${context.state.roomDetail?._id}`);
  //   });
  //   /// projectLeave leave
  //   chatSocket.on("projectLeave", (response) => {
  //     const { success, roomId } = response;
  //     if (success) {
  //       if (context.state.roomDetail?._id === roomId) {
  //         queryClient.invalidateQueries(`projectRooms`).then((v) => {
  //           context.dispatch({ type: CHATTYPE.UPDATEROOMDETAIL });
  //         });
  //       }
  //     }
  //   });
  //   // pinnedChatToggle
  //   chatSocket.on("pinnedChatToggle", (response) => {
  //     queryClient.invalidateQueries(`projectRooms`);
  //   });
  //   chatSocket.on("deleteProjectMessage", (response) => {
  //     const { id, userId } = response;
  //     if (context.state.roomDetail?.senderId === userId) {
  //       const allMessages =
  //         queryClient.getQueryData<Message[]>(
  //           `messages${context.state.roomDetail?._id}`
  //         ) ?? [];
  //       const updatedMessages = allMessages.filter(
  //         (message) => message._id !== id
  //       );
  //       queryClient.setQueryData<Message[]>(
  //         `messages${context.state.roomDetail?._id}`,
  //         updatedMessages
  //       );
  //     }
  //     // queryClient.invalidateQueries(`messages${context.state.roomDetail?._id}`);
  //   });
  //   return () => {
  //     chatSocket.off("deleteMessage");
  //     chatSocket.off("clearChat");
  //     chatSocket.off("privateMessage");
  //     ///Team
  //     chatSocket.off("deleteTeamMessage");
  //     chatSocket.off("clearTeamChat");
  //     chatSocket.off("privateTeamMessage");
  //     chatSocket.off("pinnedTeamChatToggle");
  //     chatSocket.off("teamLeave");
  //     ///Project
  //     chatSocket.off("pinnedChatToggle");
  //     chatSocket.off("deleteProjectMessage");
  //     chatSocket.off("clearProjectChat");
  //     chatSocket.off("ProjectMessage");
  //     chatSocket.off("projectLeave");
  //   };
  // }, [context.state.roomDetail, queryClient, session, notification, context]);
  // useEffect(() => {
  //   ////
  //   console.log(
  //     "it hit ow many times here rooom ",
  //     context.state.roomDetail?.roomType
  //   );
  //   // if (context.state.roomDetail != undefined) {
  //   //   if (context.state.roomDetail.roomType === "direct") {
  //   //     chatSocket.emit("seenCountChange", {
  //   //       roomId: context.state.roomDetail?._id,
  //   //       userId: context.state.roomDetail?.senderId,
  //   //     });
  //   //   }
  //   // }
  //   // ///Team
  //   // if (context.state.roomDetail != undefined) {
  //   //   if (context.state.roomDetail.roomType === "team") {
  //   //     chatSocket.emit("seenTeamCountChange", {
  //   //       roomId: context.state.roomDetail?._id,
  //   //       userId: context.state.roomDetail?.senderId,
  //   //     });
  //   //   }
  //   // }
  //   // /// Project
  //   // if (context.state.roomDetail != undefined) {
  //   //   if (context.state.roomDetail.roomType === "project") {
  //   //     chatSocket.emit("seenProjectCountChange", {
  //   //       roomId: context.state.roomDetail?._id,
  //   //       userId: context.state.roomDetail?.senderId,
  //   //     });
  //   //   }
  //   // }
  //   return () => {
  //     //// Direct
  //     console.log(
  //       "it hit ow on unmount times",
  //       context.state.roomDetail?.roomType
  //     );
  //     if (context.state.roomDetail != undefined) {
  //       if (context.state.roomDetail.roomType === "direct") {
  //         chatSocket.emit("seenCountChange", {
  //           roomId: context.state.roomDetail?._id,
  //           userId: context.state.roomDetail?.senderId,
  //         });
  //       }
  //     }
  //     ///Team
  //     if (context.state.roomDetail != undefined) {
  //       if (context.state.roomDetail.roomType === "team") {
  //         chatSocket.emit("seenTeamCountChange", {
  //           roomId: context.state.roomDetail?._id,
  //           userId: context.state.roomDetail?.senderId,
  //         });
  //       }
  //     }
  //     /// Project
  //     if (context.state.roomDetail != undefined) {
  //       if (context.state.roomDetail.roomType === "project") {
  //         chatSocket.emit("seenProjectCountChange", {
  //           roomId: context.state.roomDetail?._id,
  //           userId: context.state.roomDetail?.senderId,
  //         });
  //       }
  //     }
  //     chatSocket.off("seenTeamCountChange");
  //     chatSocket.off("seenTeamCountChange");
  //     chatSocket.off("seenProjectCountChange");
  //   };
  // }, [context.state.roomDetail]);
};

export default useActivity;
