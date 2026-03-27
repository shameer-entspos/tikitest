'use client';

import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Parse site ID from QR URL: e.g. .../user/apps/sr/site/SITE_ID or .../sr/site/SITE_ID
export function parseSiteIdFromQRUrl(url: string): string | null {
  try {
    const match = url.match(/\/sr\/site\/([^/?#]+)/) || url.match(/\/site\/([^/?#]+)/);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

export default function SignInQRScanner({
  isOpen,
  onClose,
  onSiteScanned,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSiteScanned: (siteId: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef<any>(null);
  const containerId = 'sign-in-qr-reader';

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    scannerRef.current = null;
    try {
      await scanner.stop();
    } catch {}
    try {
      scanner.clear();
    } catch {}
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setError(null);
      setLoading(true);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mounted) return;
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText: string) => {
            const siteId = parseSiteIdFromQRUrl(decodedText);
            if (siteId) {
              await stopScanner();
              onSiteScanned(siteId);
              onClose();
            }
          },
          () => {}
        );
        if (mounted) setError(null);
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Could not start camera. Try allowing camera access or use a device with a camera.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [isOpen, onClose, onSiteScanned, stopScanner]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={onClose} placement="center" size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Scan site QR code</ModalHeader>
        <ModalBody>
          <p className="text-sm text-[#616161]">
            Point your camera at the site QR code to sign in there automatically.
          </p>
          <div id={containerId} className="min-h-[250px] w-full rounded-lg bg-black" />
          {loading && (
            <p className="text-sm text-[#616161]">Starting camera...</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
