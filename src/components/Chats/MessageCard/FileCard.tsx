import { Message } from "@/app/(main)/(user-panel)/user/chats/api";
import { useAttachmentDownloader } from "@/hooks/useAttachmentDownloader";
import React, { useState } from "react";
import { MdFileDownload } from "react-icons/md";

const FileCard = ({ message }: { message: Message }) => {
  const [isDownloaded] = useState(false);
  const { downloadAttachment, downloading } = useAttachmentDownloader();

  const handleDownload = () => {
    downloadAttachment(message.media?.url, message.media?.name);
  };

  return (
    <div className="md:w-96 sm:w-64 min-w-0 max-w-full pr-3">
      <div className="flex justify-between items-center">
        <span className="truncate w-24 text-xs">{message.media?.name}</span>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="cursor-pointer disabled:opacity-50"
          aria-label="Download file"
        >
          <div className="flex justify-center rounded-full bg-gray-100 w-8 h-8 items-center">
            <MdFileDownload />
          </div>
        </button>
      </div>
      {/* <DownloadButton
        url={message.media?.url ?? ""}
        fileName={message.media?.name ?? ""}
      /> */}
      {/* <div className="flex justify-between"> */}

      {/* {!isDownloaded && (
          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Download
          </button>
        )} */}
      {/* </div> */}

      {isDownloaded && <p className="text-green-500 mt-2">File downloaded!</p>}
    </div>
  );
};

export default FileCard;
