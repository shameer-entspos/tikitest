import { useEffect, useState } from 'react';

const useSocketSeenCount = (
  socket: any,
  data: { userId: string; organizationId: string }
) => {
  const [seenCount, setSeenCount] = useState(0);

  useEffect(() => {
    // Emit 'check_seen_count' event every 10 seconds
    const interval = setInterval(() => {
      if (data) {
        socket.emit('check_seen_count', {
          ...data,
        });
      }
    }, 5000); // 5 seconds

    // Listener for 'check_seen_count' response
    socket.on('check_seen_count', (result: any) => {
      console.log('Seen count received:', seenCount);
      setSeenCount(result.seenCount);
      // Handle the seen count data here
    });

    // Cleanup on component unmount
    return () => {
      clearInterval(interval);
      socket.off('check_seen_count');
    };
  }, [socket, data]); // Dependencies: socket and userId
  console.log('seenCount', seenCount);
  return seenCount;
};

export default useSocketSeenCount;
