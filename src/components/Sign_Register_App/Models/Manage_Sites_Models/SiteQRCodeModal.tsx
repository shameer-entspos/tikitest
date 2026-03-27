import { Site } from '@/app/type/Sign_Register_Sites';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { QRCodeSVG } from 'qrcode.react';

export default function SiteQRCodeModal({
  isOpen,
  onClose,
  site,
}: {
  isOpen: boolean;
  onClose: () => void;
  site: Site | undefined;
}) {
  if (!site) return null;

  // Generate QR code URL - this should link to the sign-in page for this site
  // Update this URL structure based on your actual routing
  const qrCodeUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/user/apps/sr/site/${site._id}`
      : `/user/apps/sr/site/${site._id}`;

  // Format full address
  const fullAddress = [
    site.addressLineOne,
    site.addressLineTwo,
    site.city,
    site.state,
    site.code,
    site.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="lg"
      className="px-4"
      hideCloseButton={false}
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="relative flex flex-row items-center justify-center border-b-2 border-gray-200 px-6 py-6">
              <h2 className="text-3xl font-bold text-[#0063F7]">
                Sign-in Register
              </h2>
              <button
                onClick={onCloseModal}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="#616161"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </ModalHeader>
            <ModalBody className="flex flex-col items-center px-8 py-8">
              <div className="w-full space-y-5">
                {/* Site ID */}
                <div className="flex flex-col">
                  <span className="text-sm font-normal text-[#616161]">
                    Site ID
                  </span>
                  <span className="text-lg font-bold text-[#1e1e1e]">
                    {site.siteId || site._id}
                  </span>
                </div>

                {/* Site Name */}
                <div className="flex flex-col">
                  <span className="text-sm font-normal text-[#616161]">
                    Site Name
                  </span>
                  <span className="text-lg font-bold leading-tight text-[#1e1e1e]">
                    {site.siteName || '-'}
                  </span>
                </div>

                {/* Site Address */}
                <div className="flex flex-col">
                  <span className="text-sm font-normal text-[#616161]">
                    Site Address
                  </span>
                  <span className="text-lg font-bold leading-tight text-[#1e1e1e]">
                    {fullAddress || '-'}
                  </span>
                </div>

                {/* QR Code */}
                <div className="flex justify-center py-6">
                  <QRCodeSVG
                    value={qrCodeUrl}
                    size={320}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Tikiworkplace Logo */}
                <div className="flex flex-col items-center justify-center pt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#0063F7]">
                      Tiki
                    </span>
                    <span className="text-2xl font-normal text-[#0063F7]">
                      workplace
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#0063F7]">
                    Your all-in-one software suite
                  </p>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
