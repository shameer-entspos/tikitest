import { SingleAsset } from '@/app/type/single_asset';
import UserCard from '@/components/UserCard';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useMemo } from 'react';
import { getLastSegment } from '../../04_ManageAssets/asset_components/Select_Asset_Images';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import useAxiosAuth from '@/hooks/AxiosAuth';

export const ShowAssetDetail = ({
  model,
  handleClose,
}: {
  model: SingleAsset | undefined;
  handleClose: any;
}) => {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const accessToken = session?.user?.accessToken;
  const rawPhotos = useMemo(
    () => (model?.photos ?? []).filter(Boolean) as string[],
    [model?.photos]
  );

  const [resolvedPhotos, setResolvedPhotos] = useState<string[] | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!rawPhotos.length || !accessToken?.trim()) {
      setResolvedPhotos(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, rawPhotos, accessToken).then((urls) => {
      if (!cancelled && urls && urls.length === rawPhotos.length)
        setResolvedPhotos(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [rawPhotos, accessToken, axiosAuth]);

  const displayPhotos = (resolvedPhotos ?? rawPhotos) as string[];

  return (
    <>
      <Modal
        isOpen={true}
        onOpenChange={handleClose}
        placement="auto"
        size="lg"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-start gap-2 px-5 py-4">
                <div className="flex w-full flex-row items-start gap-4 border-b-2 border-gray-200 py-2">
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                    <g clipPath="url(#clip0_2869_3571)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M39.115 15.5746C39.376 15.6787 39.5999 15.8587 39.7576 16.0913C39.9154 16.324 39.9998 16.5985 40 16.8796V33.1208C39.9998 33.4019 39.9154 33.6764 39.7576 33.909C39.5999 34.1416 39.376 34.3216 39.115 34.4258L25.5212 39.8633C25.186 39.9974 24.8121 39.9974 24.4769 39.8633L10.8831 34.4258C10.6224 34.3213 10.399 34.1412 10.2416 33.9086C10.0842 33.676 10.0001 33.4016 10 33.1208V16.8796C10.0001 16.5987 10.0842 16.3243 10.2416 16.0917C10.399 15.8592 10.6224 15.679 10.8831 15.5746L23.9556 10.3452L23.9631 10.3433L24.4769 10.1371C24.8126 10.0025 25.1874 10.0025 25.5231 10.1371L26.0369 10.3433L26.0444 10.3452L39.115 15.5746ZM36.5387 16.5627L25 21.1789L13.4612 16.5627L11.875 17.1983V17.9483L24.0625 22.8233V37.6771L25 38.0521L25.9375 37.6771V22.8252L38.125 17.9502V17.2002L36.5387 16.5627Z"
                        fill="#0063F7"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_2869_3571">
                        <rect
                          width="30"
                          height="30"
                          fill="white"
                          transform="translate(10 10)"
                        />
                      </clipPath>
                    </defs>
                  </svg>

                  <div>
                    <h1>{'View Asset'}</h1>

                    <span className="text-base font-normal text-[#616161]">
                      {'View Asset Details below.'}
                    </span>
                  </div>
                  <div></div>
                </div>
              </ModalHeader>
              <ModalBody className="">
                <div className={`max-h-[480px] w-full`}>
                  <div className="flex h-[480px] w-full flex-col gap-2 overflow-y-scroll px-2 scrollbar-hide">
                    {/* Photos Section */}
                    {(model?.photos ?? []).length > 0 && (
                      <div className="flex flex-col justify-start py-2">
                        <span className="mb-2 text-sm font-normal text-[#616161]">
                          Photos
                        </span>
                        <div className="flex flex-row flex-wrap gap-2">
                          {(model?.photos ?? []).map((photo, index) => (
                            <img
                              key={index}
                              src={displayPhotos[index] ?? photo}
                              alt={getLastSegment(photo)}
                              className="h-20 w-20 cursor-pointer rounded-md object-cover"
                              onClick={() => {
                                setActiveImageIndex(index);
                                setIsLightboxOpen(true);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {showAssetDetailWithLabel({
                      label: 'Asset ID',
                      value: model?.atnNum ?? '',
                    })}
                    {showAssetDetailWithLabel({
                      label: 'Asset Name',
                      value: model?.name ?? '',
                    })}
                    {showAssetDetailWithLabel({
                      label: 'Make',
                      value: model?.make ?? '',
                    })}
                    {showAssetDetailWithLabel({
                      label: 'Model',
                      value: model?.model ?? '',
                    })}
                    {showAssetDetailWithLabel({
                      label: 'Serial No',
                      value: model?.serialNumber?.toString() ?? '',
                    })}
                    {showAssetDetailWithLabel({
                      label: 'Description',
                      value: model?.description ?? '',
                    })}
                    {showAssetDetailWithLabel({
                      label: 'Asset Location',
                      value: model?.assetLocation ?? '',
                    })}
                    <div className="flex flex-col justify-start py-2">
                      <span className="text-sm font-normal text-[#616161]">
                        {'Last Checkout By'}
                      </span>
                      <UserCard submittedBy={model?.submittedBy} index={0} />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-center gap-10 border-t-2 border-gray-200">
                <Button
                  className="border-2 border-[#0063F7] bg-white px-10 font-semibold text-[#0063F7]"
                  onPress={onCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  className="px-10 font-semibold text-white"
                  color={`primary`}
                  onPress={() => {
                    //   organizationForm.submitForm();
                  }}
                >
                  <>Check out</>
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Lightbox for photos */}
      {isLightboxOpen && (model?.photos ?? []).length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white hover:bg-black/80"
              onClick={() => setIsLightboxOpen(false)}
            >
              ✕
            </button>
            {model?.photos && model?.photos.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) =>
                      prev === 0 ? model?.photos!.length - 1 : prev - 1
                    );
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) =>
                      prev === model.photos!.length - 1 ? 0 : prev + 1
                    );
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                  {activeImageIndex + 1} / {model?.photos.length}
                </div>
              </>
            )}
            <img
              src={
                displayPhotos[activeImageIndex] ??
                model?.photos?.[activeImageIndex]
              }
              alt={getLastSegment(model?.photos?.[activeImageIndex] ?? '')}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

const showAssetDetailWithLabel = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="flex flex-col justify-start py-2 font-Open-Sans">
      <span className="text-sm font-normal text-[#616161]">{label}</span>
      <span>{value}</span>
    </div>
  );
};
