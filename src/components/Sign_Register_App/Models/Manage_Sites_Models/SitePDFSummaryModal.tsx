'use client';

import { saveAs } from 'file-saver';
import { useState } from 'react';
import CustomModal from '@/components/Custom_Modal';

export type PDFSummaryRange = 'today' | 'yesterday' | 'week' | 'month';

const RANGE_OPTIONS: { value: PDFSummaryRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

const DEFAULT_FILENAME = 'Site-Summary.PDF';

export interface SitePDFSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Returns blob and optional filename. Called when user clicks Generate. */
  onGenerate: (range: PDFSummaryRange) => Promise<{ blob: Blob; fileName?: string }>;
}

export default function SitePDFSummaryModal({
  isOpen,
  onClose,
  onGenerate,
}: SitePDFSummaryModalProps) {
  const [step, setStep] = useState<'select' | 'loading' | 'download'>('select');
  const [selectedRange, setSelectedRange] = useState<PDFSummaryRange>('today');
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [generatedFileName, setGeneratedFileName] = useState(DEFAULT_FILENAME);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setStep('select');
    setGeneratedBlob(null);
    setGeneratedFileName(DEFAULT_FILENAME);
    setError(null);
    onClose();
  };

  const handleGenerate = async () => {
    setError(null);
    setStep('loading');
    try {
      const { blob, fileName } = await onGenerate(selectedRange);
      setGeneratedBlob(blob);
      setGeneratedFileName(fileName ?? DEFAULT_FILENAME);
      setStep('download');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate PDF');
      setStep('select');
    }
  };

  const handleDownload = () => {
    if (generatedBlob) {
      saveAs(generatedBlob, generatedFileName);
    }
  };

  const handleBack = () => {
    setStep('select');
    setGeneratedBlob(null);
    setGeneratedFileName(DEFAULT_FILENAME);
    setError(null);
  };

  const isSelectStep = step === 'select';
  const isLoading = step === 'loading';
  const isDownloadStep = step === 'download';

  const header = (
    <>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0063F7] text-sm font-bold text-white">
        PDF
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#1e1e1e]">PDF Summary</h2>
      </div>
    </>
  );

  const body = (
    <>
      {/* Step 1: Select range */}
      {isSelectStep && (
        <>
          <p className="mb-4 text-sm text-[#616161]">Select an option below.</p>
          <div className="space-y-3">
            {RANGE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-3"
              >
                <input
                  type="radio"
                  name="pdf-summary-range"
                  value={opt.value}
                  checked={selectedRange === opt.value}
                  onChange={() => setSelectedRange(opt.value)}
                  className="h-4 w-4 border-gray-300 text-[#0063F7] focus:ring-[#0063F7]"
                />
                <span className="text-[#1e1e1e]">{opt.label}</span>
              </label>
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0063F7] border-t-transparent" />
          <p className="mt-4 text-sm text-[#616161]">Generating PDF...</p>
        </div>
      )}

      {/* Step 2: Download */}
      {isDownloadStep && (
        <>
          <p className="mb-4 text-sm text-[#616161]">Download Summary</p>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <button
              type="button"
              onClick={handleDownload}
              className="text-left text-sm font-medium text-[#0063F7] hover:underline"
            >
              {generatedFileName}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="text-sm font-medium text-[#0063F7] hover:underline"
            >
              Download
            </button>
          </div>
        </>
      )}
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      handleCancel={handleClose}
      handleSubmit={isSelectStep ? handleGenerate : handleClose}
      submitValue={isSelectStep ? 'Generate' : 'Close'}
      cancelButton={isSelectStep ? 'Cancel' : 'Back'}
      customCancelHandler={isDownloadStep ? handleBack : undefined}
      header={header}
      body={body}
      justifyButton="justify-end"
      showFooter={!isLoading}
      showFooterSubmit={true}
      isLoading={isLoading && isSelectStep}
      submitDisabled={false}
      variant="primary"
      cancelvariant="primaryOutLine"
      size="md"
    />
  );
}
