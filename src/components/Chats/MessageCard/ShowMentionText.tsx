'use client';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { useEffect } from 'react';

function ShowMentionText({
  text,
  isClickable = false,
}: {
  text: string;
  isClickable: boolean;
}) {
  const context = useChatCotnext();
  useEffect(() => {
    const handleUserClick = (userId: string) => {
      const { roomDetail } = context.state;
      // Type guard: check if roomDetail has participants property
      if (roomDetail && 'participants' in roomDetail) {
        // Fetch user details from your API using userId
        const matchingParticipant = roomDetail.participants.find(
          (participant) => participant._id === userId
        );
        if (matchingParticipant) {
          context.dispatch({
            type: CHATTYPE.SHOWPROFILE,
            roomViewProfile: {
              room: roomDetail,
              participant: matchingParticipant,
              showFrom: 'project',
            },
          });
        }
      }
    };

    if (typeof window !== 'undefined') {
      // Client-side-only code
      const originalHandleUserClick = window.handleUserClick;
      window.handleUserClick = handleUserClick;

      // Cleanup: remove the global handleUserClick when component unmounts
      return () => {
        window.handleUserClick = originalHandleUserClick;
      };
    }
  }, [context]); // Add context to the dependency array if it is used in handleUserClick

  // const renderMessageWithMentions = ({ content }: { content: string }) => {
  //   const mentionRegex = /\@\[([^\]]+)\]\(([^)]+)\)/g;
  //   const userIdRegex = /^[0-9a-fA-F]{24}$/;
  //   const urlRegex =
  //     /\bhttps?:\/\/localhost:3000\/user\/apps\/[a-fA-F0-9]{24}\/[a-fA-F0-9]{24}\/[\w-]+\b/g;

  //   // First, replace mentions with clickable links
  //   let renderedContent = content.replace(
  //     mentionRegex,
  //     (match, username, userId) =>
  //       userIdRegex.test(userId)
  //         ? isClickable
  //           ? `<a href="#" onclick="handleUserClick('${userId}')" style="color: #1976D2; text-decoration: none;">@${username}</a>`
  //           : `<span>@${username}</span>`
  //         : match
  //   );

  //   // Then, replace URLs with clickable links
  //   renderedContent = renderedContent.replace(
  //     urlRegex,
  //     (url) =>
  //       `<a href="${url}" target="_blank" style="color: #1e90ff; text-decoration: underline;">${url}</a>`
  //   );

  //   return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
  // };
  const renderMessageWithMentions = ({ content }: { content: string }) => {
    const mentionRegex = /\@\[([^\]]+)\]\(([^)]+)\)/g;
    const userIdRegex = /^[0-9a-fA-F]{24}$/;
    const urlRegex = /\bhttps?:\/\/[^\s<>"]+[^\s.,:;"')\]\s<>"]/g;

    // Replace mentions
    let renderedContent = content.replace(
      mentionRegex,
      (match, username, userId) =>
        userIdRegex.test(userId)
          ? isClickable
            ? `<a href="#" onclick="handleUserClick('${userId}')" style="color: #1976D2; text-decoration: none;">@${username}</a>`
            : `<span>@${username}</span>`
          : match
    );

    // Replace generic URLs
    renderedContent = renderedContent.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" style="color: #1e90ff; text-decoration: underline;">${url}</a>`
    );

    return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
  };

  return renderMessageWithMentions({
    content: text ?? '',
  });
}

export { ShowMentionText };
