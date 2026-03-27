import { io } from "socket.io-client";

export const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
  autoConnect: false,
});
export const chatSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/chatRoom`, {
  autoConnect: true,
});
