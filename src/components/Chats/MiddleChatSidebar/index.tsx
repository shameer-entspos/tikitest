'use client';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';

import { Avatar, Button } from '@nextui-org/react';
import { Plus } from 'lucide-react';

import { ReactNode, useState } from 'react';
import { IoArrowRedoSharp } from 'react-icons/io5';
import { IoArrowUndoSharp } from 'react-icons/io5';
export function MiddleChatSidebar({
  childrenBottom,
  childrenTop,
  showAddButton,
}: {
  childrenBottom: ReactNode;
  childrenTop?: ReactNode;
  showAddButton?: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const context = useChatCotnext();
  return (
    <div
      className="relative min-h-[600px] w-[100px] flex-shrink-0 border-r-2 border-gray-300 lg:flex lg:w-[398px]"
      style={{
        boxShadow: '0px 3px 7px #0000001d',
      }}
    >
      <div className={`w-full`}>
        {childrenTop}
        {childrenBottom}
      </div>

      {showAddButton}
    </div>
  );
}
