'use client';
import { APPACTIONTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import { KioskBarCode } from '@/components/Sign_Register_App/Kiosk_Bar_code';
import { KiosKModeSecondSection } from '@/components/Sign_Register_App/KiosK_Mode_Second_Section';
import ManageSites from '@/components/Sign_Register_App/Manage_Sites';
import RollCall from '@/components/Sign_Register_App/Roll_Call';
import SignInOut from '@/components/Sign_Register_App/Sign_In_Out';
import { SignInOutSecondSection } from '@/components/Sign_Register_App/Sign_In_Out_Second_Section';
import SRSignOut from '@/components/Sign_Register_App/Sign_In_Out_Sections/SR_SignOut';
import SignRegisterRecentActivity from '@/components/Sign_Register_App/sign_register_activity';
import SignRegisterMainScreen from '@/components/Sign_Register_App/Sign_Register_Main_Screen';
import { SRSetting } from '@/components/Sign_Register_App/SR_Settings/Sign_Register_Setting';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import * as Yup from 'yup';
import React, { useEffect, useReducer, useState } from 'react';
import {
  initialSRAppState,
  SRAppContext,
  SRAppContextProps,
  SRAppReducer,
} from '../sr_context';
import SRLogsPage from '@/components/Sign_Register_App/SR_Logs';
import SRKioskSignOut from '@/components/Sign_Register_App/Sign_In_Out_Sections/SR_SignOut_Second_Section';
import { KioskModeSettingsScreen } from '@/components/Sign_Register_App/Kiosk_Mode_Forms/Kiosk_Mode_Settings/Kiosk_Mode_Settings';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Switch } from '@material-tailwind/react';

import { useSession } from 'next-auth/react';
import { SimpleInput } from '@/components/Form/simpleInput';
import { useFormik } from 'formik';
import { Button } from '@/components/Buttons';
import { useMutation } from 'react-query';
import { loginKioskMode, logoutKioskMode } from '../api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import toast from 'react-hot-toast';
import Loader from '@/components/DottedLoader/loader';

const KIOSK_LOCK_KEY = 'sr_kiosk_locked';
const KIOSK_LOCK_APP_ID_KEY = 'sr_kiosk_locked_app_id';

function Page({ params }: any) {
  const appFormValidatorSchema = Yup.object().shape({
    password: Yup.string().required('Password is required'),
  });
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [lock, setLock] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const loginKioskModeMutation = useMutation(loginKioskMode, {
    onSuccess: (res) => {
      if (res) {
        lockForm.resetForm();
        toast.success('Kiosk mode enabled successfully');
        setLock(true);
        setShowLockModal(false);
        if (typeof window !== 'undefined' && params?.appId) {
          sessionStorage.setItem(KIOSK_LOCK_KEY, 'true');
          sessionStorage.setItem(KIOSK_LOCK_APP_ID_KEY, params.appId);
        }
      } else {
        toast.error('Please enter correct password');
      }
    },
    onError: () => {
      toast.error('Please enter correct password');
    },
  });

  const logoutKioskModeMutation = useMutation(logoutKioskMode, {
    onSuccess: (res) => {
      if (res) {
        unlockForm.resetForm();
        toast.success('Kiosk mode disabled');
        setLock(false);
        setShowUnlockModal(false);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(KIOSK_LOCK_KEY);
          sessionStorage.removeItem(KIOSK_LOCK_APP_ID_KEY);
        }
      } else {
        toast.error('Please enter correct password');
      }
    },
    onError: () => {
      toast.error('Please enter correct password');
    },
  });

  const lockForm = useFormik({
    initialValues: { password: '' },
    validationSchema: appFormValidatorSchema,
    onSubmit: (values) => {
      loginKioskModeMutation.mutate({ axiosAuth, password: values.password });
    },
  });

  const unlockForm = useFormik({
    initialValues: { password: '' },
    validationSchema: appFormValidatorSchema,
    onSubmit: (values) => {
      logoutKioskModeMutation.mutate({ axiosAuth, password: values.password });
    },
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !params?.appId) return;
    const stored = sessionStorage.getItem(KIOSK_LOCK_KEY);
    const storedAppId = sessionStorage.getItem(KIOSK_LOCK_APP_ID_KEY);
    if (stored === 'true' && storedAppId === params.appId) {
      setLock(true);
    }
  }, [params?.appId]);
  const isNavbarVisible = useSelector(
    (state: RootState) => state.navbar.isVisible
  );
  const router = useRouter();
  const [state, dispatch] = useReducer(SRAppReducer, initialSRAppState);
  const contextValue: SRAppContextProps = {
    state,
    dispatch,
  };

  const handleGoBack = () => {
    router.push('/user/apps'); // Navigate to apps list
  };
  const handleButtonClick = (
    pageType:
      | 'sign_in_out'
      | 'kiosk_mode'
      | 'roll_call'
      | 'manage_sites'
      | 'settings'
      | 'sign_in_out_second_section'
      | 'kiosk_mode_second_section'
  ) => {
    dispatch({
      type: SR_APP_ACTION_TYPE.SHOWPAGES,
      showPages: pageType,
    });
  };

  useEffect(() => {
    if (params.appId) {
      dispatch({
        type: SR_APP_ACTION_TYPE.APP_ID,
        sr_app_id: params.appId,
      });
    }
  }, [params.appId]);

  useEffect(() => {
    if (lock) {
      dispatch({
        type: SR_APP_ACTION_TYPE.SHOWPAGES,
        showPages: 'kiosk_mode_second_section',
      });
    }
  }, [lock]);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !lock || !params?.appId) return;
    const expectedPath = `/user/apps/sr/${params.appId}`;
    if (pathname !== expectedPath) {
      router.replace(expectedPath);
    }
  }, [lock, pathname, params?.appId, router]);

  useEffect(() => {
    const open = searchParams?.get('open');
    if (open === 'manage_sites' && params?.appId) {
      dispatch({
        type: SR_APP_ACTION_TYPE.SHOWPAGES,
        showPages: 'manage_sites',
      });
      router.replace(`/user/apps/sr/${params.appId}`, { scroll: false });
    }
  }, [params?.appId, searchParams, dispatch, router]);

  return (
    <>
      <SRAppContext.Provider value={contextValue}>
        <div
          className={`absolute inset-0 z-10 bg-white ${
            isNavbarVisible ? 'top-16 h-[calc(var(--app-vh)-70px)]' : ''
          } mx-auto w-full max-w-[1360px] overflow-y-hidden py-2`}
        >
          {state.showPages === 'kiosk_mode_second_section' ? (
            <>
              <div className="breadCrumbs flex justify-between border-b border-[#EEEEEE]">
                <span className="flex items-center gap-2 text-xl font-bold">
                  <img src="/svg/sr/logo.svg" alt="show logo" />
                  {<>Sign in Register - Kiosk</>}
                </span>

                <div className="flex gap-4">
                  <label className="mx-2 flex items-center space-x-2">
                    <span>Lock</span>
                    <Switch
                      id="custom-switch-component"
                      checked={lock}
                      className="h-full w-full bg-red-300 checked:bg-green-300"
                      containerProps={{
                        className: 'w-11 h-6',
                      }}
                      circleProps={{
                        className: 'before:hidden left-0.5 border-none',
                      }}
                      onChange={() => {
                        if (lock) {
                          setShowUnlockModal(true);
                        } else {
                          setShowLockModal(true);
                        }
                      }}
                      crossOrigin={undefined}
                    />
                  </label>
                  {!lock && (
                    <button
                      onClick={() => {
                        dispatch({
                          type: SR_APP_ACTION_TYPE.SHOWPAGES,
                        });
                      }}
                    >
                      <svg
                        width="80"
                        height="24"
                        viewBox="0 0 80 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M30.3457 11.5723H34.0781V16.5898C33.554 16.763 33.0117 16.8975 32.4512 16.9932C31.8906 17.0889 31.2617 17.1367 30.5645 17.1367C29.5482 17.1367 28.6868 16.9362 27.9805 16.5352C27.2786 16.1296 26.7454 15.5439 26.3809 14.7783C26.0163 14.0081 25.834 13.0807 25.834 11.9961C25.834 10.9525 26.0368 10.0479 26.4424 9.28223C26.848 8.51204 27.4382 7.91732 28.2129 7.49805C28.9876 7.07422 29.9264 6.8623 31.0293 6.8623C31.5716 6.8623 32.0957 6.91699 32.6016 7.02637C33.112 7.13118 33.5791 7.27702 34.0029 7.46387L33.4287 8.81738C33.0915 8.65788 32.7132 8.52344 32.2939 8.41406C31.8747 8.30469 31.4395 8.25 30.9883 8.25C30.2728 8.25 29.6553 8.40495 29.1357 8.71484C28.6208 9.02474 28.2243 9.46224 27.9463 10.0273C27.6683 10.5879 27.5293 11.251 27.5293 12.0166C27.5293 12.7594 27.641 13.4111 27.8643 13.9717C28.0876 14.5322 28.4362 14.9697 28.9102 15.2842C29.3887 15.5941 30.0062 15.749 30.7627 15.749C31.141 15.749 31.4622 15.7285 31.7266 15.6875C31.9909 15.6465 32.2347 15.6009 32.458 15.5508V12.9736H30.3457V11.5723ZM43.0059 13.1992C43.0059 13.8281 42.9238 14.3864 42.7598 14.874C42.5957 15.3617 42.3564 15.7741 42.042 16.1113C41.7275 16.444 41.3493 16.6992 40.9072 16.877C40.4652 17.0501 39.9661 17.1367 39.4102 17.1367C38.8906 17.1367 38.4144 17.0501 37.9814 16.877C37.5485 16.6992 37.1725 16.444 36.8535 16.1113C36.5391 15.7741 36.2952 15.3617 36.1221 14.874C35.9489 14.3864 35.8623 13.8281 35.8623 13.1992C35.8623 12.3652 36.0059 11.6589 36.293 11.0801C36.5846 10.4967 36.9993 10.0524 37.5371 9.74707C38.0749 9.44173 38.7152 9.28906 39.458 9.28906C40.1553 9.28906 40.7705 9.44173 41.3037 9.74707C41.8369 10.0524 42.2539 10.4967 42.5547 11.0801C42.8555 11.6634 43.0059 12.3698 43.0059 13.1992ZM37.5166 13.1992C37.5166 13.7507 37.5827 14.2223 37.7148 14.6143C37.8516 15.0062 38.0612 15.307 38.3438 15.5166C38.6263 15.7217 38.9909 15.8242 39.4375 15.8242C39.8841 15.8242 40.2487 15.7217 40.5312 15.5166C40.8138 15.307 41.0212 15.0062 41.1533 14.6143C41.2855 14.2223 41.3516 13.7507 41.3516 13.1992C41.3516 12.6478 41.2855 12.1807 41.1533 11.7979C41.0212 11.4105 40.8138 11.1165 40.5312 10.916C40.2487 10.7109 39.8818 10.6084 39.4307 10.6084C38.7653 10.6084 38.2799 10.8317 37.9746 11.2783C37.6693 11.7249 37.5166 12.3652 37.5166 13.1992ZM48.6523 7.00586H51.626C52.9157 7.00586 53.8887 7.19271 54.5449 7.56641C55.2012 7.9401 55.5293 8.58496 55.5293 9.50098C55.5293 9.88379 55.4609 10.2301 55.3242 10.54C55.1921 10.8454 54.9984 11.0983 54.7432 11.2988C54.488 11.4948 54.1735 11.627 53.7998 11.6953V11.7637C54.1872 11.832 54.5312 11.9528 54.832 12.126C55.1374 12.2992 55.3766 12.5475 55.5498 12.8711C55.7275 13.1947 55.8164 13.6139 55.8164 14.1289C55.8164 14.7396 55.6706 15.2591 55.3789 15.6875C55.0918 16.1159 54.6794 16.4417 54.1416 16.665C53.6084 16.8883 52.9749 17 52.2412 17H48.6523V7.00586ZM50.293 11.1279H51.8652C52.6081 11.1279 53.123 11.0072 53.4102 10.7656C53.6973 10.5241 53.8408 10.1709 53.8408 9.70605C53.8408 9.2321 53.6699 8.8903 53.3281 8.68066C52.9909 8.47103 52.4531 8.36621 51.7148 8.36621H50.293V11.1279ZM50.293 12.4541V15.626H52.0225C52.7881 15.626 53.3258 15.4779 53.6357 15.1816C53.9456 14.8854 54.1006 14.4844 54.1006 13.9785C54.1006 13.6686 54.0299 13.3997 53.8887 13.1719C53.752 12.944 53.5264 12.7686 53.2119 12.6455C52.8975 12.5179 52.4736 12.4541 51.9404 12.4541H50.293ZM60.6836 9.28906C61.6406 9.28906 62.363 9.50098 62.8506 9.9248C63.3428 10.3486 63.5889 11.0094 63.5889 11.9072V17H62.4473L62.1396 15.9268H62.085C61.8708 16.2002 61.6497 16.4258 61.4219 16.6035C61.194 16.7812 60.9297 16.9134 60.6289 17C60.3327 17.0911 59.9704 17.1367 59.542 17.1367C59.0908 17.1367 58.6875 17.0547 58.332 16.8906C57.9766 16.722 57.6963 16.4668 57.4912 16.125C57.2861 15.7832 57.1836 15.3503 57.1836 14.8262C57.1836 14.0469 57.473 13.4613 58.0518 13.0693C58.6351 12.6774 59.5146 12.4609 60.6904 12.4199L62.0029 12.3721V11.9756C62.0029 11.4515 61.8799 11.0778 61.6338 10.8545C61.3923 10.6312 61.0505 10.5195 60.6084 10.5195C60.2301 10.5195 59.8633 10.5742 59.5078 10.6836C59.1523 10.793 58.806 10.9274 58.4688 11.0869L57.9492 9.95215C58.3184 9.75618 58.7376 9.59668 59.207 9.47363C59.681 9.35059 60.1732 9.28906 60.6836 9.28906ZM61.9961 13.3838L61.0186 13.418C60.2165 13.4453 59.6536 13.582 59.3301 13.8281C59.0065 14.0742 58.8447 14.4115 58.8447 14.8398C58.8447 15.2135 58.9564 15.487 59.1797 15.6602C59.403 15.8288 59.6969 15.9131 60.0615 15.9131C60.6175 15.9131 61.0778 15.7559 61.4424 15.4414C61.8115 15.1224 61.9961 14.6553 61.9961 14.04V13.3838ZM68.8867 17.1367C68.1712 17.1367 67.5514 16.9977 67.0273 16.7197C66.5033 16.4417 66.0999 16.0156 65.8174 15.4414C65.5348 14.8672 65.3936 14.138 65.3936 13.2539C65.3936 12.3333 65.5485 11.5814 65.8584 10.998C66.1683 10.4147 66.5967 9.98405 67.1436 9.70605C67.695 9.42806 68.3262 9.28906 69.0371 9.28906C69.4883 9.28906 69.8962 9.33464 70.2607 9.42578C70.6299 9.51237 70.9421 9.61947 71.1973 9.74707L70.7188 11.0322C70.4408 10.9183 70.1559 10.8226 69.8643 10.7451C69.5726 10.6676 69.2923 10.6289 69.0234 10.6289C68.5814 10.6289 68.2122 10.7269 67.916 10.9229C67.6243 11.1188 67.4056 11.4105 67.2598 11.7979C67.1185 12.1852 67.0479 12.666 67.0479 13.2402C67.0479 13.7962 67.1208 14.2656 67.2666 14.6484C67.4124 15.0267 67.6289 15.3138 67.916 15.5098C68.2031 15.7012 68.5563 15.7969 68.9756 15.7969C69.3903 15.7969 69.7617 15.7467 70.0898 15.6465C70.418 15.5462 70.7279 15.4163 71.0195 15.2568V16.6514C70.7324 16.8154 70.4248 16.9362 70.0967 17.0137C69.7686 17.0957 69.3652 17.1367 68.8867 17.1367ZM74.4033 6.36328V11.5039C74.4033 11.7363 74.3942 11.9915 74.376 12.2695C74.3577 12.543 74.3395 12.8005 74.3213 13.042H74.3555C74.474 12.8825 74.6152 12.6956 74.7793 12.4814C74.9479 12.2673 75.1074 12.0804 75.2578 11.9209L77.5684 9.43262H79.4141L76.3857 12.6865L79.6123 17H77.7256L75.3057 13.6777L74.4033 14.4502V17H72.7969V6.36328H74.4033Z"
                          fill="#0063F7"
                        />
                        <path
                          d="M15 18L9 12L15 6"
                          stroke="#0063F7"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {/* </Link> */}
              </div>
            </>
          ) : (
            <div className="breadCrumbs flex justify-between p-2">
              <img src={'/svg/sr/logo_with_appName.svg'} alt="" />
              {/* <Link href={'/user/apps'}> */}
              <button
                onClick={() => {
                  if (state.showPages) {
                    dispatch({
                      type: SR_APP_ACTION_TYPE.SHOWPAGES,
                      showPages: undefined,
                    });
                  } else {
                    handleGoBack();
                  }
                }}
              >
                <svg
                  width="80"
                  height="24"
                  viewBox="0 0 80 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M30.3457 11.5723H34.0781V16.5898C33.554 16.763 33.0117 16.8975 32.4512 16.9932C31.8906 17.0889 31.2617 17.1367 30.5645 17.1367C29.5482 17.1367 28.6868 16.9362 27.9805 16.5352C27.2786 16.1296 26.7454 15.5439 26.3809 14.7783C26.0163 14.0081 25.834 13.0807 25.834 11.9961C25.834 10.9525 26.0368 10.0479 26.4424 9.28223C26.848 8.51204 27.4382 7.91732 28.2129 7.49805C28.9876 7.07422 29.9264 6.8623 31.0293 6.8623C31.5716 6.8623 32.0957 6.91699 32.6016 7.02637C33.112 7.13118 33.5791 7.27702 34.0029 7.46387L33.4287 8.81738C33.0915 8.65788 32.7132 8.52344 32.2939 8.41406C31.8747 8.30469 31.4395 8.25 30.9883 8.25C30.2728 8.25 29.6553 8.40495 29.1357 8.71484C28.6208 9.02474 28.2243 9.46224 27.9463 10.0273C27.6683 10.5879 27.5293 11.251 27.5293 12.0166C27.5293 12.7594 27.641 13.4111 27.8643 13.9717C28.0876 14.5322 28.4362 14.9697 28.9102 15.2842C29.3887 15.5941 30.0062 15.749 30.7627 15.749C31.141 15.749 31.4622 15.7285 31.7266 15.6875C31.9909 15.6465 32.2347 15.6009 32.458 15.5508V12.9736H30.3457V11.5723ZM43.0059 13.1992C43.0059 13.8281 42.9238 14.3864 42.7598 14.874C42.5957 15.3617 42.3564 15.7741 42.042 16.1113C41.7275 16.444 41.3493 16.6992 40.9072 16.877C40.4652 17.0501 39.9661 17.1367 39.4102 17.1367C38.8906 17.1367 38.4144 17.0501 37.9814 16.877C37.5485 16.6992 37.1725 16.444 36.8535 16.1113C36.5391 15.7741 36.2952 15.3617 36.1221 14.874C35.9489 14.3864 35.8623 13.8281 35.8623 13.1992C35.8623 12.3652 36.0059 11.6589 36.293 11.0801C36.5846 10.4967 36.9993 10.0524 37.5371 9.74707C38.0749 9.44173 38.7152 9.28906 39.458 9.28906C40.1553 9.28906 40.7705 9.44173 41.3037 9.74707C41.8369 10.0524 42.2539 10.4967 42.5547 11.0801C42.8555 11.6634 43.0059 12.3698 43.0059 13.1992ZM37.5166 13.1992C37.5166 13.7507 37.5827 14.2223 37.7148 14.6143C37.8516 15.0062 38.0612 15.307 38.3438 15.5166C38.6263 15.7217 38.9909 15.8242 39.4375 15.8242C39.8841 15.8242 40.2487 15.7217 40.5312 15.5166C40.8138 15.307 41.0212 15.0062 41.1533 14.6143C41.2855 14.2223 41.3516 13.7507 41.3516 13.1992C41.3516 12.6478 41.2855 12.1807 41.1533 11.7979C41.0212 11.4105 40.8138 11.1165 40.5312 10.916C40.2487 10.7109 39.8818 10.6084 39.4307 10.6084C38.7653 10.6084 38.2799 10.8317 37.9746 11.2783C37.6693 11.7249 37.5166 12.3652 37.5166 13.1992ZM48.6523 7.00586H51.626C52.9157 7.00586 53.8887 7.19271 54.5449 7.56641C55.2012 7.9401 55.5293 8.58496 55.5293 9.50098C55.5293 9.88379 55.4609 10.2301 55.3242 10.54C55.1921 10.8454 54.9984 11.0983 54.7432 11.2988C54.488 11.4948 54.1735 11.627 53.7998 11.6953V11.7637C54.1872 11.832 54.5312 11.9528 54.832 12.126C55.1374 12.2992 55.3766 12.5475 55.5498 12.8711C55.7275 13.1947 55.8164 13.6139 55.8164 14.1289C55.8164 14.7396 55.6706 15.2591 55.3789 15.6875C55.0918 16.1159 54.6794 16.4417 54.1416 16.665C53.6084 16.8883 52.9749 17 52.2412 17H48.6523V7.00586ZM50.293 11.1279H51.8652C52.6081 11.1279 53.123 11.0072 53.4102 10.7656C53.6973 10.5241 53.8408 10.1709 53.8408 9.70605C53.8408 9.2321 53.6699 8.8903 53.3281 8.68066C52.9909 8.47103 52.4531 8.36621 51.7148 8.36621H50.293V11.1279ZM50.293 12.4541V15.626H52.0225C52.7881 15.626 53.3258 15.4779 53.6357 15.1816C53.9456 14.8854 54.1006 14.4844 54.1006 13.9785C54.1006 13.6686 54.0299 13.3997 53.8887 13.1719C53.752 12.944 53.5264 12.7686 53.2119 12.6455C52.8975 12.5179 52.4736 12.4541 51.9404 12.4541H50.293ZM60.6836 9.28906C61.6406 9.28906 62.363 9.50098 62.8506 9.9248C63.3428 10.3486 63.5889 11.0094 63.5889 11.9072V17H62.4473L62.1396 15.9268H62.085C61.8708 16.2002 61.6497 16.4258 61.4219 16.6035C61.194 16.7812 60.9297 16.9134 60.6289 17C60.3327 17.0911 59.9704 17.1367 59.542 17.1367C59.0908 17.1367 58.6875 17.0547 58.332 16.8906C57.9766 16.722 57.6963 16.4668 57.4912 16.125C57.2861 15.7832 57.1836 15.3503 57.1836 14.8262C57.1836 14.0469 57.473 13.4613 58.0518 13.0693C58.6351 12.6774 59.5146 12.4609 60.6904 12.4199L62.0029 12.3721V11.9756C62.0029 11.4515 61.8799 11.0778 61.6338 10.8545C61.3923 10.6312 61.0505 10.5195 60.6084 10.5195C60.2301 10.5195 59.8633 10.5742 59.5078 10.6836C59.1523 10.793 58.806 10.9274 58.4688 11.0869L57.9492 9.95215C58.3184 9.75618 58.7376 9.59668 59.207 9.47363C59.681 9.35059 60.1732 9.28906 60.6836 9.28906ZM61.9961 13.3838L61.0186 13.418C60.2165 13.4453 59.6536 13.582 59.3301 13.8281C59.0065 14.0742 58.8447 14.4115 58.8447 14.8398C58.8447 15.2135 58.9564 15.487 59.1797 15.6602C59.403 15.8288 59.6969 15.9131 60.0615 15.9131C60.6175 15.9131 61.0778 15.7559 61.4424 15.4414C61.8115 15.1224 61.9961 14.6553 61.9961 14.04V13.3838ZM68.8867 17.1367C68.1712 17.1367 67.5514 16.9977 67.0273 16.7197C66.5033 16.4417 66.0999 16.0156 65.8174 15.4414C65.5348 14.8672 65.3936 14.138 65.3936 13.2539C65.3936 12.3333 65.5485 11.5814 65.8584 10.998C66.1683 10.4147 66.5967 9.98405 67.1436 9.70605C67.695 9.42806 68.3262 9.28906 69.0371 9.28906C69.4883 9.28906 69.8962 9.33464 70.2607 9.42578C70.6299 9.51237 70.9421 9.61947 71.1973 9.74707L70.7188 11.0322C70.4408 10.9183 70.1559 10.8226 69.8643 10.7451C69.5726 10.6676 69.2923 10.6289 69.0234 10.6289C68.5814 10.6289 68.2122 10.7269 67.916 10.9229C67.6243 11.1188 67.4056 11.4105 67.2598 11.7979C67.1185 12.1852 67.0479 12.666 67.0479 13.2402C67.0479 13.7962 67.1208 14.2656 67.2666 14.6484C67.4124 15.0267 67.6289 15.3138 67.916 15.5098C68.2031 15.7012 68.5563 15.7969 68.9756 15.7969C69.3903 15.7969 69.7617 15.7467 70.0898 15.6465C70.418 15.5462 70.7279 15.4163 71.0195 15.2568V16.6514C70.7324 16.8154 70.4248 16.9362 70.0967 17.0137C69.7686 17.0957 69.3652 17.1367 68.8867 17.1367ZM74.4033 6.36328V11.5039C74.4033 11.7363 74.3942 11.9915 74.376 12.2695C74.3577 12.543 74.3395 12.8005 74.3213 13.042H74.3555C74.474 12.8825 74.6152 12.6956 74.7793 12.4814C74.9479 12.2673 75.1074 12.0804 75.2578 11.9209L77.5684 9.43262H79.4141L76.3857 12.6865L79.6123 17H77.7256L75.3057 13.6777L74.4033 14.4502V17H72.7969V6.36328H74.4033Z"
                    fill="#0063F7"
                  />
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#0063F7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* </Link> */}
            </div>
          )}
          <div className="flex w-full flex-col gap-4 border-t-2 border-[#EEEEEE] md:flex md:flex-row">
            {state.showPages === 'kiosk_mode_second_section' ? (
              <KiosKModeSecondSection lock={lock} setLock={setLock} />
            ) : state.showPages === 'sign_in_out_second_section' ||
              state.showPages === 'sr_log' ? (
              <SignInOutSecondSection />
            ) : (
              <SignRegisterMainScreen
                handleButtonClick={handleButtonClick}
                handleGoBack={handleGoBack}
              />
            )}

            <div className="h-[calc(var(--app-vh)-70px)] w-full overflow-scroll scrollbar-hide md:w-1/2">
              {state.showPages == 'kiosk_mode_second_section' ? (
                <KioskBarCode />
              ) : state.showPages == 'sign_in_out_second_section' ? (
                <SignRegisterRecentActivity />
              ) : state.showPages == 'sr_log' ? (
                <SRLogsPage />
              ) : (
                state.showPages == undefined && <SignRegisterRecentActivity />
              )}
            </div>
          </div>

          {state.showPages == 'sign_in_out' && <SignInOut />}
          {state.showPages == 'manage_sites' && <ManageSites />}
          {state.showPages == 'settings' && <SRSetting />}
          {state.showPages == 'roll_call' && <RollCall />}
          {state.showPages == 'sr_sign_out' && <SRSignOut />}
          {state.showPages == 'kiosk_settings' && <KioskModeSettingsScreen />}
        </div>
      </SRAppContext.Provider>

      {/* Lock Kiosk Mode modal - requires password to lock */}
      <Modal
        isOpen={showLockModal}
        onOpenChange={(open) => !open && setShowLockModal(false)}
        placement="top-center"
        backdrop="blur"
        size="lg"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {() => (
            <>
              <ModalHeader className="flex flex-row items-center gap-2 px-8 py-4">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <path
                    d="M32.5 20H31.25V17.5C31.25 14.05 28.45 11.25 25 11.25C21.55 11.25 18.75 14.05 18.75 17.5V20H17.5C16.125 20 15 21.125 15 22.5V35C15 36.375 16.125 37.5 17.5 37.5H32.5C33.875 37.5 35 36.375 35 35V22.5C35 21.125 33.875 20 32.5 20ZM21.25 17.5C21.25 15.425 22.925 13.75 25 13.75C27.075 13.75 28.75 15.425 28.75 17.5V20H21.25V17.5ZM32.5 35H17.5V22.5H32.5V35ZM25 31.25C26.375 31.25 27.5 30.125 27.5 28.75C27.5 27.375 26.375 26.25 25 26.25C23.625 26.25 22.5 27.375 22.5 28.75C22.5 30.125 23.625 31.25 25 31.25Z"
                    fill="#0063F7"
                  />
                </svg>
                <div>
                  <h2 className="text-xl font-semibold">Lock Kiosk Mode</h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Prevents people from accessing other functions of the app.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody className="px-12">
                <div>
                  <p className="my-3 text-sm font-normal text-[#616161]">
                    Please enter the password for your logged in user account:
                    <span className="text-sm font-semibold">{` ${session?.user?.user?.email ?? ''}`}</span>
                  </p>
                  <SimpleInput
                    label="Password"
                    placeholder="Enter Password"
                    type="password"
                    name="password"
                    className="w-full"
                    errorMessage={lockForm.errors.password}
                    value={lockForm.values.password}
                    isTouched={lockForm.touched.password}
                    onChange={lockForm.handleChange}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="flex w-full justify-end gap-2 border-t-2 border-gray-200 pt-3">
                  <Button
                    variant="primaryOutLine"
                    onClick={() => {
                      lockForm.resetForm();
                      setShowLockModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => lockForm.submitForm()}
                  >
                    {loginKioskModeMutation.isLoading ? (
                      <Loader />
                    ) : (
                      <>Confirm</>
                    )}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Unlock Kiosk Mode modal - requires password to unlock */}
      <Modal
        isOpen={showUnlockModal}
        onOpenChange={(open) => !open && setShowUnlockModal(false)}
        placement="top-center"
        backdrop="blur"
        size="lg"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {() => (
            <>
              <ModalHeader className="flex flex-row items-center gap-2 px-8 py-4">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <path
                    d="M32.5 20H31.25V17.5C31.25 14.05 28.45 11.25 25 11.25C21.55 11.25 18.75 14.05 18.75 17.5V20H17.5C16.125 20 15 21.125 15 22.5V35C15 36.375 16.125 37.5 17.5 37.5H32.5C33.875 37.5 35 36.375 35 35V22.5C35 21.125 33.875 20 32.5 20ZM21.25 17.5C21.25 15.425 22.925 13.75 25 13.75C27.075 13.75 28.75 15.425 28.75 17.5V20H21.25V17.5ZM32.5 35H17.5V22.5H32.5V35ZM25 31.25C26.375 31.25 27.5 30.125 27.5 28.75C27.5 27.375 26.375 26.25 25 26.25C23.625 26.25 22.5 27.375 22.5 28.75C22.5 30.125 23.625 31.25 25 31.25Z"
                    fill="#0063F7"
                  />
                </svg>
                <div>
                  <h2 className="text-xl font-semibold">Unlock Kiosk Mode</h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Enter your password to unlock and access other app
                    functions.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody className="px-12">
                <div>
                  <p className="my-3 text-sm font-normal text-[#616161]">
                    Please enter the password for your logged in user account:
                    <span className="text-sm font-semibold">{` ${session?.user?.user?.email ?? ''}`}</span>
                  </p>
                  <SimpleInput
                    label="Password"
                    placeholder="Enter Password"
                    type="password"
                    name="password"
                    className="w-full"
                    errorMessage={unlockForm.errors.password}
                    value={unlockForm.values.password}
                    isTouched={unlockForm.touched.password}
                    onChange={unlockForm.handleChange}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="flex w-full justify-end gap-2 border-t-2 border-gray-200 pt-3">
                  <Button
                    variant="primaryOutLine"
                    onClick={() => {
                      unlockForm.resetForm();
                      setShowUnlockModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => unlockForm.submitForm()}
                  >
                    {logoutKioskModeMutation.isLoading ? (
                      <Loader />
                    ) : (
                      <>Unlock</>
                    )}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default Page;
