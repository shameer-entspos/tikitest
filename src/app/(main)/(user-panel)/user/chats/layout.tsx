'use client';
import { socket } from '@/app/helpers/user/socket.helper';
import { useQueryClient } from 'react-query';
import { Message } from './api';
import {
  ChatContext,
  ChatContextProps,
  chatReducer,
  initialChatState,
} from './context';
import { useEffect, useReducer } from 'react';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';

// export const metadata = {
//   title: 'TiKi | Poeple',
//   description: 'TiKi .',
// };

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="absolute left-0 right-0 min-h-0 w-full">
      {children}
    </section>
  );
}
