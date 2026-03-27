import { CHATTYPE } from '@/app/helpers/user/enums';
import { socket } from '@/app/helpers/user/socket.helper';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { AllAcitvitiesRoom, ChatRooms, ProjectRooms, TeamRooms } from './api';
import { useChatCotnext } from './context';
import useShowNotification from './useNotification';

const useAllRoomSocket = () => {
  const notification = useShowNotification();
  ////manage socket here////////////////////////
  const queryClient = useQueryClient();
  const context = useChatCotnext();
  /// activities room
  useEffect(() => {
    /////////////////////////Direct Rooms/////////////////////////////
    /// userOnline status
    socket.on('userOnline', (response) => {
      const { userId, online } = response;
      if (
        context.state.roomDetail &&
        'participants' in context.state.roomDetail
      ) {
        const updatedRoom = {
          ...context.state.roomDetail,
          participants: (context.state.roomDetail as any).participants.map(
            (participant: any) => ({
              ...participant,
              isOnline:
                participant._id === userId ? online : participant.isOnline,
            })
          ),
        };
        context.dispatch({
          type: CHATTYPE.UPDATEROOMDETAIL,
          roomDetail: updatedRoom,
        });
      }
      const allChatRooms =
        queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)?.rooms ??
        [];

      const updatedRooms: ChatRooms[] = allChatRooms.map((room) => {
        if (room.participants[0]._id === userId) {
          return {
            ...room,
            participants: [
              {
                ...room.participants[0],
                isOnline: online,
              },
              ...room.participants.slice(1), // Keep the rest of the participants unchanged
            ],
          };
        }
        return room;
      });

      queryClient.setQueryData<AllAcitvitiesRoom | undefined>(
        'activitiesRoom',
        (prevData: AllAcitvitiesRoom | undefined) => {
          if (!prevData) {
            return prevData; // Return early if previous data is undefined
          }
          return {
            ...prevData,
            rooms: updatedRooms,
          };
        }
      );
    });
    /// direct room update
    socket.on('directRoomUpdate', (response) => {
      const { roomId, lastMessage, mimetype, type, timeStamp, senderId } =
        response;
      let val = false;

      const allChatRooms =
        queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)?.rooms ??
        [];

      const exactRoom = allChatRooms.find((room) => room._id == roomId);
      if (context.state.roomDetail) {
        if (
          exactRoom?._id != context.state.roomDetail?._id &&
          !exactRoom?.isMuted
        ) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon: exactRoom?.participants[0].photo ?? '/images/user.png',
          });
        }
      } else {
        if (!exactRoom?.isMuted) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon: exactRoom?.participants[0].photo ?? '/images/user.png',
          });
        }
      }
      const updatedRooms: ChatRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId) {
          val = true;
          return {
            ...room,

            lastMessage: mimetype == 'text' ? lastMessage : mimetype,
            seenCount:
              context.state.roomDetail && 'senderId' in context.state.roomDetail
                ? (context.state.roomDetail as any).senderId != senderId &&
                  context.state.roomDetail._id != roomId
                  ? room.seenCount + 1
                  : 0
                : room.seenCount + 1,
            updatedAt: timeStamp,
          };
        }
        return room;
      });
      const sortedUpdatedRooms = [...updatedRooms].sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return timeB - timeA; // Sorting in descending order
      });

      if (val) {
        queryClient.setQueryData<AllAcitvitiesRoom | undefined>(
          'activitiesRoom',
          (prevData: AllAcitvitiesRoom | undefined) => {
            if (!prevData) {
              return prevData; // Return early if previous data is undefined
            }
            return {
              ...prevData,
              rooms: sortedUpdatedRooms,
            };
          }
        );
      } else {
        queryClient.invalidateQueries('activitiesRoom');
      }
    });

    //// seencount
    socket.on('roomSeenCount', (response) => {
      const { roomId, type, userId } = response;

      console.log(response);

      const allChatRooms =
        queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)?.rooms ??
        [];
      const updatedRooms: ChatRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId && room.senderId === userId) {
          return {
            ...room,
            seenCount: 0,
          };
        }
        return room;
      });

      queryClient.setQueryData<AllAcitvitiesRoom | undefined>(
        'activitiesRoom',
        (prevData: AllAcitvitiesRoom | undefined) => {
          if (!prevData) {
            return prevData; // Return early if previous data is undefined
          }
          return {
            ...prevData,
            rooms: updatedRooms,
          };
        }
      );
      //   if (allChatRooms) {
      //     const teamCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.teamRooms ?? []
      //     ).length;
      //     const directCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.rooms ?? []
      //     ).length;
      //     const projectCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.projectRoom ?? []
      //     ).length;
      //     const activityCount = teamCount + directCount + projectCount;

      //     context.dispatch({
      //       type: CHATTYPE.ACTIVITY_COUNT,
      //       activityCount,
      //       teamCount,
      //       directCount,
      //       projectCount,
      //     });
      //   }
    });
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////Project//////////////////////////////////
    ///  room update
    socket.on('directProjectRoomUpdate', (response) => {
      const { roomId, lastMessage, mimetype, type, timeStamp, senderId } =
        response;
      let val = false;
      const allChatRooms =
        queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
          ?.projectRoom ?? [];

      const exactRoom = allChatRooms.find((room) => room._id == roomId);

      if (context.state.roomDetail) {
        if (
          exactRoom?._id != context.state.roomDetail?._id &&
          !exactRoom?.isMuted
        ) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon:
              exactRoom?.participants.find((user) => user._id == senderId)
                ?.photo ??
              `data:image/svg+xml,${encodeURIComponent(`<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.33334 21C1.69167 21 1.14217 20.7713 0.684835 20.314C0.227502 19.8567 -0.000775797 19.3076 1.98076e-06 18.6667V2.33334C1.98076e-06 1.69167 0.228669 1.14217 0.686002 0.684835C1.14334 0.227502 1.69245 -0.000775797 2.33334 1.98076e-06H18.6667C19.3083 1.98076e-06 19.8578 0.228669 20.3152 0.686002C20.7725 1.14334 21.0008 1.69245 21 2.33334V18.6667C21 19.3083 20.7713 19.8578 20.314 20.3152C19.8567 20.7725 19.3076 21.0008 18.6667 21H2.33334ZM8.16667 18.6667V11.6667H2.33334V18.6667H8.16667ZM10.5 18.6667H18.6667V11.6667H10.5V18.6667ZM2.33334 9.33333H18.6667V2.33334H2.33334V9.33333Z" fill="#0099FF"/>
              </svg>
              `)}`,
          });
        }
      } else {
        if (!exactRoom?.isMuted) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon:
              exactRoom?.participants.find((user) => user._id == senderId)
                ?.photo ??
              `data:image/svg+xml,${encodeURIComponent(`<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.33334 21C1.69167 21 1.14217 20.7713 0.684835 20.314C0.227502 19.8567 -0.000775797 19.3076 1.98076e-06 18.6667V2.33334C1.98076e-06 1.69167 0.228669 1.14217 0.686002 0.684835C1.14334 0.227502 1.69245 -0.000775797 2.33334 1.98076e-06H18.6667C19.3083 1.98076e-06 19.8578 0.228669 20.3152 0.686002C20.7725 1.14334 21.0008 1.69245 21 2.33334V18.6667C21 19.3083 20.7713 19.8578 20.314 20.3152C19.8567 20.7725 19.3076 21.0008 18.6667 21H2.33334ZM8.16667 18.6667V11.6667H2.33334V18.6667H8.16667ZM10.5 18.6667H18.6667V11.6667H10.5V18.6667ZM2.33334 9.33333H18.6667V2.33334H2.33334V9.33333Z" fill="#0099FF"/>
              </svg>
              `)}`,
          });
        }
      }

      const updatedRooms: ProjectRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId) {
          val = true;
          return {
            ...room,

            lastMessage: mimetype == 'text' ? lastMessage : mimetype,
            seenCount:
              context.state.roomDetail && 'senderId' in context.state.roomDetail
                ? (context.state.roomDetail as any).senderId != senderId &&
                  context.state.roomDetail._id != roomId
                  ? room.seenCount + 1
                  : 0
                : room.seenCount + 1,
            updatedAt: timeStamp,
          };
        }
        return room;
      });
      const sortedUpdatedRooms = [...updatedRooms].sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return timeB - timeA; // Sorting in descending order
      });

      if (val) {
        queryClient.setQueryData<AllAcitvitiesRoom | undefined>(
          'activitiesRoom',
          (prevData: AllAcitvitiesRoom | undefined) => {
            if (!prevData) {
              return prevData; // Return early if previous data is undefined
            }
            return {
              ...prevData,
              projectRoom: sortedUpdatedRooms,
            };
          }
        );
      } else {
        queryClient.invalidateQueries('activitiesRoom');
      }

      if (allChatRooms) {
        const teamCount = (
          queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
            ?.teamRooms ?? []
        ).length;
        const directCount = (
          queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
            ?.rooms ?? []
        ).length;
        const projectCount = (
          queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
            ?.projectRoom ?? []
        ).length;
        const activityCount = teamCount + directCount + projectCount;

        context.dispatch({
          type: CHATTYPE.ACTIVITY_COUNT,
          activityCount,
          teamCount,
          directCount,
          projectCount,
        });
      }
    });
    //// seencount
    socket.on('roomProjectSeenCount', (response) => {
      const { roomId, type, userId } = response;
      console.log('seencount on acitivyty');
      const allChatRooms =
        queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
          ?.projectRoom ?? [];
      const updatedRooms: ProjectRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId && room.senderId === userId) {
          return {
            ...room,
            seenCount: 0,
          };
        }
        return room;
      });

      queryClient.setQueryData<AllAcitvitiesRoom | undefined>(
        'activitiesRoom',
        (prevData: AllAcitvitiesRoom | undefined) => {
          if (!prevData) {
            return prevData; // Return early if previous data is undefined
          }
          return {
            ...prevData,
            projectRoom: updatedRooms,
          };
        }
      );
      //   if (allChatRooms) {
      //     const teamCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.teamRooms ?? []
      //     ).length;
      //     const directCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.rooms ?? []
      //     ).length;
      //     const projectCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.projectRoom ?? []
      //     ).length;
      //     const activityCount = teamCount + directCount + projectCount;

      //     context.dispatch({
      //       type: CHATTYPE.ACTIVITY_COUNT,
      //       activityCount,
      //       teamCount,
      //       directCount,
      //       projectCount,
      //     });
      //   }
    });
    ////////////////////////////////////////////////////////////////////

    //////////////////////////////Teams//////////////////////////////////////
    ///  room update
    socket.on('directTeamRoomUpdate', (response) => {
      const { roomId, lastMessage, mimetype, type, timeStamp, senderId } =
        response;
      let val = false;
      const allChatRooms =
        queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
          ?.teamRooms ?? [];

      const exactRoom = allChatRooms.find((room) => room._id == roomId);

      if (context.state.roomDetail) {
        if (
          exactRoom?._id != context.state.roomDetail?._id &&
          !exactRoom?.isMuted
        ) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon:
              exactRoom?.participants.find((user) => user._id == senderId)
                ?.photo ??
              `data:image/svg+xml,${encodeURIComponent(` <svg
              className="w-16 h-16 p-1 min-w-[50px]"
              viewBox="0 0 50 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="25"
                cy="23.7403"
                rx="25"
                ry="23.7403"
                fill="#E2F3FF"
              />
              <path
                d="M25 13.5039C24.5408 13.5039 24.0862 13.5943 23.6619 13.7701C23.2377 13.9458 22.8523 14.2033 22.5276 14.528C22.2029 14.8527 21.9454 15.2381 21.7697 15.6624C21.5939 16.0866 21.5035 16.5412 21.5035 17.0004C21.5035 17.4596 21.5939 17.9142 21.7697 18.3385C21.9454 18.7627 22.2029 19.1481 22.5276 19.4728C22.8523 19.7975 23.2377 20.055 23.6619 20.2308C24.0862 20.4065 24.5408 20.4969 25 20.4969C25.9273 20.4969 26.8167 20.1285 27.4724 19.4728C28.1281 18.8171 28.4965 17.9277 28.4965 17.0004C28.4965 16.0731 28.1281 15.1837 27.4724 14.528C26.8167 13.8723 25.9273 13.5039 25 13.5039ZM32.875 15.2504C32.1788 15.2504 31.5111 15.527 31.0188 16.0193C30.5266 16.5115 30.25 17.1792 30.25 17.8754C30.25 18.5716 30.5266 19.2393 31.0188 19.7316C31.5111 20.2238 32.1788 20.5004 32.875 20.5004C33.5712 20.5004 34.2389 20.2238 34.7312 19.7316C35.2234 19.2393 35.5 18.5716 35.5 17.8754C35.5 17.1792 35.2234 16.5115 34.7312 16.0193C34.2389 15.527 33.5712 15.2504 32.875 15.2504ZM17.125 15.2504C16.4288 15.2504 15.7611 15.527 15.2688 16.0193C14.7766 16.5115 14.5 17.1792 14.5 17.8754C14.5 18.5716 14.7766 19.2393 15.2688 19.7316C15.7611 20.2238 16.4288 20.5004 17.125 20.5004C17.8212 20.5004 18.4889 20.2238 18.9812 19.7316C19.4734 19.2393 19.75 18.5716 19.75 17.8754C19.75 17.1792 19.4734 16.5115 18.9812 16.0193C18.4889 15.527 17.8212 15.2504 17.125 15.2504ZM19.75 23.9882C19.7532 23.5262 19.939 23.0842 20.2669 22.7586C20.5947 22.4331 21.038 22.2504 21.5 22.2504H28.5C28.9641 22.2504 29.4092 22.4348 29.7374 22.763C30.0656 23.0912 30.25 23.5363 30.25 24.0004V29.2504C30.2499 29.8012 30.1637 30.3485 29.9945 30.8727C29.607 32.0604 28.8088 33.0711 27.7432 33.7232C26.6775 34.3754 25.4143 34.6263 24.1803 34.4309C22.9464 34.2355 21.8225 33.6066 21.0105 32.6571C20.1985 31.7076 19.7516 30.4997 19.75 29.2504V23.9882ZM18 24.0004C18 23.3617 18.1698 22.7649 18.469 22.2504H14.5C14.0359 22.2504 13.5908 22.4348 13.2626 22.763C12.9344 23.0912 12.75 23.5363 12.75 24.0004V28.3754C12.7498 29.0917 12.9254 29.7971 13.2615 30.4296C13.5976 31.0622 14.0838 31.6025 14.6775 32.0032C15.2712 32.4039 15.9543 32.6527 16.6666 32.7278C17.3789 32.8028 18.0988 32.7018 18.763 32.4337C18.2593 31.4477 17.9978 30.3559 18 29.2487V24.0004ZM32 24.0004V29.2504C32 30.3967 31.7253 31.4782 31.237 32.4337C31.9012 32.7018 32.6211 32.8028 33.3334 32.7278C34.0457 32.6527 34.7288 32.4039 35.3225 32.0032C35.9162 31.6025 36.4024 31.0622 36.7385 30.4296C37.0746 29.7971 37.2502 29.0917 37.25 28.3754V24.0004C37.25 23.5363 37.0656 23.0912 36.7374 22.763C36.4092 22.4348 35.9641 22.2504 35.5 22.2504H31.531C31.8285 22.7649 32 23.3617 32 24.0004Z"
                fill="#0099FF"
              />
            </svg>`)}`,
          });
        }
      } else {
        if (!exactRoom?.isMuted) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon:
              exactRoom?.participants.find((user) => user._id == senderId)
                ?.photo ??
              `data:image/svg+xml,${encodeURIComponent(` <svg
              className="w-16 h-16 p-1 min-w-[50px]"
              viewBox="0 0 50 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="25"
                cy="23.7403"
                rx="25"
                ry="23.7403"
                fill="#E2F3FF"
              />
              <path
                d="M25 13.5039C24.5408 13.5039 24.0862 13.5943 23.6619 13.7701C23.2377 13.9458 22.8523 14.2033 22.5276 14.528C22.2029 14.8527 21.9454 15.2381 21.7697 15.6624C21.5939 16.0866 21.5035 16.5412 21.5035 17.0004C21.5035 17.4596 21.5939 17.9142 21.7697 18.3385C21.9454 18.7627 22.2029 19.1481 22.5276 19.4728C22.8523 19.7975 23.2377 20.055 23.6619 20.2308C24.0862 20.4065 24.5408 20.4969 25 20.4969C25.9273 20.4969 26.8167 20.1285 27.4724 19.4728C28.1281 18.8171 28.4965 17.9277 28.4965 17.0004C28.4965 16.0731 28.1281 15.1837 27.4724 14.528C26.8167 13.8723 25.9273 13.5039 25 13.5039ZM32.875 15.2504C32.1788 15.2504 31.5111 15.527 31.0188 16.0193C30.5266 16.5115 30.25 17.1792 30.25 17.8754C30.25 18.5716 30.5266 19.2393 31.0188 19.7316C31.5111 20.2238 32.1788 20.5004 32.875 20.5004C33.5712 20.5004 34.2389 20.2238 34.7312 19.7316C35.2234 19.2393 35.5 18.5716 35.5 17.8754C35.5 17.1792 35.2234 16.5115 34.7312 16.0193C34.2389 15.527 33.5712 15.2504 32.875 15.2504ZM17.125 15.2504C16.4288 15.2504 15.7611 15.527 15.2688 16.0193C14.7766 16.5115 14.5 17.1792 14.5 17.8754C14.5 18.5716 14.7766 19.2393 15.2688 19.7316C15.7611 20.2238 16.4288 20.5004 17.125 20.5004C17.8212 20.5004 18.4889 20.2238 18.9812 19.7316C19.4734 19.2393 19.75 18.5716 19.75 17.8754C19.75 17.1792 19.4734 16.5115 18.9812 16.0193C18.4889 15.527 17.8212 15.2504 17.125 15.2504ZM19.75 23.9882C19.7532 23.5262 19.939 23.0842 20.2669 22.7586C20.5947 22.4331 21.038 22.2504 21.5 22.2504H28.5C28.9641 22.2504 29.4092 22.4348 29.7374 22.763C30.0656 23.0912 30.25 23.5363 30.25 24.0004V29.2504C30.2499 29.8012 30.1637 30.3485 29.9945 30.8727C29.607 32.0604 28.8088 33.0711 27.7432 33.7232C26.6775 34.3754 25.4143 34.6263 24.1803 34.4309C22.9464 34.2355 21.8225 33.6066 21.0105 32.6571C20.1985 31.7076 19.7516 30.4997 19.75 29.2504V23.9882ZM18 24.0004C18 23.3617 18.1698 22.7649 18.469 22.2504H14.5C14.0359 22.2504 13.5908 22.4348 13.2626 22.763C12.9344 23.0912 12.75 23.5363 12.75 24.0004V28.3754C12.7498 29.0917 12.9254 29.7971 13.2615 30.4296C13.5976 31.0622 14.0838 31.6025 14.6775 32.0032C15.2712 32.4039 15.9543 32.6527 16.6666 32.7278C17.3789 32.8028 18.0988 32.7018 18.763 32.4337C18.2593 31.4477 17.9978 30.3559 18 29.2487V24.0004ZM32 24.0004V29.2504C32 30.3967 31.7253 31.4782 31.237 32.4337C31.9012 32.7018 32.6211 32.8028 33.3334 32.7278C34.0457 32.6527 34.7288 32.4039 35.3225 32.0032C35.9162 31.6025 36.4024 31.0622 36.7385 30.4296C37.0746 29.7971 37.2502 29.0917 37.25 28.3754V24.0004C37.25 23.5363 37.0656 23.0912 36.7374 22.763C36.4092 22.4348 35.9641 22.2504 35.5 22.2504H31.531C31.8285 22.7649 32 23.3617 32 24.0004Z"
                fill="#0099FF"
              />
            </svg>`)}`,
          });
        }
      }

      const updatedRooms: TeamRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId) {
          val = true;
          return {
            ...room,

            lastMessage: mimetype == 'text' ? lastMessage : mimetype,
            seenCount:
              context.state.roomDetail && 'senderId' in context.state.roomDetail
                ? (context.state.roomDetail as any).senderId != senderId &&
                  context.state.roomDetail._id != roomId
                  ? room.seenCount + 1
                  : 0
                : room.seenCount + 1,
            updatedAt: timeStamp,
          };
        }
        return room;
      });
      const sortedUpdatedRooms = [...updatedRooms].sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return timeB - timeA; // Sorting in descending order
      });

      if (val) {
        queryClient.setQueryData<AllAcitvitiesRoom | undefined>(
          'activitiesRoom',
          (prevData: AllAcitvitiesRoom | undefined) => {
            if (!prevData) {
              return prevData; // Return early if previous data is undefined
            }
            return {
              ...prevData,
              teamRooms: sortedUpdatedRooms,
            };
          }
        );
      } else {
        queryClient.invalidateQueries('activitiesRoom');
      }
      //   if (allChatRooms) {
      //     const teamCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.teamRooms ?? []
      //     ).length;
      //     const directCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.rooms ?? []
      //     ).length;
      //     const projectCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.projectRoom ?? []
      //     ).length;
      //     const activityCount = teamCount + directCount + projectCount;

      //     context.dispatch({
      //       type: CHATTYPE.ACTIVITY_COUNT,
      //       activityCount,
      //       teamCount,
      //       directCount,
      //       projectCount,
      //     });
      //   }
    });
    //// seencount
    socket.on('roomTeamSeenCount', (response) => {
      const { roomId, type, userId } = response;

      const allChatRooms =
        queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
          ?.teamRooms ?? [];
      const updatedRooms: TeamRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId && room.senderId === userId) {
          return {
            ...room,
            seenCount: 0,
          };
        }
        return room;
      });

      queryClient.setQueryData<AllAcitvitiesRoom | undefined>(
        'activitiesRoom',
        (prevData: AllAcitvitiesRoom | undefined) => {
          if (!prevData) {
            return prevData; // Return early if previous data is undefined
          }
          return {
            ...prevData,
            teamRooms: updatedRooms,
          };
        }
      );
      //   if (allChatRooms) {
      //     const teamCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.teamRooms ?? []
      //     ).length;
      //     const directCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.rooms ?? []
      //     ).length;
      //     const projectCount = (
      //       queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
      //         ?.projectRoom ?? []
      //     ).length;
      //     const activityCount = teamCount + directCount + projectCount;

      //     context.dispatch({
      //       type: CHATTYPE.ACTIVITY_COUNT,
      //       activityCount,
      //       teamCount,
      //       directCount,
      //       projectCount,
      //     });
      //   }
    });

    return () => {
      socket.off('userOnline');
      socket.off('directRoomUpdate');
      socket.off('roomSeenCount');
      socket.off('roomTeamSeenCount');
      socket.off('directTeamRoomUpdate');
      socket.off('roomProjectSeenCount');
      socket.off('directProjectRoomUpdate');
    };
  }, [context, notification, queryClient]);
  /// proejct rooms
  useEffect(() => {
    socket.on('directProjectRoomUpdate', (response) => {
      const { roomId, lastMessage, mimetype, type, timeStamp, senderId } =
        response;

      const allChatRooms =
        queryClient.getQueryData<ProjectRooms[]>(`projectRooms`) ?? [];
      const exactRoom = allChatRooms.find((room) => room._id == roomId);

      if (context.state.roomDetail) {
        if (
          exactRoom?._id != context.state.roomDetail?._id &&
          !exactRoom?.isMuted
        ) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon:
              exactRoom?.participants.find((user) => user._id == senderId)
                ?.photo ??
              `data:image/svg+xml,${encodeURIComponent(`<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.33334 21C1.69167 21 1.14217 20.7713 0.684835 20.314C0.227502 19.8567 -0.000775797 19.3076 1.98076e-06 18.6667V2.33334C1.98076e-06 1.69167 0.228669 1.14217 0.686002 0.684835C1.14334 0.227502 1.69245 -0.000775797 2.33334 1.98076e-06H18.6667C19.3083 1.98076e-06 19.8578 0.228669 20.3152 0.686002C20.7725 1.14334 21.0008 1.69245 21 2.33334V18.6667C21 19.3083 20.7713 19.8578 20.314 20.3152C19.8567 20.7725 19.3076 21.0008 18.6667 21H2.33334ZM8.16667 18.6667V11.6667H2.33334V18.6667H8.16667ZM10.5 18.6667H18.6667V11.6667H10.5V18.6667ZM2.33334 9.33333H18.6667V2.33334H2.33334V9.33333Z" fill="#0099FF"/>
            </svg>
            `)}`,
          });
        }
      } else {
        if (!exactRoom?.isMuted) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon:
              exactRoom?.participants.find((user) => user._id == senderId)
                ?.photo ??
              `data:image/svg+xml,${encodeURIComponent(`<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.33334 21C1.69167 21 1.14217 20.7713 0.684835 20.314C0.227502 19.8567 -0.000775797 19.3076 1.98076e-06 18.6667V2.33334C1.98076e-06 1.69167 0.228669 1.14217 0.686002 0.684835C1.14334 0.227502 1.69245 -0.000775797 2.33334 1.98076e-06H18.6667C19.3083 1.98076e-06 19.8578 0.228669 20.3152 0.686002C20.7725 1.14334 21.0008 1.69245 21 2.33334V18.6667C21 19.3083 20.7713 19.8578 20.314 20.3152C19.8567 20.7725 19.3076 21.0008 18.6667 21H2.33334ZM8.16667 18.6667V11.6667H2.33334V18.6667H8.16667ZM10.5 18.6667H18.6667V11.6667H10.5V18.6667ZM2.33334 9.33333H18.6667V2.33334H2.33334V9.33333Z" fill="#0099FF"/>
            </svg>
            `)}`,
          });
        }
      }

      const updatedRooms: ProjectRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId) {
          return {
            ...room,

            lastMessage: mimetype === 'text' ? lastMessage : mimetype,
            seenCount:
              context.state.roomDetail && 'senderId' in context.state.roomDetail
                ? (context.state.roomDetail as any).senderId != senderId &&
                  context.state.roomDetail._id != roomId
                  ? room.seenCount + 1
                  : 0
                : room.seenCount + 1,
            updatedAt: timeStamp,
          };
        }
        return room;
      });
      const sortedUpdatedRooms = [...updatedRooms].sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return timeB - timeA; // Sorting in descending order
      });

      queryClient.setQueryData<ProjectRooms[]>(
        `projectRooms`,
        sortedUpdatedRooms
      );
    });
    socket.on('roomProjectSeenCount', (response) => {
      const { roomId, type, userId } = response;
      console.log('seencount on project');
      const allChatRooms =
        queryClient.getQueryData<ProjectRooms[]>(`projectRooms`) ?? [];
      const updatedRooms: ProjectRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId && room.senderId === userId) {
          return {
            ...room,
            seenCount: 0,
          };
        }
        return room;
      });

      queryClient.setQueryData<ProjectRooms[]>(`projectRooms`, updatedRooms);
    });
    //TODO mute project chat
    socket.on('projectChatMute', (response) => {
      const { message, roomId, userId, mimeType, status } = response;
      const allChatRooms =
        queryClient.getQueryData<ProjectRooms[]>(`projectRooms`) ?? [];

      // Update context state if this is the current room (always update when roomId matches)
      if (context.state.roomDetail && roomId == context.state.roomDetail?._id) {
        const updatedRoom = {
          ...context.state.roomDetail,
          isMuted: status,
        };
        context.dispatch({
          type: CHATTYPE.UPDATEROOMDETAIL,
          roomDetail: updatedRoom,
        });
      }

      // Update rooms list if status is defined (remove senderId check for project channels)
      if (status != undefined) {
        const updatedRooms: ProjectRooms[] = allChatRooms.map((room) => {
          if (room._id === roomId) {
            return {
              ...room,
              isMuted: status,
            };
          }
          return room;
        });

        queryClient.setQueryData<ProjectRooms[]>(`projectRooms`, updatedRooms);
      }
    });

    // pinnedChatToggle
    socket.on('pinnedChatToggle', (response) => {
      const { roomId, userId, mimetype, status } = response;

      // Update context state if this is the current room (always update when roomId matches)
      if (context.state.roomDetail && roomId == context.state.roomDetail?._id) {
        const updatedRoom = {
          ...context.state.roomDetail,
          isPinned: status,
        };
        context.dispatch({
          type: CHATTYPE.UPDATEROOMDETAIL,
          roomDetail: updatedRoom,
        });
      }

      const allChatRooms =
        queryClient.getQueryData<ProjectRooms[]>(`projectRooms`) ?? [];
      // Update rooms list (remove senderId check for project channels)
      const updatedRooms: ProjectRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId) {
          return {
            ...room,
            isPinned: status,
          };
        }
        return room;
      });

      queryClient.setQueryData<ProjectRooms[]>(`projectRooms`, updatedRooms);
    });
    return () => {
      socket.off('roomProjectSeenCount');
      socket.off('projectChatMute');
      socket.off('pinnedChatToggle');
      socket.off('directProjectRoomUpdate');
    };
  }, [context, notification, queryClient]);
  /// teams rooms
  useEffect(() => {
    socket.on('directTeamRoomUpdate', (response) => {
      const { roomId, lastMessage, mimetype, type, timeStamp, senderId } =
        response;

      const allChatRooms =
        queryClient.getQueryData<TeamRooms[]>(`teamsRoom`) ?? [];
      const exactRoom = allChatRooms.find((room) => room._id == roomId);

      if (context.state.roomDetail) {
        if (
          exactRoom?._id != context.state.roomDetail?._id &&
          !exactRoom?.isMuted
        ) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon:
              exactRoom?.participants.find((user) => user._id == senderId)
                ?.photo ??
              `data:image/svg+xml,${encodeURIComponent(` <svg
            className="w-16 h-16 p-1 min-w-[50px]"
            viewBox="0 0 50 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="25"
              cy="23.7403"
              rx="25"
              ry="23.7403"
              fill="#E2F3FF"
            />
            <path
              d="M25 13.5039C24.5408 13.5039 24.0862 13.5943 23.6619 13.7701C23.2377 13.9458 22.8523 14.2033 22.5276 14.528C22.2029 14.8527 21.9454 15.2381 21.7697 15.6624C21.5939 16.0866 21.5035 16.5412 21.5035 17.0004C21.5035 17.4596 21.5939 17.9142 21.7697 18.3385C21.9454 18.7627 22.2029 19.1481 22.5276 19.4728C22.8523 19.7975 23.2377 20.055 23.6619 20.2308C24.0862 20.4065 24.5408 20.4969 25 20.4969C25.9273 20.4969 26.8167 20.1285 27.4724 19.4728C28.1281 18.8171 28.4965 17.9277 28.4965 17.0004C28.4965 16.0731 28.1281 15.1837 27.4724 14.528C26.8167 13.8723 25.9273 13.5039 25 13.5039ZM32.875 15.2504C32.1788 15.2504 31.5111 15.527 31.0188 16.0193C30.5266 16.5115 30.25 17.1792 30.25 17.8754C30.25 18.5716 30.5266 19.2393 31.0188 19.7316C31.5111 20.2238 32.1788 20.5004 32.875 20.5004C33.5712 20.5004 34.2389 20.2238 34.7312 19.7316C35.2234 19.2393 35.5 18.5716 35.5 17.8754C35.5 17.1792 35.2234 16.5115 34.7312 16.0193C34.2389 15.527 33.5712 15.2504 32.875 15.2504ZM17.125 15.2504C16.4288 15.2504 15.7611 15.527 15.2688 16.0193C14.7766 16.5115 14.5 17.1792 14.5 17.8754C14.5 18.5716 14.7766 19.2393 15.2688 19.7316C15.7611 20.2238 16.4288 20.5004 17.125 20.5004C17.8212 20.5004 18.4889 20.2238 18.9812 19.7316C19.4734 19.2393 19.75 18.5716 19.75 17.8754C19.75 17.1792 19.4734 16.5115 18.9812 16.0193C18.4889 15.527 17.8212 15.2504 17.125 15.2504ZM19.75 23.9882C19.7532 23.5262 19.939 23.0842 20.2669 22.7586C20.5947 22.4331 21.038 22.2504 21.5 22.2504H28.5C28.9641 22.2504 29.4092 22.4348 29.7374 22.763C30.0656 23.0912 30.25 23.5363 30.25 24.0004V29.2504C30.2499 29.8012 30.1637 30.3485 29.9945 30.8727C29.607 32.0604 28.8088 33.0711 27.7432 33.7232C26.6775 34.3754 25.4143 34.6263 24.1803 34.4309C22.9464 34.2355 21.8225 33.6066 21.0105 32.6571C20.1985 31.7076 19.7516 30.4997 19.75 29.2504V23.9882ZM18 24.0004C18 23.3617 18.1698 22.7649 18.469 22.2504H14.5C14.0359 22.2504 13.5908 22.4348 13.2626 22.763C12.9344 23.0912 12.75 23.5363 12.75 24.0004V28.3754C12.7498 29.0917 12.9254 29.7971 13.2615 30.4296C13.5976 31.0622 14.0838 31.6025 14.6775 32.0032C15.2712 32.4039 15.9543 32.6527 16.6666 32.7278C17.3789 32.8028 18.0988 32.7018 18.763 32.4337C18.2593 31.4477 17.9978 30.3559 18 29.2487V24.0004ZM32 24.0004V29.2504C32 30.3967 31.7253 31.4782 31.237 32.4337C31.9012 32.7018 32.6211 32.8028 33.3334 32.7278C34.0457 32.6527 34.7288 32.4039 35.3225 32.0032C35.9162 31.6025 36.4024 31.0622 36.7385 30.4296C37.0746 29.7971 37.2502 29.0917 37.25 28.3754V24.0004C37.25 23.5363 37.0656 23.0912 36.7374 22.763C36.4092 22.4348 35.9641 22.2504 35.5 22.2504H31.531C31.8285 22.7649 32 23.3617 32 24.0004Z"
              fill="#0099FF"
            />
          </svg>`)}`,
          });
        }
      } else {
        if (!exactRoom?.isMuted) {
          notification.checkPermissionAndSendnotification({
            title: exactRoom?.title ?? 'New Message',
            body: lastMessage,
            icon:
              exactRoom?.participants.find((user) => user._id == senderId)
                ?.photo ??
              `data:image/svg+xml,${encodeURIComponent(` <svg
            className="w-16 h-16 p-1 min-w-[50px]"
            viewBox="0 0 50 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="25"
              cy="23.7403"
              rx="25"
              ry="23.7403"
              fill="#E2F3FF"
            />
            <path
              d="M25 13.5039C24.5408 13.5039 24.0862 13.5943 23.6619 13.7701C23.2377 13.9458 22.8523 14.2033 22.5276 14.528C22.2029 14.8527 21.9454 15.2381 21.7697 15.6624C21.5939 16.0866 21.5035 16.5412 21.5035 17.0004C21.5035 17.4596 21.5939 17.9142 21.7697 18.3385C21.9454 18.7627 22.2029 19.1481 22.5276 19.4728C22.8523 19.7975 23.2377 20.055 23.6619 20.2308C24.0862 20.4065 24.5408 20.4969 25 20.4969C25.9273 20.4969 26.8167 20.1285 27.4724 19.4728C28.1281 18.8171 28.4965 17.9277 28.4965 17.0004C28.4965 16.0731 28.1281 15.1837 27.4724 14.528C26.8167 13.8723 25.9273 13.5039 25 13.5039ZM32.875 15.2504C32.1788 15.2504 31.5111 15.527 31.0188 16.0193C30.5266 16.5115 30.25 17.1792 30.25 17.8754C30.25 18.5716 30.5266 19.2393 31.0188 19.7316C31.5111 20.2238 32.1788 20.5004 32.875 20.5004C33.5712 20.5004 34.2389 20.2238 34.7312 19.7316C35.2234 19.2393 35.5 18.5716 35.5 17.8754C35.5 17.1792 35.2234 16.5115 34.7312 16.0193C34.2389 15.527 33.5712 15.2504 32.875 15.2504ZM17.125 15.2504C16.4288 15.2504 15.7611 15.527 15.2688 16.0193C14.7766 16.5115 14.5 17.1792 14.5 17.8754C14.5 18.5716 14.7766 19.2393 15.2688 19.7316C15.7611 20.2238 16.4288 20.5004 17.125 20.5004C17.8212 20.5004 18.4889 20.2238 18.9812 19.7316C19.4734 19.2393 19.75 18.5716 19.75 17.8754C19.75 17.1792 19.4734 16.5115 18.9812 16.0193C18.4889 15.527 17.8212 15.2504 17.125 15.2504ZM19.75 23.9882C19.7532 23.5262 19.939 23.0842 20.2669 22.7586C20.5947 22.4331 21.038 22.2504 21.5 22.2504H28.5C28.9641 22.2504 29.4092 22.4348 29.7374 22.763C30.0656 23.0912 30.25 23.5363 30.25 24.0004V29.2504C30.2499 29.8012 30.1637 30.3485 29.9945 30.8727C29.607 32.0604 28.8088 33.0711 27.7432 33.7232C26.6775 34.3754 25.4143 34.6263 24.1803 34.4309C22.9464 34.2355 21.8225 33.6066 21.0105 32.6571C20.1985 31.7076 19.7516 30.4997 19.75 29.2504V23.9882ZM18 24.0004C18 23.3617 18.1698 22.7649 18.469 22.2504H14.5C14.0359 22.2504 13.5908 22.4348 13.2626 22.763C12.9344 23.0912 12.75 23.5363 12.75 24.0004V28.3754C12.7498 29.0917 12.9254 29.7971 13.2615 30.4296C13.5976 31.0622 14.0838 31.6025 14.6775 32.0032C15.2712 32.4039 15.9543 32.6527 16.6666 32.7278C17.3789 32.8028 18.0988 32.7018 18.763 32.4337C18.2593 31.4477 17.9978 30.3559 18 29.2487V24.0004ZM32 24.0004V29.2504C32 30.3967 31.7253 31.4782 31.237 32.4337C31.9012 32.7018 32.6211 32.8028 33.3334 32.7278C34.0457 32.6527 34.7288 32.4039 35.3225 32.0032C35.9162 31.6025 36.4024 31.0622 36.7385 30.4296C37.0746 29.7971 37.2502 29.0917 37.25 28.3754V24.0004C37.25 23.5363 37.0656 23.0912 36.7374 22.763C36.4092 22.4348 35.9641 22.2504 35.5 22.2504H31.531C31.8285 22.7649 32 23.3617 32 24.0004Z"
              fill="#0099FF"
            />
          </svg>`)}`,
          });
        }
      }
      const updatedRooms: TeamRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId) {
          return {
            ...room,

            lastMessage: mimetype == 'text' ? lastMessage : mimetype,
            seenCount:
              context.state.roomDetail && 'senderId' in context.state.roomDetail
                ? (context.state.roomDetail as any).senderId != senderId &&
                  context.state.roomDetail._id != roomId
                  ? room.seenCount + 1
                  : 0
                : room.seenCount + 1,
            updatedAt: timeStamp,
          };
        }
        return room;
      });
      const sortedUpdatedRooms = [...updatedRooms].sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return timeB - timeA; // Sorting in descending order
      });

      queryClient.setQueryData<TeamRooms[]>(`teamsRoom`, sortedUpdatedRooms);
    });
    socket.on('roomTeamSeenCount', (response) => {
      const { roomId, type, userId } = response;

      const allChatRooms =
        queryClient.getQueryData<TeamRooms[]>(`teamsRoom`) ?? [];
      const updatedRooms: TeamRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId && room.senderId === userId) {
          return {
            ...room,
            seenCount: 0,
          };
        }
        return room;
      });

      queryClient.setQueryData<TeamRooms[]>(`teamsRoom`, updatedRooms);
    });
    //TODO mute team chat
    socket.on('teamChatMute', (response) => {
      const { message, roomId, userId, mimeType, status } = response;

      if (context.state.roomDetail) {
        if (roomId == context.state.roomDetail?._id) {
          const updatedRoom = {
            ...context.state.roomDetail,
            isMuted: status,
          };
          context.dispatch({
            type: CHATTYPE.UPDATEROOMDETAIL,
            roomDetail: updatedRoom,
          });
        }
      }
      if (
        context.state.roomDetail &&
        'senderId' in context.state.roomDetail &&
        (context.state.roomDetail as any).senderId === userId &&
        status != undefined
      ) {
        const allChatRooms =
          queryClient.getQueryData<TeamRooms[]>(`teamsRoom`) ?? [];
        const updatedRooms: TeamRooms[] = allChatRooms.map((room) => {
          if (room._id === roomId && room.senderId === userId) {
            return {
              ...room,
              isMuted: status,
            };
          }
          return room;
        });

        queryClient.setQueryData<TeamRooms[]>(`teamsRoom`, updatedRooms);
      }
    });
    // pinnedChatToggle
    socket.on('pinnedTeamChatToggle', (response) => {
      const { message, roomId, userId, mimeType, status } = response;

      if (context.state.roomDetail) {
        if (roomId == context.state.roomDetail?._id) {
          const updatedRoom = {
            ...context.state.roomDetail,
            isPinned: status,
          };
          context.dispatch({
            type: CHATTYPE.UPDATEROOMDETAIL,
            roomDetail: updatedRoom,
          });
        }
      }
      if (
        context.state.roomDetail &&
        'senderId' in context.state.roomDetail &&
        (context.state.roomDetail as any).senderId === userId &&
        status != undefined
      ) {
        const allChatRooms =
          queryClient.getQueryData<TeamRooms[]>(`teamsRoom`) ?? [];
        const updatedRooms: TeamRooms[] = allChatRooms.map((room) => {
          if (room._id === roomId && room.senderId === userId) {
            return {
              ...room,
              isPinned: status,
            };
          }
          return room;
        });

        queryClient.setQueryData<TeamRooms[]>(`teamsRoom`, updatedRooms);
      }
    });
    return () => {
      socket.off('roomTeamSeenCount');
      socket.off('teamChatMute');
      socket.off('directTeamRoomUpdate');
      socket.off('pinnedTeamChatToggle');
    };
  }, [context, notification, queryClient]);
  /// direct rooms
  useEffect(() => {
    /// userOnline status
    socket.on('userOnline', (response) => {
      const { userId, online } = response;
      if (
        context.state.roomDetail &&
        'participants' in context.state.roomDetail
      ) {
        const updatedRoom = {
          ...context.state.roomDetail,
          participants: (context.state.roomDetail as any).participants.map(
            (participant: any) => ({
              ...participant,
              isOnline:
                participant._id === userId ? online : participant.isOnline,
            })
          ),
        };
        context.dispatch({
          type: CHATTYPE.UPDATEROOMDETAIL,
          roomDetail: updatedRoom,
        });
      }
      const allChatRooms = queryClient.getQueryData<ChatRooms[]>(`rooms`) ?? [];
      const updatedRooms: ChatRooms[] = allChatRooms.map((room) => {
        if (room.participants[0]._id === userId) {
          return {
            ...room,
            participants: [
              {
                ...room.participants[0],
                isOnline: online,
              },
              ...room.participants.slice(1), // Keep the rest of the participants unchanged
            ],
          };
        }
        return room;
      });

      queryClient.setQueryData<ChatRooms[]>(`rooms`, updatedRooms);
    });

    socket.on('directRoomUpdate', (response) => {
      const { roomId, lastMessage, mimetype, type, timeStamp, senderId } =
        response;
      const allChatRooms = queryClient.getQueryData<ChatRooms[]>(`rooms`) ?? [];
      const exactRoom = allChatRooms.find((room) => room._id == roomId);
      if (context.state.roomDetail) {
        if (
          exactRoom?._id != context.state.roomDetail?._id &&
          !exactRoom?.isMuted
        ) {
          notification.checkPermissionAndSendnotification({
            title: `${exactRoom?.title}`,
            body: lastMessage,
            icon: exactRoom?.participants[0].photo ?? '/images/user.png',
          });
        }
      } else {
        if (!exactRoom?.isMuted) {
          notification.checkPermissionAndSendnotification({
            title: `${exactRoom?.title}`,
            body: lastMessage,
            icon: exactRoom?.participants[0].photo ?? '/images/user.png',
          });
        }
      }

      const updatedRooms: ChatRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId) {
          return {
            ...room,

            lastMessage: mimetype === 'text' ? lastMessage : mimetype,
            seenCount:
              context.state.roomDetail && 'senderId' in context.state.roomDetail
                ? (context.state.roomDetail as any).senderId != senderId &&
                  context.state.roomDetail._id != roomId
                  ? room.seenCount + 1
                  : 0
                : room.seenCount + 1,
            updatedAt: timeStamp,
          };
        }
        return room;
      });
      const sortedUpdatedRooms = [...updatedRooms].sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return timeB - timeA; // Sorting in descending order
      });

      queryClient.setQueryData<ChatRooms[]>(`rooms`, sortedUpdatedRooms);

      ////////////////////////room seen count update
    });
    socket.on('roomSeenCount', (response) => {
      const { roomId, type, userId } = response;

      console.log(response);

      const allChatRooms = queryClient.getQueryData<ChatRooms[]>(`rooms`) ?? [];
      const updatedRooms: ChatRooms[] = allChatRooms.map((room) => {
        if (room._id === roomId && room.senderId === userId) {
          return {
            ...room,
            seenCount: 0,
          };
        }
        return room;
      });

      queryClient.setQueryData<ChatRooms[]>(`rooms`, updatedRooms);
    });
    ////

    //TODO mute private chat
    socket.on('directChatMute', (response) => {
      const { message, roomId, userId, mimeType, status } = response;

      if (context.state.roomDetail) {
        if (roomId == context.state.roomDetail?._id) {
          const updatedRoom = {
            ...context.state.roomDetail,
            isMuted: status,
          };
          context.dispatch({
            type: CHATTYPE.UPDATEROOMDETAIL,
            roomDetail: updatedRoom,
          });
        }
      }
      if (
        context.state.roomDetail &&
        'senderId' in context.state.roomDetail &&
        (context.state.roomDetail as any).senderId === userId &&
        status != undefined
      ) {
        const allChatRooms =
          queryClient.getQueryData<ChatRooms[]>(`rooms`) ?? [];
        const updatedRooms: ChatRooms[] = allChatRooms.map((room) => {
          if (room._id === roomId) {
            return {
              ...room,
              isMuted: status,
            };
          }
          return room;
        });

        queryClient.setQueryData<ChatRooms[]>(`rooms`, updatedRooms);
      }
    });
    return () => {
      socket.off('userOnline');
      socket.off('directChatMute');
      socket.off('directRoomUpdate');
      socket.off('roomSeenCount');
    };
  }, [context, notification, queryClient]);

  return {};
};
export default useAllRoomSocket;
