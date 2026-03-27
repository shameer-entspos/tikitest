import { useEffect } from "react";

const useAudioRecorderHook = () => {
  useEffect(() => {
    return () => {
      alert("alert every time");
    };
  }, []);
  return {};
};
export { useAudioRecorderHook };
