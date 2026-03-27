import React, { useState, ChangeEvent } from "react";

interface PhotoUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  maxPhotos: number;
}

const PhotoUploadPopup: React.FC<PhotoUploadPopupProps> = ({
  isOpen,
  onClose,
  onUpload,
  maxPhotos,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadDisabled, setIsUploadDisabled] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files as FileList);
    if (selectedFiles.length + files.length > maxPhotos) {
      // Prevent adding more files than the maximum allowed.
      return;
    }
    setSelectedFiles([...selectedFiles, ...files]);
    if (selectedFiles.length + files.length === maxPhotos) {
      setIsUploadDisabled(false);
    }
  };

  const handleRemoveFile = (file: File) => {
    const updatedFiles = selectedFiles.filter(
      (selectedFile) => selectedFile !== file
    );
    setSelectedFiles(updatedFiles);
    if (updatedFiles.length < maxPhotos) {
      setIsUploadDisabled(false);
    }
  };

  const handleUpload = () => {
    // You can implement your file upload logic here, e.g., using the FormData API and sending the files to your server.
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white p-4 max-w-md w-full rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Upload Photos (Max {maxPhotos})
        </h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
          multiple
        />
        <div className="grid grid-cols-3 gap-4 mb-4">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Selected Photo ${index + 1}`}
                className="w-full h-24 object-cover rounded"
              />
              <button
                onClick={() => handleRemoveFile(file)}
                className="absolute top-2 right-2 text-red-500 bg-white p-1 rounded-full"
              >
                X
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploadDisabled}
          className={`${
            selectedFiles.length === 0 || isUploadDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          } text-white font-semibold py-2 px-4 rounded`}
        >
          Upload
        </button>
        <button
          onClick={onClose}
          className="bg-gray-400 hover-bg-gray-600 text-white font-semibold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PhotoUploadPopup;
