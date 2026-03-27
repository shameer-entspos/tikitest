import { useAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/context";
import { APPACTIONTYPE } from "@/app/helpers/user/enums";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "../Buttons";
import Image from 'next/image';




function CameraPage() {

    const context = useAppsCotnext();
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const startCamera = async () => {

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        context.dispatch({ type: APPACTIONTYPE.SELECT_IMAGE, selectedSelfie: file })

    };

    const captureImage = () => {
        const videoElement = document.getElementById('camera-preview') as HTMLVideoElement;
        if (videoElement) {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            canvas.getContext('2d')!.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create a File object from the Blob
                    const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
                    context.dispatch({ type: APPACTIONTYPE.SELECT_IMAGE, selectedSelfie: file })
                }
            }, 'image/jpeg');

            if (cameraStream) {
                cameraStream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        }
    };
    useEffect(() => {
        startCamera()
    }, [])  

    return (
        <div className=" px-5 md:px-11 py-5">
        <div className="text-center my-20">
            <div className="w-[200px] h-[200px] bg-white rounded-full flex items-center justify-center mx-auto">
                {
                    context.state.selectedSelfie == undefined ?
                        <div className="relative  w-[200px] h-[200px] bg-[#D9D9D9] flex items-center justify-center mx-auto rounded-full overflow-hidden ">
                            {cameraStream ? <video
                                autoPlay
                                ref={(videoElement) => {
                                    if (videoElement) {
                                        videoElement.srcObject = cameraStream;
                                    }
                                }}
                                id="camera-preview"
                                className="w-full h-full object-cover"
                            /> : <svg className="ml-2" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                                <path d="M79.1668 33.332V24.9987H70.8334V16.6654H79.1668V8.33203H87.5001V16.6654H95.8334V24.9987H87.5001V33.332H79.1668ZM12.5001 91.6654C10.2084 91.6654 8.24592 90.8487 6.61259 89.2154C4.97926 87.582 4.16398 85.6209 4.16676 83.332V33.332C4.16676 31.0404 4.98342 29.0779 6.61676 27.4445C8.25009 25.8112 10.2112 24.9959 12.5001 24.9987H25.6251L33.3334 16.6654H58.3334V24.9987H36.9793L29.3751 33.332H12.5001V83.332H79.1668V45.832H87.5001V83.332C87.5001 85.6237 86.6834 87.5862 85.0501 89.2195C83.4168 90.8529 81.4556 91.6682 79.1668 91.6654H12.5001ZM45.8334 77.082C51.0418 77.082 55.4695 75.2584 59.1168 71.6112C62.764 67.964 64.5862 63.5376 64.5834 58.332C64.5834 53.1237 62.7598 48.6959 59.1126 45.0487C55.4654 41.4015 51.039 39.5793 45.8334 39.582C40.6251 39.582 36.1973 41.4056 32.5501 45.0529C28.9029 48.7001 27.0806 53.1265 27.0834 58.332C27.0834 63.5404 28.907 67.9681 32.5543 71.6154C36.2015 75.2626 40.6279 77.0848 45.8334 77.082ZM45.8334 68.7487C42.9168 68.7487 40.4515 67.7418 38.4376 65.7279C36.4237 63.714 35.4168 61.2487 35.4168 58.332C35.4168 55.4154 36.4237 52.9501 38.4376 50.9362C40.4515 48.9223 42.9168 47.9154 45.8334 47.9154C48.7501 47.9154 51.2154 48.9223 53.2293 50.9362C55.2431 52.9501 56.2501 55.4154 56.2501 58.332C56.2501 61.2487 55.2431 63.714 53.2293 65.7279C51.2154 67.7418 48.7501 68.7487 45.8334 68.7487Z" fill="#616161" />
                            </svg>
                            }


                        </div>

                        :
                        <div className="rounded-full w-[200px] h-[200px] relative">
                            <Image src={
                                URL.createObjectURL(context.state.selectedSelfie) }
                                alt="selfie"
                                width={200}
                                height={200}
                                className="overflow-hidden rounded-full h-full object-cover"/>

                {context.state.selectedSelfie != undefined ? <button className="absolute top-[42%] right-[38%]" onClick={() => {
                    startCamera();
                    context.dispatch({ type: APPACTIONTYPE.SELECT_IMAGE });
                }} ><svg fill="#B4B4B4" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                width="40px" height="40px" viewBox="0 0 487.4 487.401"
            >
                <g>
                    <g>
                        <path d="M438.711,179.056c-3.809,3.554-7.485,7.221-11.116,10.933c-6.21-33.555-19.778-65.638-44.463-94.257
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
C504.547,190.354,463.272,156.144,438.711,179.056z"/>
                    </g>
                </g>
            </svg> </button> : <div></div>}
                        </div>
                }
            </div>
            <div className="flex  justify-center flex-col  items-center ">

            {context.state.selectedSelfie === undefined ?  <button onClick={captureImage} className="absolute top-[40%] right-[45%]">
            <svg fill="#0063F7" height="40px" width="40px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"  
	 viewBox="0 0 487 487" >
<g>
	<g>
		<path d="M308.1,277.95c0,35.7-28.9,64.6-64.6,64.6s-64.6-28.9-64.6-64.6s28.9-64.6,64.6-64.6S308.1,242.25,308.1,277.95z
			 M440.3,116.05c25.8,0,46.7,20.9,46.7,46.7v122.4v103.8c0,27.5-22.3,49.8-49.8,49.8H49.8c-27.5,0-49.8-22.3-49.8-49.8v-103.9
			v-122.3l0,0c0-25.8,20.9-46.7,46.7-46.7h93.4l4.4-18.6c6.7-28.8,32.4-49.2,62-49.2h74.1c29.6,0,55.3,20.4,62,49.2l4.3,18.6H440.3z
			 M97.4,183.45c0-12.9-10.5-23.4-23.4-23.4c-13,0-23.5,10.5-23.5,23.4s10.5,23.4,23.4,23.4C86.9,206.95,97.4,196.45,97.4,183.45z
			 M358.7,277.95c0-63.6-51.6-115.2-115.2-115.2s-115.2,51.6-115.2,115.2s51.6,115.2,115.2,115.2S358.7,341.55,358.7,277.95z"/>
	</g>
</g>
</svg>
                </button>  : <div></div>}
               

                <label htmlFor="UploadSelfie" className=" mt-[30px]  cursor-pointer  text-base font-bold text-[#0063F7] leading-[22px] ">Upload Selfie
                    <input type="file" id="UploadSelfie" className="hidden" onChange={handleImageChange} />
                </label>
            </div>

        </div>
        <div className=" flex justify-center gap-10  flex-col">
            <h1 className="mx-auto text-[#212121] text-sm mt-4 font-medium">Please take off sunglasses, masks, caps etc when taking a photo.</h1>
            <div className="flex justify-center gap-5 mt-[18px] mb-10 ">

                <button className="  text-xs md:text-sm font-bold text-[#0063F7] border-3  border-[#0063F7] leading-[22px] w-[120px]  md:min-w-[188px] py-[8px] px-[20px] h-[47px] rounded-lg mt-[24px] " onClick={() => { context.dispatch({ type: APPACTIONTYPE.CHANGESHOWMODEL, showForm: 'user' }) }}>Back</button>
                <button className=" text-[12px] md:text-sm bg-[#0063F7] font-bold text-white leading-[22px] w-[120px]  md:min-w-[188px] py-[8px] px-[10px] md:px-[20px] h-[47px] rounded-lg mt-[24px] " onClick={() => { context.dispatch({ type: APPACTIONTYPE.CHANGESHOWMODEL, showForm: 'projects' }) }}>Next</button>

            </div>
        </div>
    </div>
    )
}



export { CameraPage }