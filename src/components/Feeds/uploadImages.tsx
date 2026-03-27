/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePostCotnext } from "@/app/(main)/(user-panel)/user/feeds/context";
import { POSTTYPE } from "@/app/helpers/user/enums";


const ImageUpload = () => {
  const context = usePostCotnext();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Ensure total selected files don't exceed 5
      const remainingSlots = 5 - (context.state.selectedImages! ?? []).length;
      const filesToAdd = Math.min(remainingSlots, files.length);

      // Add selected files
      for (let i = 0; i < filesToAdd; i++) {
        context.dispatch({
          type: POSTTYPE.SELCTIMAGE,
          selectedImages: files[i],
        });
      }
    }
  };

  const isAddImagesDisabled = (context.state.selectedImages! ?? []).length >= 5;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {(context.state.selectedImages! ?? []).map((image, index) => (
          <div key={index} className="relative aspect-w-1 aspect-h-1">
            <div
              className="relative"
              style={{ width: "100%", height: 0, paddingBottom: "100%" }} // Force a 1:1 aspect ratio
            >
              <img
                src={URL.createObjectURL(image)}
                alt={`Selected ${index + 1}`}
                className="absolute w-full h-full object-cover"
              />{" "}
            </div>
            <button
              onClick={() => {
                context.dispatch({
                  type: POSTTYPE.DESELCTIMAGE,
                  deletetedImageIndex: index,
                });
              }}
              className="bg-primary-500 text-white w-6 h-6 rounded-full absolute top-2 right-2"
            >
              x
            </button>
          </div>
        ))}
      </div>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
          multiple
          disabled={isAddImagesDisabled}
        />
        <label
          htmlFor="image-upload"
          className={`${
            isAddImagesDisabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }  bg-gray-400 text-white py-2 px-4 rounded-lg`}
        >
          Select Images (max 5)
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;
