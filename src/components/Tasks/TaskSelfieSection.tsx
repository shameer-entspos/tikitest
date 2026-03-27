import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "../Buttons";
import Image from "next/image";
import { useTaskCotnext } from "@/app/(main)/(user-panel)/user/tasks/context";
import { TASKTYPE } from "@/app/helpers/user/enums";
import { Camera, CameraIcon } from "lucide-react";

function TaskCameraSection() {
  const context = useTaskCotnext();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    context.dispatch({
      type: TASKTYPE.SELECT_IMAGE,
      selectedSelfie: file,
    });
  };

  const captureImage = () => {
    const videoElement = document.getElementById(
      "camera-preview"
    ) as HTMLVideoElement;
    if (videoElement) {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      canvas
        .getContext("2d")!
        .drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a File object from the Blob
          const file = new File([blob], "captured-image.jpg", {
            type: "image/jpeg",
          });
          context.dispatch({
            type: TASKTYPE.SELECT_IMAGE,
            selectedSelfie: file,
          });
        }
      }, "image/jpeg");

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    }
  };
  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className=" px-0 md:px-11 ">
      <div className="text-center mt-28">
        <div className="w-[200px] h-[200px] bg-white  rounded-full flex items-center justify-center mx-auto">
          {context.state.selectedSelfie == undefined ? (
            <div className="relative   w-[200px] h-[200px] bg-[#D9D9D9]  flex items-center justify-center mx-auto rounded-full overflow-hidden">
              {cameraStream ? (
                <video
                  autoPlay
                  ref={(videoElement) => {
                    if (videoElement) {
                      videoElement.srcObject = cameraStream;
                    }
                  }}
                  id="camera-preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <CameraIcon className="w-[130px] h-[130px] text-gray-700" />
              )}
            </div>
          ) : (
            <div className="rounded-full w-[200px] h-[200px] relative">
              <Image
                src={URL.createObjectURL(context.state.selectedSelfie)}
                alt="selfie"
                width={200}
                height={200}
                className="overflow-hidden rounded-full  h-full object-cover"
              />

              {context.state.selectedSelfie != undefined ? (
                <button
                  onClick={() => {
                    startCamera();
                    context.dispatch({ type: TASKTYPE.SELECT_IMAGE });
                  }}
                  className="absolute top-[42%] right-[38%]"
                >
                  <svg
                    fill="#00ff00"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="40px"
                    height="40px"
                    viewBox="0 0 487.4 487.401"
                  >
                    <g>
                      <g>
                        <path
                          d="M438.711,179.056c-3.809,3.554-7.485,7.221-11.116,10.933c-6.21-33.555-19.778-65.638-44.463-94.257
			c-66.725-77.368-187.115-108.46-274.952-49.48C30.157,98.631-12.736,197.753,3.355,288.938
			C21.248,390.35,104.405,484.181,220.274,470.547c63.107-7.419,119.863-38.558,159.552-83.67c0.812-0.722,1.534-1.514,2.25-2.326
			c0.873-0.995,1.681-2.026,2.392-3.148c1.584-2.509,2.809-5.261,3.393-8.292l0.492-2.529c2.661-13.816-7.227-27.68-21.734-30.478
			c-8.516-1.646-16.904,0.924-22.973,6.058c-2.412,2.037-4.397,4.484-5.91,7.257c-0.335,0.624-0.752,1.198-1.036,1.854
			c-0.122-0.066-0.264-0.132-0.386-0.203c-39.248,44.95-98.559,74.412-160.152,63.013C74.351,399.222,37.952,282.073,62.234,197.377
			C83.194,124.259,152.93,50.461,240.281,68.843c52.138,10.974,105.568,47.616,125.134,96.467
			c2.041,5.098,3.788,10.217,5.302,15.366c-7.125-5.941-14.614-11.517-22.444-16.656c-12.264-8.043-27.676-9.374-38.167,2.072
			c-8.744,9.537-9.414,28.467,2.859,36.516c16.433,10.781,30.742,23.075,43.193,37.024c7.53,8.435,14.36,17.498,20.515,27.248
			c1.346,2.138,2.722,4.25,4.007,6.454c6.23,10.684,16.062,13.649,25.232,11.725c7.378-0.056,14.573-2.69,18.89-8.541
			c2.956-3.996,6.003-7.911,9.039-11.836c3.301-4.266,6.688-8.455,10.105-12.614c11.126-13.507,22.866-26.502,35.795-38.557
			C504.547,190.354,463.272,156.144,438.711,179.056z"
                        />
                      </g>
                    </g>
                  </svg>
                </button>
              ) : (
                <div></div>
              )}
            </div>
          )}
        </div>

        <div className="flex   justify-center gap-5 mt-[27px]">
          <label
            htmlFor="UploadSelfie"
            className="  cursor-pointer  text-[20px] font-bold text-[#0063F7] leading-[22px] min-w-[188px] md:min-w-[188px]  px-[10px] md:px-[20px]  rounded-lg"
          >
            Upload Selfie
            <input
              type="file"
              id="UploadSelfie"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>

      <div className="flex justify-center gap-6 py-4">
        <button
          className="text-sm sm:text-base text-primary-500 border-2 border-primary-500 w-1/2 sm:w-36 h-11 sm:h-12 rounded-lg"
          onClick={() => {
            context.dispatch({
              type: TASKTYPE.SHOW_SIGN_IN_MODEL,
              showSignIn: "form",
            });
          }}
        >
          Back
        </button>
        <button
          className="text-sm sm:text-base bg-primary-500 hover:bg-primary-600/80 text-white w-1/2 sm:w-36 h-11 sm:h-12 font-semibold rounded-lg"
          onClick={() => {
            context.dispatch({
              type: TASKTYPE.SHOW_SIGN_IN_MODEL,
              showSignIn: "projects",
            });
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export { TaskCameraSection };
