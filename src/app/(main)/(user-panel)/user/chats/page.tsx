'use client';

import Chats from '@/components/Chats';

import React, { Suspense } from 'react';
import { useReducer } from 'react';
import {
  ChatContext,
  ChatContextProps,
  chatReducer,
  initialChatState,
} from './context';
import Loader from '@/components/DottedLoader/loader';

function ChatsContent() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const contextValue: ChatContextProps = {
    state,
    dispatch,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      <Chats />
    </ChatContext.Provider>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <ChatsContent />
    </Suspense>
  );
}
