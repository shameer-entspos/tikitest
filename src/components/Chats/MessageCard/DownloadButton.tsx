// components/DownloadButton.tsx

import axios from "axios";
import React from "react";
import fs from "fs";
interface DownloadButtonProps {
  url: string;
  fileName: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ url, fileName }) => {
  const handleDownload = async () => {
    try {
      //   const response = await axios.get(url, { responseType: "arraybuffer" });
      const response = await fetch(url);

      console.log("PDF file saved!" + response);
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={handleDownload}>Download {fileName}</button>;
};

export default DownloadButton;
