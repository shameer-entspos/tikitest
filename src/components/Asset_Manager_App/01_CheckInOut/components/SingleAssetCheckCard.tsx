import { dateFormatWithoutYear, timeFormat } from '@/app/helpers/dateFormat';
import { LiveBoard } from '@/app/type/live_board';
import { SingleAsset } from '@/app/type/single_asset';
import { Button } from '@/components/Buttons';
import React, { useState, useEffect } from 'react';
import { Colors } from 'react-select';
import Loader from '@/components/DottedLoader/loader';
import { getPresignedFileUrl } from '@/app/(main)/(user-panel)/user/file/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';

const SingleAssetCheckCard = ({
  data,
  selectedAsset,
  onClick,
  onAdd,
}: {
  data: SingleAsset;
  onClick: () => void;
  onAdd: (asset: SingleAsset) => void;
  selectedAsset: SingleAsset[];
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const rawPhoto = (data.photos ?? [])?.[0];
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!rawPhoto?.trim() || !accessToken?.trim()) {
      setResolvedUrl(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrl(axiosAuth, rawPhoto, accessToken).then((url) => {
      if (!cancelled && url) setResolvedUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [rawPhoto, accessToken, axiosAuth]);

  const imageSrc =
    (data.photos ?? [])?.length > 0
      ? (resolvedUrl ?? rawPhoto ?? '/svg/no-image.svg')
      : '/svg/no-image.svg';

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    if (imageSrc && imageSrc !== '/svg/no-image.svg') {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(true);
      };
      img.src = imageSrc;
    } else {
      setImageLoaded(true);
    }
  }, [imageSrc]);

  return (
    <div className="flex h-[456px] w-[250px] flex-col justify-between rounded-sm shadow-md">
      <div className="relative h-[176px] w-full overflow-hidden">
        {!imageLoaded ? (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <Loader />
          </div>
        ) : (
          <img
            src={imageError ? '/svg/no-image.svg' : imageSrc}
            alt="avatar"
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <div className="flex flex-col justify-between p-4">
        <span className="inline-block truncate py-2 text-sm font-semibold">
          {data.name}
        </span>
        <span className="text-sm text-[#616161]">Asset ID</span>
        <span className="py-2 text-sm font-semibold">{data.atnNum}</span>
        <span className="text-sm text-[#616161]">Asset Description</span>
        <span className="line-clamp-2 py-2 text-sm font-medium md:line-clamp-3">
          {data.description}
        </span>
      </div>
      <div className="flex items-center justify-center gap-3 py-3">
        <Button
          variant="primary"
          className={`${selectedAsset.some((as) => as._id == data._id) ? 'bg-[#616161] hover:bg-[#616161]' : ''}`}
          onClick={() => {
            onAdd(data);
          }}
        >
          {selectedAsset.some((as) => as._id == data._id) ? (
            <>Selected</>
          ) : (
            <>Add</>
          )}
        </Button>

        <Button variant="text" className="text-xs" onClick={onClick}>
          More info
        </Button>
      </div>
    </div>
  );
};

export default SingleAssetCheckCard;
