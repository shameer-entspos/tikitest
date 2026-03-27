import {
  chatReducer,
  initialChatState,
  ChatContextProps,
  ChatContext,
} from '@/app/(main)/(user-panel)/user/chats/context';
import { useDisclosure } from '@nextui-org/react';
import { useReducer } from 'react';
import { AddFriend } from '../Chats/AddFriend';
import { Project } from '../Chats/Project';
import { ProjectEditChannel } from '../Chats/ProjectEditChannel';
import { ShowTeamMembers } from '../Chats/Teams/TeamMembers';
import { TeamWarningDialog } from '../Chats/WrningDIalog';
import { ProjectDetail } from '@/app/type/projects';
import useAllRoomSocket from '@/app/(main)/(user-panel)/user/chats/useAllRoomSocket';

// Wrapper component to initialize socket inside the context provider
function ProjectChannelContent({
  projectDetail,
}: {
  projectDetail: ProjectDetail | undefined;
}) {
  // Initialize socket listeners for project channels (required for pin/mute to work)
  // This must be called inside the ChatContext.Provider so it can access the correct context
  useAllRoomSocket();

  return (
    <div className="shadow-m rounded-xl bg-white">
      <Project isFromProject={true} projectId={projectDetail?._id} />
    </div>
  );
}

export function ProjectChannelTab({
  projectDetail,
}: {
  projectDetail: ProjectDetail | undefined;
}) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const contextValue: ChatContextProps = {
    state,
    dispatch,
  };

  const { onOpenChange } = useDisclosure();
  return (
    <ChatContext.Provider value={contextValue}>
      {state.showMembers === 'project' && (
        <ShowTeamMembers isOpen={true} onOpenChange={onOpenChange} />
      )}
      {state.showEditformType === 'project' && (
        <ProjectEditChannel isOpen={true} onOpenChange={onOpenChange} />
      )}
      {state.showModel && <AddFriend />}
      {state.warningPayload && (
        <TeamWarningDialog isOpen={true} onOpenChange={onOpenChange} />
      )}
      <ProjectChannelContent projectDetail={projectDetail} />
    </ChatContext.Provider>
  );
}
