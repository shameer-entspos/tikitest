
import { useState } from "react";

const ImagePopup = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75">
      <div className="max-w-2xl w-full p-4 bg-white rounded-md">
        <img src={imageUrl} alt="Full Image" className="w-full h-auto" />
        <button
          className="absolute top-4 right-4 text-white cursor-pointer"
          onClick={() => { }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ImagePopup;
