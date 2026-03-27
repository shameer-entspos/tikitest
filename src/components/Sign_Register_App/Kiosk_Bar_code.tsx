import { useQuery } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { getKioskSetting } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { QRCodeSVG } from 'qrcode.react';

export function KioskBarCode() {
  const axiosAuth = useAxiosAuth();

  const { data: kioskSetting } = useQuery({
    queryKey: 'kioskSetting',
    queryFn: () => getKioskSetting(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // QR is generated from the selected Site ID in Kiosk Settings (selectedSite), with fallback to effective/default site.
  const selectedSiteId =
    kioskSetting?.selectedSite ||
    kioskSetting?.effectiveSiteId ||
    kioskSetting?.defaultHomeSiteId;
  const qrCodeUrl =
    typeof window !== 'undefined' && selectedSiteId
      ? `${window.location.origin}/user/apps/sr/site/${selectedSiteId}`
      : '';

  return (
    <>
      <div className="w-full px-4 text-sm">
        <div className="mb-[10px] flex items-center justify-start">
          <div className="inline-flex items-end justify-start gap-1 bg-gradient-to-b from-white via-white to-white py-[15px]">
            <div className="font-['Open Sans'] text-base font-semibold text-[#1e1e1e]">
              Tiki User?
            </div>
            <div className="font-['Open Sans'] text-base font-normal text-[#616161]">
              {' '}
              Use the QR code below to sign in this site.
            </div>
          </div>
        </div>

        {qrCodeUrl ? (
          <div className="flex justify-start">
            <QRCodeSVG
              value={qrCodeUrl}
              size={326}
              level="H"
              includeMargin={false}
              fgColor="#0063F7"
              bgColor="#FFFFFF"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Select a site in Kiosk Settings to generate the QR code for sign-in.
          </div>
        )}
      </div>
    </>
  );
}
