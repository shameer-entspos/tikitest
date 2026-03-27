import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { UseStagedImageUploadsReturn } from '@/components/apps/shared/useStagedImageUploads';

export default function CameraPageSR({
  selfieUploads,
}: {
  selfieUploads: UseStagedImageUploadsReturn;
}) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedSelfie = selfieUploads.items[0];

  const stopCamera = useCallback(() => {
    setCameraStream((currentStream) => {
      currentStream?.getTracks().forEach((track) => {
        track.stop();
      });
      return null;
    });
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || selectedSelfie) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream((currentStream) => {
        currentStream?.getTracks().forEach((track) => {
          track.stop();
        });
        return stream;
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [selectedSelfie]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    stopCamera();
    selfieUploads.replaceFiles([file]);
  };

  const handleRemoveImage = () => {
    selfieUploads.clearStaged();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const captureImage = () => {
    const videoElement = document.getElementById(
      'camera-preview'
    ) as HTMLVideoElement | null;

    if (!videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], 'captured-image.jpg', {
        type: 'image/jpeg',
      });
      stopCamera();
      selfieUploads.replaceFiles([file]);
    }, 'image/jpeg');
  };

  useEffect(() => {
    if (selectedSelfie) {
      stopCamera();
      return;
    }

    void startCamera();

    return () => {
      stopCamera();
    };
  }, [selectedSelfie, startCamera, stopCamera]);

  return (
    <div className="px-5 py-2 md:px-11">
      <div className="mb-3 text-center">
        <div className="mx-auto flex h-[200px] w-[200px] items-center justify-center rounded-full bg-gray-400">
          {!selectedSelfie && cameraStream ? (
            <div className="relative mx-auto flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-full bg-[#D9D9D9]">
              <video
                autoPlay
                ref={(videoElement) => {
                  if (videoElement) {
                    videoElement.srcObject = cameraStream;
                  }
                }}
                id="camera-preview"
                className="h-full w-full scale-x-[-1] object-cover"
              />
              <button
                type="button"
                className="absolute right-[32%] top-[32%]"
                onClick={captureImage}
              >
                <svg
                  width="75"
                  height="75"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M40.7443 87.5002H59.2609C72.2651 87.5002 78.7693 87.5002 83.4401 84.4377C85.4555 83.1168 87.1912 81.4122 88.5484 79.421C91.6693 74.8377 91.6693 68.4502 91.6693 55.6835C91.6693 42.9127 91.6693 36.5294 88.5484 31.946C87.1913 29.9548 85.4556 28.2502 83.4401 26.9294C80.4401 24.9585 76.6818 24.2544 70.9276 24.0044C68.1818 24.0044 65.8193 21.9627 65.2818 19.3169C64.871 17.3788 63.8037 15.642 62.2603 14.4C60.7169 13.158 58.792 12.4869 56.8109 12.5002H43.1943C39.0776 12.5002 35.5318 15.3544 34.7234 19.3169C34.1859 21.9627 31.8234 24.0044 29.0776 24.0044C23.3276 24.2544 19.5693 24.9627 16.5651 26.9294C14.551 28.2505 12.8167 29.9551 11.4609 31.946C8.33594 36.5294 8.33594 42.9127 8.33594 55.6835C8.33594 68.4502 8.33594 74.8335 11.4568 79.421C12.8068 81.4044 14.5401 83.1085 16.5651 84.4377C21.2359 87.5002 27.7401 87.5002 40.7443 87.5002ZM50.0026 38.6377C40.4151 38.6377 32.6401 46.2669 32.6401 55.6794C32.6401 65.096 40.4151 72.7294 50.0026 72.7294C59.5901 72.7294 67.3651 65.096 67.3651 55.6835C67.3651 46.2669 59.5901 38.6377 50.0026 38.6377ZM50.0026 45.4544C44.2526 45.4544 39.5859 50.0335 39.5859 55.6835C39.5859 61.3294 44.2526 65.9085 50.0026 65.9085C55.7526 65.9085 60.4193 61.3294 60.4193 55.6835C60.4193 50.0335 55.7526 45.4544 50.0026 45.4544ZM69.6776 42.046C69.6776 40.1627 71.2318 38.6377 73.1526 38.6377H77.7776C79.6943 38.6377 81.2526 40.1627 81.2526 42.046C81.2438 42.9581 80.8733 43.8294 80.2225 44.4685C79.5717 45.1075 78.6939 45.4621 77.7818 45.4544H73.1526C72.7006 45.4588 72.2522 45.3741 71.833 45.2052C71.4137 45.0363 71.0319 44.7864 70.7092 44.4699C70.3865 44.1534 70.1293 43.7765 69.9523 43.3606C69.7753 42.9447 69.682 42.498 69.6776 42.046Z"
                    fill="#E0E0E0"
                  />
                </svg>
              </button>
            </div>
          ) : selectedSelfie ? (
            <div className="relative h-[200px] w-[200px] rounded-full">
              <Image
                src={selectedSelfie.previewUrl}
                alt="selfie"
                width={200}
                height={200}
                className="h-full overflow-hidden rounded-full object-cover"
                unoptimized
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex justify-center">
        {selectedSelfie ? (
          <span
            className="cursor-pointer text-[#0063F7]"
            onClick={handleRemoveImage}
          >
            Remove
          </span>
        ) : (
          <>
            <span
              className="cursor-pointer text-[#0063F7]"
              onClick={triggerFileInput}
            >
              + Upload Selfie
            </span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>
    </div>
  );
}
