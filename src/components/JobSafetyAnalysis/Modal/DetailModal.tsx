import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import { JSAAppActions } from '@/app/helpers/user/actions';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { PPEModel } from '@/app/(main)/(user-panel)/user/apps/api';
import CustomModal from '@/components/Custom_Modal';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';

const DetailModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const context = useJSAAppsCotnext();
  const item = context.state.selectedItem as PPEModel;
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSharing, setSelectedSharing] = useState(
    context.state.selectedItem?.sharing === 1
      ? 'myList'
      : context.state.selectedItem?.sharing === 2
        ? 'sharedList'
        : ''
  );
  const rawImages = (item?.images ?? []).filter(Boolean) as string[];
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

  const images = (resolvedUrls ?? rawImages) as string[];

  useEffect(() => {
    setCurrentIndex(0);
  }, [item?._id]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const handleEditClick = () => {
    context.dispatch({
      type: JSAAPPACTIONTYPE.SHOWMODAL,
      showModal: 'editModal',
    });
  };

  //   const handleSharingChange = (value:any) => {
  //     setSelectedSharing(value);
  //   };
  return (
    <>
      <CustomModal
        isOpen={isOpen}
        header={
          <>
            <img src="/images/ppeLogo.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold">View PPE & Safety Gear</h2>
              <p className="mt-1 text-base font-normal text-[#616161]">
                View PPE & Safety Gear details below.
              </p>
            </div>
          </>
        }
        handleCancel={onClose}
        handleSubmit={handleEditClick}
        variant="text"
        cancelvariant="text"
        submitValue={'Edit'}
        body={
          <>
            <div className="max-h-[500px] min-h-[400px] overflow-y-auto px-5 py-2 text-sm font-normal text-[#1E1E1E] scrollbar-default">
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-[#616161]">
                  PPE & Safety Gear Name
                </label>
                <p className="text-base font-medium text-[#1E1E1E]">
                  {item?.name ?? '—'}
                </p>
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-[#616161]">
                  Description
                </label>
                <p className="text-base leading-relaxed text-[#1E1E1E]">
                  {item?.description || 'No description available'}
                </p>
              </div>
              {images.length > 0 && (
                <div className="mb-5 w-full">
                  <label className="mb-2 block text-sm font-medium text-[#616161]">
                    Photos
                  </label>
                  <div className="flex flex-col items-center justify-center rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-4">
                    <div className="flex w-full items-center justify-center gap-2">
                      <button
                        type="button"
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#E0E0E0] bg-white shadow-sm transition hover:bg-gray-50 ${
                          images.length <= 1
                            ? 'cursor-not-allowed opacity-50'
                            : ''
                        }`}
                        onClick={prevImage}
                        disabled={images.length <= 1}
                        aria-label="Previous image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20"
                          viewBox="0 -960 960 960"
                          width="20"
                          fill="#616161"
                        >
                          <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                        </svg>
                      </button>
                      <div className="min-h-[180px] w-full max-w-md flex-1 overflow-hidden rounded-lg bg-white">
                        <img
                          src={images[Math.min(currentIndex, images.length - 1)]}
                          alt={`PPE ${currentIndex + 1} of ${images.length}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#E0E0E0] bg-white shadow-sm transition hover:bg-gray-50 ${
                          images.length <= 1
                            ? 'cursor-not-allowed opacity-50'
                            : ''
                        }`}
                        onClick={nextImage}
                        disabled={images.length <= 1}
                        aria-label="Next image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20"
                          viewBox="0 -960 960 960"
                          width="20"
                          fill="#616161"
                        >
                          <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      {images.map((_, index) => (
                        <span
                          key={index}
                          className={`text-xs ${
                            index === currentIndex
                              ? 'text-[#0063F7]'
                              : 'text-[#9E9E9E]'
                          }`}
                        >
                          ●
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-[#616161]">
                  Sharing
                </label>
                <div className="flex flex-col">
                  <CustomRadio
                    name={'sharing'}
                    value={'myList'}
                    checkedValue={selectedSharing === 'myList' ? 'myList' : ''}
                    onChange={() => {}}
                    label={
                      <>
                        <div>
                          Save to
                          <span className="font-bold">{` 'My List'`}</span>
                        </div>
                      </>
                    }
                  />
                  <CustomRadio
                    name={'sharing'}
                    value={'sharedList'}
                    checkedValue={
                      selectedSharing === 'sharedList' ? 'sharedList' : ''
                    }
                    onChange={() => {}}
                    label={
                      <>
                        <div>
                          Save to
                          <span className="font-bold">{` 'Shared List'`}</span>
                        </div>
                      </>
                    }
                  />
                </div>
              </div>
            </div>
          </>
        }
      />
    </>
  );
};

export default DetailModal;
