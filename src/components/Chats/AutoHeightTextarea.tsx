import { useChatCotnext } from "@/app/(main)/(user-panel)/user/chats/context";
import { CHATTYPE } from "@/app/helpers/user/enums";

import { MentionsInput, Mention } from "react-mentions";
import React, { useRef, useEffect, ChangeEvent, useState } from "react";
import { IoAttach, IoMic } from "react-icons/io5";

export default function AutoHeightTextarea({
  handleSendMessage,
}: {
  handleSendMessage: () => void;
}) {
  ////////////////////////////
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const context = useChatCotnext();
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    context.dispatch({
      type: CHATTYPE.CHAT,
      messageController: e.target.value,
    });
  };

  return (
    <>
      <div className="flex w-auto border-none gap-2 items-center mx-6">
        <textarea
          ref={textareaRef}
          value={context.state.messageController ?? ""}
          onChange={handleChange}
          placeholder="Enter the text"
          className="resize-none  max-h-28 focus:outline-none mt-3 w-full"
          onKeyDown={(v) => {
            if (v.code === "Enter" || v.code === "NumpadEnter") {
              v.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <IoAttach
          className="text-gray-600 w-8 h-8 cursor-pointer"
          onClick={handleSendMessage}
        />
        <IoMic
          className="text-gray-600 w-8 h-8 cursor-pointer"
          onClick={handleSendMessage}
        />

        <div className="cursor-pointer" onClick={handleSendMessage}>
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24.98 13.3868L6.88001 4.25551C5.36001 3.48676 3.60001 4.81801 4.08001 6.37426L6.56001 14.5118C6.66001 14.8493 6.66001 15.1868 6.56001 15.5243L4.08001 23.6618C3.60001 25.218 5.36001 26.5493 6.88001 25.7805L24.98 16.6493C25.2888 16.4911 25.5465 16.2579 25.726 15.9742C25.9055 15.6904 26.0002 15.3666 26.0002 15.0368C26.0002 14.7069 25.9055 14.3831 25.726 14.0993C25.5465 13.8156 25.2888 13.5824 24.98 13.4243V13.3868Z"
              fill="#0063F7"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
