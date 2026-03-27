// context/socketContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextProps {
  children: ReactNode;
}

interface SocketContextValue {
  socket: any | null;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider: React.FC<SocketContextProps> = ({ children }) => {
  const [socket, setSocket] = useState<any | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const userId = session.user.user._id;

      // Construct the socket connection URL with the user-related data
      const newSocket = io("http://your-server-url", {
        query: { userId },
      });

      setSocket(newSocket);
    }
  }, [session]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
