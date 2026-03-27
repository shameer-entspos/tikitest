import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import { useState } from 'react';
import SignInModel from './Models/Sign_In_Out_Models';

export function SignInOutSecondSection() {
  const [showSignIn, setSignIn] = useState(false);
  const handleShowModel = () => setSignIn(!showSignIn);
  const { state, dispatch } = useSRAppCotnext();
  return (
    <>
      <div className="h-[calc(var(--app-vh)- 151px)] flex w-full max-w-[668px] flex-col gap-5 overflow-auto border-[#EEEEEE] pl-5 pr-12 pt-5 lg:border-r-2">
        <div className="grid w-full grid-cols-2 gap-5">
          <div className="w-full cursor-pointer" onClick={handleShowModel}>
            <div className="inline-flex w-full max-w-[290px] items-end justify-between gap-[45px] self-stretch rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow">
              <div className="text-base font-semibold text-[#1e1e1e]">
                Sign In
              </div>
              <div className="relative flex flex-col items-start justify-start">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.6465 13.0534L14.6152 20.0846C14.506 20.194 14.3667 20.2685 14.2151 20.2987C14.0635 20.3289 13.9063 20.3134 13.7634 20.2542C13.6206 20.195 13.4986 20.0948 13.4127 19.9662C13.3269 19.8376 13.2811 19.6865 13.2812 19.5319V13.2819H3.90625C3.69905 13.2819 3.50034 13.1996 3.35382 13.053C3.20731 12.9065 3.125 12.7078 3.125 12.5006C3.125 12.2934 3.20731 12.0947 3.35382 11.9482C3.50034 11.8017 3.69905 11.7194 3.90625 11.7194H13.2812V5.46937C13.2811 5.31476 13.3269 5.16359 13.4127 5.035C13.4986 4.90642 13.6206 4.80619 13.7634 4.747C13.9063 4.68782 14.0635 4.67235 14.2151 4.70255C14.3667 4.73274 14.506 4.80725 14.6152 4.91663L21.6465 11.9479C21.7191 12.0204 21.7767 12.1066 21.8161 12.2014C21.8554 12.2963 21.8756 12.3979 21.8756 12.5006C21.8756 12.6033 21.8554 12.7049 21.8161 12.7998C21.7767 12.8946 21.7191 12.9808 21.6465 13.0534Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div
            className="w-full cursor-pointer"
            onClick={() => {
              dispatch({
                type: SR_APP_ACTION_TYPE.SHOWPAGES,
                showPages: 'sr_sign_out',
              });
            }}
          >
            <div className="inline-flex w-full max-w-[290px] items-end justify-between gap-[45px] self-stretch rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow">
              <div className="text-base font-semibold text-[#1e1e1e]">
                Sign Out
              </div>
              <div className="relative flex flex-col items-start justify-start">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.6465 13.0534L14.6152 20.0846C14.506 20.194 14.3667 20.2685 14.2151 20.2987C14.0635 20.3289 13.9063 20.3134 13.7634 20.2542C13.6206 20.195 13.4986 20.0948 13.4127 19.9662C13.3269 19.8376 13.2811 19.6865 13.2812 19.5319V13.2819H3.90625C3.69905 13.2819 3.50034 13.1996 3.35382 13.053C3.20731 12.9065 3.125 12.7078 3.125 12.5006C3.125 12.2934 3.20731 12.0947 3.35382 11.9482C3.50034 11.8017 3.69905 11.7194 3.90625 11.7194H13.2812V5.46937C13.2811 5.31476 13.3269 5.16359 13.4127 5.035C13.4986 4.90642 13.6206 4.80619 13.7634 4.747C13.9063 4.68782 14.0635 4.67235 14.2151 4.70255C14.3667 4.73274 14.506 4.80725 14.6152 4.91663L21.6465 11.9479C21.7191 12.0204 21.7767 12.1066 21.8161 12.2014C21.8554 12.2963 21.8756 12.3979 21.8756 12.5006C21.8756 12.6033 21.8554 12.7049 21.8161 12.7998C21.7767 12.8946 21.7191 12.9808 21.6465 13.0534Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center">
          <div
            className="w-full cursor-pointer"
            onClick={() => {
              dispatch({
                type: SR_APP_ACTION_TYPE.SHOWPAGES,
                showPages: 'sr_log',
              });
            }}
          >
            <div className="inline-flex w-full max-w-[290px] items-end justify-between gap-[45px] self-stretch rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow">
              <div className="text-base font-semibold text-[#1e1e1e]">
                Logbook
              </div>
              <div className="relative flex flex-col items-start justify-start">
                <svg
                  width="22"
                  height="19"
                  viewBox="0 0 22 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.8141 0.124729C7.51202 -0.021104 3.16827 4.23931 3.16827 9.49973H1.30368C0.834932 9.49973 0.605765 10.0622 0.939098 10.3851L3.84535 13.3018C4.05368 13.5101 4.3766 13.5101 4.58493 13.3018L7.49118 10.3851C7.56316 10.3117 7.6118 10.2186 7.63096 10.1176C7.65011 10.0166 7.63894 9.91212 7.59883 9.81743C7.55873 9.72274 7.4915 9.64205 7.40561 9.58551C7.31972 9.52897 7.21901 9.49913 7.11618 9.49973H5.2516C5.2516 5.43723 8.5641 2.15598 12.6474 2.20806C16.5224 2.26015 19.7829 5.52056 19.8349 9.39556C19.887 13.4685 16.6058 16.7914 12.5433 16.7914C10.8662 16.7914 9.3141 16.2185 8.08493 15.2497C7.88542 15.0926 7.63509 15.0142 7.38156 15.0296C7.12804 15.0449 6.88901 15.1529 6.70993 15.3331C6.27243 15.7706 6.30368 16.5101 6.79327 16.8851C8.42993 18.1792 10.4568 18.8806 12.5433 18.8747C17.8037 18.8747 22.0641 14.531 21.9183 9.2289C21.7829 4.34348 17.6995 0.260146 12.8141 0.124729ZM12.2828 5.33306C11.8558 5.33306 11.5016 5.68723 11.5016 6.11431V9.94765C11.5016 10.3122 11.6995 10.656 12.012 10.8435L15.262 12.7706C15.637 12.9893 16.1162 12.8643 16.3349 12.4997C16.5537 12.1247 16.4287 11.6456 16.0641 11.4268L13.0641 9.64556V6.1039C13.0641 5.68723 12.7099 5.33306 12.2828 5.33306Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div
            className="flex w-full cursor-pointer justify-start pl-12"
            onClick={() => {
              dispatch({
                type: SR_APP_ACTION_TYPE.SHOWPAGES,
              });
            }}
          >
            <img
              src="/svg/timesheet_app/arrow_with_back.svg"
              alt="arrow_with_back"
            />
            <div></div>
          </div>
        </div>
      </div>
      {showSignIn && <SignInModel handleClose={handleShowModel} />}
    </>
  );
}
