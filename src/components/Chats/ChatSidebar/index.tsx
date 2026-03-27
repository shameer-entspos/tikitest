import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import useSidebar from '@/app/(main)/(user-panel)/user/chats/useSidebar';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { AppDispatch, RootState } from '@/store';
import { setSection } from '@/store/contactSlice';
import { Badge } from '@nextui-org/react';
import { useEffect } from 'react';
import { AiFillMessage, AiOutlineMessage } from 'react-icons/ai';
import { RiNotification4Fill, RiNotificationLine } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';

export function ChatSidebar() {
  const context = useChatCotnext();

  // const side = useSidebar();
  return (
    <>
      <div
        className="flex h-full min-h-0 w-16 flex-col space-y-6 bg-primary-50 p-2 pt-6 sm:min-w-20"
        style={{
          boxShadow: '5px 0px 8px #0000001d',
        }}
      >
        <div
          className="mx-auto flex cursor-pointer flex-col items-center"
          onClick={() => {
            context.dispatch({ type: CHATTYPE.CHANGETAB, chatTab: 'activity' });
          }}
        >
          <Badge
            content={
              context.state.activityCount != undefined
                ? context.state.activityCount > 0 && context.state.activityCount
                : false
            }
            size="sm"
            shape="circle"
            className="border-none bg-primary-400 text-xs text-white"
          >
            {context.state.chatTab == 'activity' ? (
              <img
                src="/images/contact/fill_notification.png"
                alt="fill_notification"
                className="h-[40px] w-[40px] text-primary-500"
              />
            ) : (
              <img
                src="/images/contact/notification.png"
                alt="fill_notification"
                className="h-[40px] w-[40px] text-primary-500"
              />
            )}
          </Badge>

          <h1 className="mt-[6px] text-xs font-medium text-[#0099FF] sm:text-sm">
            Activity
          </h1>
        </div>
        {/* /// div of direct */}
        <div
          className="mx-auto flex cursor-pointer flex-col items-center"
          onClick={() => {
            context.dispatch({ type: CHATTYPE.CHANGETAB, chatTab: 'direct' });
          }}
        >
          <Badge
            content={
              context.state.directCount != undefined
                ? context.state.directCount > 0 && context.state.directCount
                : false
            }
            size="sm"
            shape="circle"
            className="border-none bg-primary-400 text-xs text-white"
          >
            {context.state.chatTab == 'direct' ? (
              <img
                src="/images/contact/fill_chat.png"
                alt="fill_chat"
                className="h-[40px] w-[40px] text-primary-500"
              />
            ) : (
              <img
                src="/images/contact/chat.png"
                alt="chat"
                className="h-[40px] w-[40px] text-primary-500"
              />
            )}
          </Badge>

          <h1 className="mt-[6px] text-xs text-[#0099FF] sm:text-sm">Direct</h1>
        </div>
        {/* teams */}
        <div
          className="mx-auto flex cursor-pointer flex-col items-center"
          onClick={() => {
            context.dispatch({ type: CHATTYPE.CHANGETAB, chatTab: 'team' });
          }}
        >
          <Badge
            content={
              context.state.teamCount != undefined
                ? context.state.teamCount > 0 && context.state.teamCount
                : false
            }
            size="sm"
            shape="circle"
            className="border-none bg-primary-400 text-xs text-white"
          >
            {context.state.chatTab == 'team' ? (
              <img
                src="/images/contact/fill_team.png"
                alt="fill_team"
                className="h-[40px] w-[40px] text-primary-500"
              />
            ) : (
              <img
                src="/images/contact/team.png"
                alt="team"
                className="h-[40px] w-[40px] text-primary-500"
              />
            )}
          </Badge>

          <h1 className="mt-[6px] text-xs text-[#0099FF] sm:text-sm">Teams</h1>
        </div>
        {/* project  */}
        <div
          className="mx-auto flex cursor-pointer flex-col items-center justify-center"
          onClick={() => {
            context.dispatch({ type: CHATTYPE.CHANGETAB, chatTab: 'project' });
          }}
        >
          <Badge
            content={
              context.state.projectCount != undefined
                ? context.state.projectCount > 0 && context.state.projectCount
                : false
            }
            size="sm"
            shape="circle"
            className="border-none bg-primary-400 text-xs text-white"
          >
            {context.state.chatTab == 'project' ? (
              <img
                src="/images/contact/fill_project.png"
                alt="fill_project"
                className="h-[40px] w-[40px] text-primary-500"
              />
            ) : (
              <img
                src="/images/contact/project.png"
                alt="project"
                className="h-[40px] w-[40px] text-primary-500"
              />
            )}
          </Badge>
          <h1 className="mt-[6px] text-xs text-[#0099FF] sm:text-sm">
            Projects
          </h1>
        </div>
        {/* contact  */}
        <div
          className="mx-auto flex cursor-pointer flex-col items-center"
          onClick={() => {
            context.dispatch({ type: CHATTYPE.CHANGETAB, chatTab: 'contact' });
          }}
        >
          {context.state.chatTab == 'contact' ? (
            <img
              src="/images/contact/fill_contact.png"
              alt="fill_contact"
              className="h-[40px] w-[40px] text-primary-500"
            />
          ) : (
            <img
              src="/images/contact/contact.png"
              alt="contact"
              className="h-[40px] w-[40px] text-primary-500"
            />
          )}

          <h1 className="mt-[6px] text-xs text-[#0099FF] sm:text-sm">
            Contacts
          </h1>
        </div>
      </div>
    </>
  );
}

function checkSidebarColor({ tabName }: { tabName: String }) {
  switch (tabName) {
    case 'activity':
      return;
      break;

    default:
      break;
  }
}
