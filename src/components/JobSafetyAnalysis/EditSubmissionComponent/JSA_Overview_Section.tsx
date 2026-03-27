import {
  getJSASingleSubmissionDetail,
  JSAAppModel,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import Loader from '@/components/DottedLoader/loader';
import useAxiosAuth from '@/hooks/AxiosAuth';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { toast } from 'react-hot-toast';
import { useQuery } from 'react-query';

import React from 'react';
import { getLastSegment } from '../CreateNewComponents/JSA_Upload_IMG';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';

export function JSAOverviewSection({
  data,
  contentRef,
}: {
  data: JSAAppModel | undefined;
  contentRef: RefObject<HTMLDivElement>;
}) {
  const context = useJSAAppsCotnext();
  const { data: session } = useSession();

  const axiosAuth = useAxiosAuth();
  const accessToken = session?.user?.accessToken;
  const textRef = useRef<HTMLParagraphElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const rawImages = (data?.images ?? []) as string[];
  const [resolvedUrls, setResolvedUrls] = useState<string[] | null>(null);

  useEffect(() => {
    if (!rawImages.length || !accessToken?.trim()) {
      setResolvedUrls(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, rawImages, accessToken).then((urls) => {
      if (!cancelled && urls && urls.length === rawImages.length)
        setResolvedUrls(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [rawImages.join('|'), accessToken, axiosAuth]);

  const images = resolvedUrls ?? rawImages;
  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;
  const hasMultiple = images.length > 1;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? Math.max(0, i - 1) : null));
  }, []);
  const goNext = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? Math.min(images.length - 1, i + 1) : null
    );
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (hasMultiple && e.key === 'ArrowLeft') goPrev();
      if (hasMultiple && e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, hasMultiple, closeLightbox, goPrev, goNext]);

  const copyText = () => {
    if (textRef.current) {
      const textToCopy = textRef.current.innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success('Submission ID copied successfully');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };
  const nameRef = useRef<HTMLParagraphElement>(null);

  const copyNameText = () => {
    if (textRef.current) {
      const textToCopy = textRef.current.innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success('Name copied successfully');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <>
      <div className="h-full overflow-auto scrollbar-hide" ref={contentRef}>
        {/* First Container  */}
        <div className="mx-4 my-1 grid grid-cols-3 justify-between gap-3">
          {/* form top  */}
          {/* 1st */}
          <div
            className="mb-4 flex flex-col gap-4 rounded-[10px] border border-[#0063F74d] p-3"
            style={{
              boxShadow: '0px 0px 8px #0063F74d',
            }}
          >
            <div className="flex flex-col">
              <span className="text-sm text-[#616161]">Entry ID</span>
              <div className="flex items-center gap-2">
                <span className="textsm !font-[300]" ref={textRef}>
                  {data?._id}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    copyText();
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.525 1.25H7.09125C5.98875 1.25 5.115 1.25 4.43187 1.3425C3.72812 1.4375 3.15875 1.6375 2.71 2.08813C2.26062 2.53875 2.06125 3.11062 1.96688 3.81687C1.875 4.50312 1.875 5.38 1.875 6.48687V10.1356C1.875 11.0781 2.45 11.8856 3.26688 12.2244C3.225 11.6556 3.225 10.8588 3.225 10.195V7.06375C3.225 6.26312 3.225 5.5725 3.29875 5.02C3.37812 4.4275 3.55687 3.86 4.01562 3.39937C4.47437 2.93875 5.04 2.75938 5.63 2.67938C6.18 2.60563 6.8675 2.60563 7.66562 2.60563H9.58437C10.3819 2.60563 11.0681 2.60563 11.6187 2.67938C11.4537 2.25836 11.1657 1.89681 10.7923 1.64185C10.4188 1.38689 9.9772 1.25034 9.525 1.25Z"
                      fill="#616161"
                    />
                    <path
                      d="M4.125 7.12219C4.125 5.41844 4.125 4.56656 4.6525 4.03719C5.17937 3.50781 6.0275 3.50781 7.725 3.50781H9.525C11.2219 3.50781 12.0706 3.50781 12.5981 4.03719C13.125 4.56656 13.125 5.41844 13.125 7.12219V10.1347C13.125 11.8384 13.125 12.6903 12.5981 13.2197C12.0706 13.7491 11.2219 13.7491 9.525 13.7491H7.725C6.02812 13.7491 5.17937 13.7491 4.6525 13.2197C4.125 12.6903 4.125 11.8384 4.125 10.1347V7.12219Z"
                      fill="#616161"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-[#616161]">Entry Name</span>
              <div className="flex items-center gap-2">
                <span className="textsm !font-[300]" ref={textRef}>
                  {data?.name}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    copyText();
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.525 1.25H7.09125C5.98875 1.25 5.115 1.25 4.43187 1.3425C3.72812 1.4375 3.15875 1.6375 2.71 2.08813C2.26062 2.53875 2.06125 3.11062 1.96688 3.81687C1.875 4.50312 1.875 5.38 1.875 6.48687V10.1356C1.875 11.0781 2.45 11.8856 3.26688 12.2244C3.225 11.6556 3.225 10.8588 3.225 10.195V7.06375C3.225 6.26312 3.225 5.5725 3.29875 5.02C3.37812 4.4275 3.55687 3.86 4.01562 3.39937C4.47437 2.93875 5.04 2.75938 5.63 2.67938C6.18 2.60563 6.8675 2.60563 7.66562 2.60563H9.58437C10.3819 2.60563 11.0681 2.60563 11.6187 2.67938C11.4537 2.25836 11.1657 1.89681 10.7923 1.64185C10.4188 1.38689 9.9772 1.25034 9.525 1.25Z"
                      fill="#616161"
                    />
                    <path
                      d="M4.125 7.12219C4.125 5.41844 4.125 4.56656 4.6525 4.03719C5.17937 3.50781 6.0275 3.50781 7.725 3.50781H9.525C11.2219 3.50781 12.0706 3.50781 12.5981 4.03719C13.125 4.56656 13.125 5.41844 13.125 7.12219V10.1347C13.125 11.8384 13.125 12.6903 12.5981 13.2197C12.0706 13.7491 11.2219 13.7491 9.525 13.7491H7.725C6.02812 13.7491 5.17937 13.7491 4.6525 13.2197C4.125 12.6903 4.125 11.8384 4.125 10.1347V7.12219Z"
                      fill="#616161"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-[#616161]">Submission Name</span>
              <div className="flex items-center gap-2">
                <span className="textsm !font-[300]" ref={textRef}>
                  {data?.submissionId}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    copyText();
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.525 1.25H7.09125C5.98875 1.25 5.115 1.25 4.43187 1.3425C3.72812 1.4375 3.15875 1.6375 2.71 2.08813C2.26062 2.53875 2.06125 3.11062 1.96688 3.81687C1.875 4.50312 1.875 5.38 1.875 6.48687V10.1356C1.875 11.0781 2.45 11.8856 3.26688 12.2244C3.225 11.6556 3.225 10.8588 3.225 10.195V7.06375C3.225 6.26312 3.225 5.5725 3.29875 5.02C3.37812 4.4275 3.55687 3.86 4.01562 3.39937C4.47437 2.93875 5.04 2.75938 5.63 2.67938C6.18 2.60563 6.8675 2.60563 7.66562 2.60563H9.58437C10.3819 2.60563 11.0681 2.60563 11.6187 2.67938C11.4537 2.25836 11.1657 1.89681 10.7923 1.64185C10.4188 1.38689 9.9772 1.25034 9.525 1.25Z"
                      fill="#616161"
                    />
                    <path
                      d="M4.125 7.12219C4.125 5.41844 4.125 4.56656 4.6525 4.03719C5.17937 3.50781 6.0275 3.50781 7.725 3.50781H9.525C11.2219 3.50781 12.0706 3.50781 12.5981 4.03719C13.125 4.56656 13.125 5.41844 13.125 7.12219V10.1347C13.125 11.8384 13.125 12.6903 12.5981 13.2197C12.0706 13.7491 11.2219 13.7491 9.525 13.7491H7.725C6.02812 13.7491 5.17937 13.7491 4.6525 13.2197C4.125 12.6903 4.125 11.8384 4.125 10.1347V7.12219Z"
                      fill="#616161"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          {/* 2nd */}{' '}
          <div
            className="mb-4 flex flex-col gap-4 rounded-[10px] border border-[#0063F74d] p-3"
            style={{
              boxShadow: '0px 0px 8px #0063F74d',
            }}
          >
            {' '}
            <h2 className="text-sm text-[#616161]">Assigned Projects</h2>
            <div className="flex flex-wrap items-center justify-start gap-2">
              {(data?.projectIds ?? []).map((project) => {
                return (
                  <div
                    key={project._id}
                    className="flex flex-wrap gap-2 rounded-lg bg-[#97f1bb] px-3 py-1 text-black"
                  >
                    <p className="cursor-pointer capitalize">{project.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {/* 3rd */}
          <div
            className="mb-4 flex flex-col gap-4 rounded-[10px] border border-[#0063F74d] p-3"
            style={{
              boxShadow: '0px 0px 8px #0063F74d',
            }}
          >
            <h2 className="text-sm text-[#616161]">Submitted By</h2>
            <div className="flex items-center gap-2">
              <span className="flex w-7 shrink-0">
                <PresignedUserAvatar
                  photo={data?.createdBy?.photo}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
              </span>
              <span className="text-sm text-gray-700">{`${
                data?.createdBy._id === session?.user.user._id
                  ? `Me`
                  : `${data?.createdBy.firstName} ${data?.createdBy.lastName}`
              }`}</span>
            </div>

            <div className="flex w-full gap-2">
              <div className="flex gap-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_3381_22010)">
                    <path
                      d="M17.9151 3.336H15.6929V5.00267C15.6929 5.16317 15.6612 5.32211 15.5998 5.47039C15.5384 5.61868 15.4484 5.75342 15.3349 5.86691C15.2214 5.9804 15.0866 6.07043 14.9384 6.13185C14.7901 6.19328 14.6311 6.22489 14.4706 6.22489C14.3101 6.22489 14.1512 6.19328 14.0029 6.13185C13.8546 6.07043 13.7199 5.9804 13.6064 5.86691C13.4929 5.75342 13.4029 5.61868 13.3414 5.47039C13.28 5.32211 13.2484 5.16317 13.2484 5.00267V3.336H6.77619V5.00267C6.77619 5.32682 6.64742 5.6377 6.4182 5.86691C6.18899 6.09612 5.87812 6.22489 5.55396 6.22489C5.22981 6.22489 4.91893 6.09612 4.68972 5.86691C4.46051 5.6377 4.33174 5.32682 4.33174 5.00267V3.336H2.10952C1.97731 3.3345 1.84614 3.35952 1.72377 3.40959C1.6014 3.45966 1.49031 3.53377 1.39708 3.62752C1.30385 3.72127 1.23036 3.83276 1.18097 3.95541C1.13158 4.07805 1.10728 4.20936 1.10952 4.34156V16.7749C1.10731 16.9048 1.13071 17.0338 1.17838 17.1546C1.22604 17.2754 1.29705 17.3857 1.38733 17.4791C1.47761 17.5724 1.58541 17.6471 1.70455 17.6988C1.8237 17.7505 1.95187 17.7783 2.08174 17.7804H17.9151C18.0449 17.7783 18.1731 17.7505 18.2923 17.6988C18.4114 17.6471 18.5192 17.5724 18.6095 17.4791C18.6998 17.3857 18.7708 17.2754 18.8184 17.1546C18.8661 17.0338 18.8895 16.9048 18.8873 16.7749V4.34156C18.8895 4.21169 18.8661 4.08266 18.8184 3.96184C18.7708 3.84101 18.6998 3.73076 18.6095 3.63739C18.5192 3.54401 18.4114 3.46933 18.2923 3.41762C18.1731 3.3659 18.0449 3.33817 17.9151 3.336ZM5.55396 14.4471H4.44285V13.336H5.55396V14.4471ZM5.55396 11.6693H4.44285V10.5582H5.55396V11.6693ZM5.55396 8.89156H4.44285V7.78045H5.55396V8.89156ZM8.8873 14.4471H7.77619V13.336H8.8873V14.4471ZM8.8873 11.6693H7.77619V10.5582H8.8873V11.6693ZM8.8873 8.89156H7.77619V7.78045H8.8873V8.89156ZM12.2206 14.4471H11.1095V13.336H12.2206V14.4471ZM12.2206 11.6693H11.1095V10.5582H12.2206V11.6693ZM12.2206 8.89156H11.1095V7.78045H12.2206V8.89156ZM15.554 14.4471H14.4429V13.336H15.554V14.4471ZM15.554 11.6693H14.4429V10.5582H15.554V11.6693ZM15.554 8.89156H14.4429V7.78045H15.554V8.89156Z"
                      fill="#616161"
                    />
                    <path
                      d="M5.55556 5.55382C5.7029 5.55382 5.84421 5.49529 5.94839 5.3911C6.05258 5.28691 6.11111 5.14561 6.11111 4.99826V1.66493C6.11111 1.51759 6.05258 1.37628 5.94839 1.27209C5.84421 1.16791 5.7029 1.10938 5.55556 1.10938C5.40821 1.10938 5.26691 1.16791 5.16272 1.27209C5.05853 1.37628 5 1.51759 5 1.66493V4.99826C5 5.14561 5.05853 5.28691 5.16272 5.3911C5.26691 5.49529 5.40821 5.55382 5.55556 5.55382Z"
                      fill="#616161"
                    />
                    <path
                      d="M14.4462 5.55382C14.5935 5.55382 14.7348 5.49529 14.839 5.3911C14.9432 5.28691 15.0017 5.14561 15.0017 4.99826V1.66493C15.0017 1.51759 14.9432 1.37628 14.839 1.27209C14.7348 1.16791 14.5935 1.10938 14.4462 1.10938C14.2988 1.10938 14.1575 1.16791 14.0533 1.27209C13.9492 1.37628 13.8906 1.51759 13.8906 1.66493V4.99826C13.8906 5.14561 13.9492 5.28691 14.0533 5.3911C14.1575 5.49529 14.2988 5.55382 14.4462 5.55382Z"
                      fill="#616161"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_3381_22010">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-sm text-[#616161]">
                  {dateFormat(
                    data?.createdAt.toString() ?? new Date().toString()
                  )}
                </span>
              </div>
              <div className="flex gap-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 1.875C8.39303 1.875 6.82214 2.35152 5.486 3.24431C4.14985 4.1371 3.10844 5.40605 2.49348 6.8907C1.87852 8.37535 1.71762 10.009 2.03112 11.5851C2.34463 13.1612 3.11846 14.6089 4.25476 15.7452C5.39106 16.8815 6.8388 17.6554 8.4149 17.9689C9.99099 18.2824 11.6247 18.1215 13.1093 17.5065C14.594 16.8916 15.8629 15.8502 16.7557 14.514C17.6485 13.1779 18.125 11.607 18.125 10C18.1227 7.84581 17.266 5.78051 15.7427 4.25727C14.2195 2.73403 12.1542 1.87727 10 1.875ZM14.375 10.625H10C9.83424 10.625 9.67527 10.5592 9.55806 10.4419C9.44085 10.3247 9.375 10.1658 9.375 10V5.625C9.375 5.45924 9.44085 5.30027 9.55806 5.18306C9.67527 5.06585 9.83424 5 10 5C10.1658 5 10.3247 5.06585 10.4419 5.18306C10.5592 5.30027 10.625 5.45924 10.625 5.625V9.375H14.375C14.5408 9.375 14.6997 9.44085 14.8169 9.55806C14.9342 9.67527 15 9.83424 15 10C15 10.1658 14.9342 10.3247 14.8169 10.4419C14.6997 10.5592 14.5408 10.625 14.375 10.625Z"
                    fill="#616161"
                  />
                </svg>
                <span className="text-sm text-[#616161]">
                  {timeFormat(
                    data?.createdAt.toString() ?? new Date().toString()
                  )}
                </span>
              </div>
            </div>

            {/* ----------- */}
            <div className="flex flex-col">
              <span className="text-sm text-[#616161]">Last Edited by</span>
              <div className="mt-4 flex items-center gap-2">
                <span className="flex w-7 shrink-0">
                  <PresignedUserAvatar
                    photo={data?.updatedBy?.photo}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                </span>
                <span className="text-sm text-gray-700">{`${
                  data?.updatedBy._id === session?.user.user._id
                    ? `Me`
                    : `${data?.updatedBy.firstName} ${data?.updatedBy.lastName}`
                }`}</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_3381_22010)">
                      <path
                        d="M17.9151 3.336H15.6929V5.00267C15.6929 5.16317 15.6612 5.32211 15.5998 5.47039C15.5384 5.61868 15.4484 5.75342 15.3349 5.86691C15.2214 5.9804 15.0866 6.07043 14.9384 6.13185C14.7901 6.19328 14.6311 6.22489 14.4706 6.22489C14.3101 6.22489 14.1512 6.19328 14.0029 6.13185C13.8546 6.07043 13.7199 5.9804 13.6064 5.86691C13.4929 5.75342 13.4029 5.61868 13.3414 5.47039C13.28 5.32211 13.2484 5.16317 13.2484 5.00267V3.336H6.77619V5.00267C6.77619 5.32682 6.64742 5.6377 6.4182 5.86691C6.18899 6.09612 5.87812 6.22489 5.55396 6.22489C5.22981 6.22489 4.91893 6.09612 4.68972 5.86691C4.46051 5.6377 4.33174 5.32682 4.33174 5.00267V3.336H2.10952C1.97731 3.3345 1.84614 3.35952 1.72377 3.40959C1.6014 3.45966 1.49031 3.53377 1.39708 3.62752C1.30385 3.72127 1.23036 3.83276 1.18097 3.95541C1.13158 4.07805 1.10728 4.20936 1.10952 4.34156V16.7749C1.10731 16.9048 1.13071 17.0338 1.17838 17.1546C1.22604 17.2754 1.29705 17.3857 1.38733 17.4791C1.47761 17.5724 1.58541 17.6471 1.70455 17.6988C1.8237 17.7505 1.95187 17.7783 2.08174 17.7804H17.9151C18.0449 17.7783 18.1731 17.7505 18.2923 17.6988C18.4114 17.6471 18.5192 17.5724 18.6095 17.4791C18.6998 17.3857 18.7708 17.2754 18.8184 17.1546C18.8661 17.0338 18.8895 16.9048 18.8873 16.7749V4.34156C18.8895 4.21169 18.8661 4.08266 18.8184 3.96184C18.7708 3.84101 18.6998 3.73076 18.6095 3.63739C18.5192 3.54401 18.4114 3.46933 18.2923 3.41762C18.1731 3.3659 18.0449 3.33817 17.9151 3.336ZM5.55396 14.4471H4.44285V13.336H5.55396V14.4471ZM5.55396 11.6693H4.44285V10.5582H5.55396V11.6693ZM5.55396 8.89156H4.44285V7.78045H5.55396V8.89156ZM8.8873 14.4471H7.77619V13.336H8.8873V14.4471ZM8.8873 11.6693H7.77619V10.5582H8.8873V11.6693ZM8.8873 8.89156H7.77619V7.78045H8.8873V8.89156ZM12.2206 14.4471H11.1095V13.336H12.2206V14.4471ZM12.2206 11.6693H11.1095V10.5582H12.2206V11.6693ZM12.2206 8.89156H11.1095V7.78045H12.2206V8.89156ZM15.554 14.4471H14.4429V13.336H15.554V14.4471ZM15.554 11.6693H14.4429V10.5582H15.554V11.6693ZM15.554 8.89156H14.4429V7.78045H15.554V8.89156Z"
                        fill="#616161"
                      />
                      <path
                        d="M5.55556 5.55382C5.7029 5.55382 5.84421 5.49529 5.94839 5.3911C6.05258 5.28691 6.11111 5.14561 6.11111 4.99826V1.66493C6.11111 1.51759 6.05258 1.37628 5.94839 1.27209C5.84421 1.16791 5.7029 1.10938 5.55556 1.10938C5.40821 1.10938 5.26691 1.16791 5.16272 1.27209C5.05853 1.37628 5 1.51759 5 1.66493V4.99826C5 5.14561 5.05853 5.28691 5.16272 5.3911C5.26691 5.49529 5.40821 5.55382 5.55556 5.55382Z"
                        fill="#616161"
                      />
                      <path
                        d="M14.4462 5.55382C14.5935 5.55382 14.7348 5.49529 14.839 5.3911C14.9432 5.28691 15.0017 5.14561 15.0017 4.99826V1.66493C15.0017 1.51759 14.9432 1.37628 14.839 1.27209C14.7348 1.16791 14.5935 1.10938 14.4462 1.10938C14.2988 1.10938 14.1575 1.16791 14.0533 1.27209C13.9492 1.37628 13.8906 1.51759 13.8906 1.66493V4.99826C13.8906 5.14561 13.9492 5.28691 14.0533 5.3911C14.1575 5.49529 14.2988 5.55382 14.4462 5.55382Z"
                        fill="#616161"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3381_22010">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-sm text-[#616161]">
                    {dateFormat(
                      data?.updatedAt.toString() ?? new Date().toString()
                    )}
                  </span>
                </div>
                <div className="flex gap-1">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 1.875C8.39303 1.875 6.82214 2.35152 5.486 3.24431C4.14985 4.1371 3.10844 5.40605 2.49348 6.8907C1.87852 8.37535 1.71762 10.009 2.03112 11.5851C2.34463 13.1612 3.11846 14.6089 4.25476 15.7452C5.39106 16.8815 6.8388 17.6554 8.4149 17.9689C9.99099 18.2824 11.6247 18.1215 13.1093 17.5065C14.594 16.8916 15.8629 15.8502 16.7557 14.514C17.6485 13.1779 18.125 11.607 18.125 10C18.1227 7.84581 17.266 5.78051 15.7427 4.25727C14.2195 2.73403 12.1542 1.87727 10 1.875ZM14.375 10.625H10C9.83424 10.625 9.67527 10.5592 9.55806 10.4419C9.44085 10.3247 9.375 10.1658 9.375 10V5.625C9.375 5.45924 9.44085 5.30027 9.55806 5.18306C9.67527 5.06585 9.83424 5 10 5C10.1658 5 10.3247 5.06585 10.4419 5.18306C10.5592 5.30027 10.625 5.45924 10.625 5.625V9.375H14.375C14.5408 9.375 14.6997 9.44085 14.8169 9.55806C14.9342 9.67527 15 9.83424 15 10C15 10.1658 14.9342 10.3247 14.8169 10.4419C14.6997 10.5592 14.5408 10.625 14.375 10.625Z"
                      fill="#616161"
                    />
                  </svg>
                  <span className="text-sm text-[#616161]">
                    {timeFormat(
                      data?.updatedAt.toString() ?? new Date().toString()
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        </div>

        {/* Second Container  */}
        <div
          style={{
            boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.2)',
          }}
          className="mx-4 my-1 flex flex-col rounded-xl border border-[#EEEEEE]"
        >
          {/* form top  */}
          <div className="mb-4 flex flex-col gap-4 p-4">
            <div className="flex flex-col">
              <h2 className="mb-1 text-xl font-semibold">JSA Details</h2>
            </div>
            {/* customer details */}
            <div className="grid grid-cols-2">
              {/* 1st  */}
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#616161]">
                  Selected Customer
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-8">
                    <img src="/images/user.png" alt="" />
                  </span>
                  <span className="text-sm text-gray-700">
                    {data?.selectedContact || 'My Organization'}
                  </span>
                </div>
              </div>{' '}
              {/* 2nd */}
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#616161]">Reference</span>
                <div className="flex h-8 items-center gap-2">
                  <span className="text-sm text-gray-700">
                    {data?.reference ?? '-'}
                  </span>
                </div>{' '}
              </div>
            </div>

            {/* jsa details */}
            <div className="grid grid-cols-2 flex-wrap items-center">
              {/* 1 */}
              <div className="pb-4 pt-2">
                <h3 className="text-sm text-gray-700">JSA Name</h3>
                <p className="font-semibold capitalize">{data?.name}</p>
              </div>
              {/* 2 */}
              <div className="pb-4 pt-2">
                <h3 className="text-sm text-gray-700">
                  Date Range of Activities
                </h3>
                <p className="font-semibold">{`${dateFormat(
                  data?.rangeDate?.startDate ?? new Date().toString()
                )} T0 ${dateFormat(
                  data?.rangeDate?.endDate ?? new Date().toString()
                )}`}</p>
              </div>
              {/* 3 */}
              <div className="col-span-2 pb-4 pt-2">
                <h3 className="text-sm text-gray-700">
                  Scope of works taking place
                </h3>
                <p>{data?.scopeDescription}</p>
              </div>
              <div className="col-span-2 flex pb-4 pt-2">
                <span className="w-1/4">
                  <h3 className="text-sm text-gray-700">Contact Name</h3>
                  <p className="font-semibold capitalize">
                    {data?.contactName}
                  </p>
                </span>
                <span className="w-1/4">
                  <h3 className="text-sm text-gray-700">Phone Number</h3>
                  <p>{data?.phone}</p>
                </span>
              </div>
              <div className="pb-4 pt-2">
                <h3 className="text-sm text-gray-700">
                  Managers and Supervisors
                </h3>
                <div className="flex">
                  {(data?.managers ?? []).map((manager, index) => {
                    return (
                      <span className="flex w-full justify-between" key={index}>
                        <span className="text-base font-semibold text-[#1E1E1E]">
                          {`${manager.firstName} ${manager.lastName}`}
                        </span>
                        <span>{manager.email}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Steps Container  */}
        {(data?.steps ?? []).map((step, index) => (
          <div
            className="mx-4 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow"
            key={index}
          >
            {/* form top  */}
            <div className="mb-4 flex justify-between px-4 pt-5">
              <div className="flex flex-col">
                <h2 className="mb-1 text-xl font-semibold">Step {index + 1}</h2>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1 flex-wrap items-center justify-start pt-2">
              <div className="px-4 pb-4 pt-2">
                <h3 className="text-sm text-gray-700">Activity Description</h3>
                <p className="font-bold">{step.description}</p>
              </div>
              <div className="px-4 pb-4 pt-2">
                <h3 className="text-sm text-gray-700">PPE's and Safety Gear</h3>
                <div className="mb-4 flex flex-wrap items-center justify-start gap-2 pt-2">
                  {step.PPEs.map((item) => {
                    return (
                      <div
                        key={item._id}
                        className="flex gap-2 rounded-xl bg-[#BCC7FF] px-3 py-1 text-black"
                      >
                        <p>{item.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="pb-4 pt-2">
                {step.Hazards.map((hazard, index) => (
                  <div
                    className={clsx(
                      'px-4 pb-6 pt-2',
                      index % 2 === 0 ? 'bg-[#FFF3E1]' : 'bg-[#efefef]'
                    )}
                    key={hazard._id}
                  >
                    <div className="pb-4 pt-2">
                      <h3 className="text-gray-700">Hazard and Risk Name</h3>
                      <p className="font-bold">{hazard.name}</p>
                    </div>
                    <div className="pb-4 pt-2">
                      <h3 className="text-sm text-gray-700">
                        Hazard Initial Risk Assessment
                      </h3>
                      <p>{hazard.initialRiskAssessment}</p>
                    </div>
                    <div className="pb-4 pt-2">
                      <h3 className="text-sm text-gray-700">Hazard Control</h3>
                      <p>{hazard.controlMethod}</p>
                    </div>
                    <div className="pb-4 pt-2">
                      <h3 className="text-sm text-gray-700">
                        Hazard Residual Risk Assessment
                      </h3>
                      <p>{hazard.residualRiskAssessment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="mx-4 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow">
          {/* form top  */}
          <div className="mb-4 flex justify-between px-4 pt-5">
            <div className="flex flex-col">
              <h2 className="mb-1 text-xl font-semibold">Emergency Plan</h2>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-1 flex-wrap items-center px-4 pt-2">
            <div className="pb-4 pt-2">
              <h3 className="text-sm text-gray-700">Evacuation Area</h3>
              <p className="font-bold">{data?.evacuationArea}</p>
            </div>
            <div className="pb-4 pt-2">
              <h3 className="text-sm text-gray-700">
                Evacuation and Emergency Procedures
              </h3>
              <p className="font-bold">{data?.evacuationProcedure}</p>
            </div>
            <div className="pb-4 pt-2">
              <div
                className={'flex w-1/2 justify-between text-sm text-[#616161]'}
              >
                <span>{`Emergency Contact`}</span>
                <span>{`Phone Number`}</span>
              </div>
              {(data?.emergencyContact ?? []).map((contacts, index) => {
                return (
                  <div className={'flex w-1/2 justify-between'} key={index}>
                    <span>{`${contacts.name} `}</span>
                    <span>{`${contacts.phone}`}</span>
                  </div>
                );
              })}
            </div>
            {images.map((val, index) => (
              <div className="pb-4 pt-2" key={index}>
                <img
                  src={val}
                  alt={getLastSegment(val) || 'Attachment'}
                  className="max-h-48 cursor-pointer rounded border object-contain hover:opacity-90"
                  onClick={() => setLightboxIndex(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && setLightboxIndex(index)
                  }
                />
                <span className="my-2 block text-sm text-[#0063F7]">
                  {getLastSegment(val)}
                </span>
              </div>
            ))}
            <Modal
              isOpen={lightboxIndex !== null}
              onOpenChange={(open) => !open && closeLightbox()}
              size="5xl"
              classNames={{ base: 'max-h-[90vh]' }}
            >
              <ModalContent>
                {(onClose) => (
                  <div ref={lightboxRef} className="outline-none">
                    <ModalBody className="relative overflow-hidden p-0">
                      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
                        <span className="text-sm text-gray-600">
                          {hasMultiple && lightboxIndex !== null
                            ? `Image ${lightboxIndex + 1} of ${images.length}`
                            : 'Image'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (lightboxRef.current) {
                                if (!document.fullscreenElement) {
                                  lightboxRef.current.requestFullscreen?.();
                                } else {
                                  document.exitFullscreen?.();
                                }
                              }
                            }}
                            className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                            title="Fullscreen"
                            aria-label="Fullscreen"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={onClose}
                            className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                            title="Close"
                            aria-label="Close"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="relative flex min-h-[50vh] items-center justify-center bg-black/5 p-4">
                        {currentImage && (
                          <img
                            src={currentImage}
                            alt="Enlarged view"
                            className="max-h-[75vh] w-full object-contain"
                          />
                        )}
                        {hasMultiple && (
                          <>
                            <button
                              type="button"
                              onClick={goPrev}
                              disabled={lightboxIndex === 0}
                              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white disabled:opacity-40"
                              aria-label="Previous image"
                            >
                              <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={goNext}
                              disabled={lightboxIndex === images.length - 1}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white disabled:opacity-40"
                              aria-label="Next image"
                            >
                              <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </ModalBody>
                  </div>
                )}
              </ModalContent>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
}
