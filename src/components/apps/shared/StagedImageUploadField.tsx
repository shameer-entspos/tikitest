'use client';

import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import { Info } from 'lucide-react';
import {
  StagedImageUploadItem,
  getUploadedImageDisplayName,
} from './useStagedImageUploads';

const SUPPORTED_FORMATS_TOOLTIP =
  'Accepted types include PNG, JPEG, JPG, WebP, GIF, SVG, AVIF, HEIC/HEIF (where the browser supports them), and other image formats allowed by your device.';

type UploadedImageListItem = {
  label?: string;
  previewUrl: string;
  value: string;
};

type Props = {
  accept?: string;
  disabled?: boolean;
  emptyStateTitle?: string;
  headerAction?: ReactNode;
  helperText?: ReactNode;
  label?: ReactNode;
  maxFiles?: number;
  maxSizeLabel?: string;
  multiple?: boolean;
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveStaged: (id: string) => void;
  onRemoveUploaded?: (item: UploadedImageListItem) => void;
  readOnly?: boolean;
  stagedItems: StagedImageUploadItem[];
  stagedError?: string;
  uploadedItems?: UploadedImageListItem[];
};

function statusLabel(item: StagedImageUploadItem) {
  if (item.status === 'uploading') {
    return `${item.progress}%`;
  }

  if (item.status === 'error') {
    return item.error ?? 'Failed';
  }

  return 'Pending';
}

export default function StagedImageUploadField({
  accept = 'image/*',
  disabled = false,
  emptyStateTitle = 'Drag and drop images here',
  headerAction,
  helperText,
  label,
  maxFiles = 5,
  maxSizeLabel = '20MB each',
  multiple = true,
  onFilesSelected,
  onRemoveStaged,
  onRemoveUploaded,
  readOnly = false,
  stagedError,
  stagedItems,
  uploadedItems = [],
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalCount = uploadedItems.length + stagedItems.length;
  const isBlocked = disabled || readOnly;

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (isBlocked) return;

    if (event.dataTransfer.files?.length) {
      onFilesSelected(event.dataTransfer.files);
    }
  };

  return (
    <div className="pt-5">
      {(label || headerAction) && (
        <div className="mb-2 flex items-start justify-between gap-4">
          {label ? (
            <label className="block text-sm font-medium">{label}</label>
          ) : (
            <div />
          )}
          {headerAction}
        </div>
      )}

      {helperText ? (
        <p className="mb-3 text-sm text-[#616161]">{helperText}</p>
      ) : null}

      <div
        className="w-full max-w-lg"
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!isBlocked) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDrop={handleDrop}
      >
        <button
          type="button"
          disabled={isBlocked}
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-48 w-full flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center transition ${
            isDragging
              ? 'border-primary-700 bg-[#EEF5FF]'
              : 'border-gray-400 bg-gray-200 hover:bg-gray-50'
          } ${isBlocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.9193 25.3359V8.35677L9.5026 13.7734L6.58594 10.7526L17.0026 0.335938L27.4193 10.7526L24.5026 13.7734L19.0859 8.35677V25.3359H14.9193ZM4.5026 33.6693C3.35677 33.6693 2.37621 33.2616 1.56094 32.4464C0.745659 31.6311 0.337326 30.6498 0.335938 29.5026V23.2526H4.5026V29.5026H29.5026V23.2526H33.6693V29.5026C33.6693 30.6484 33.2616 31.6297 32.4464 32.4464C31.6311 33.263 30.6498 33.6707 29.5026 33.6693H4.5026Z"
              fill="#616161"
            />
          </svg>

          <div className="mt-4 text-sm text-gray-600">
            <p>{emptyStateTitle}</p>
            <p className="py-1">or</p>
            <p className="font-semibold text-primary-700">Browse</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={isBlocked}
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) {
                onFilesSelected(event.target.files);
              }
              event.target.value = '';
            }}
          />
        </button>

        <div className="mt-2 flex items-start justify-between gap-3 text-xs text-gray-600">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <span className="font-semibold text-gray-900">
              Supported formats
            </span>

            <Tooltip
              placement="top"
              delay={150}
              closeDelay={0}
              classNames={{
                content:
                  'max-w-[260px] px-3 py-2 text-xs leading-snug text-gray-700',
              }}
              content={SUPPORTED_FORMATS_TOOLTIP}
            >
              <button
                type="button"
                className="inline-flex shrink-0 rounded p-0.5 text-gray-500 transition-colors hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="More about supported image formats"
              >
                <Info className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </button>
            </Tooltip>
          </div>
          <p className="shrink-0 text-right">{`Max ${maxFiles} files (${maxSizeLabel})`}</p>
        </div>

        {stagedError ? (
          <p className="mt-2 text-sm text-red-500">{stagedError}</p>
        ) : null}

        {totalCount === 0 ? (
          <></>
        ) : (
          <div className="mt-4 space-y-2">
            {uploadedItems.map((item) => (
              <div
                key={item.value}
                className="flex items-center justify-between rounded-xl border border-[#EEEEEE] bg-white px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={item.previewUrl}
                    alt={item.label ?? getUploadedImageDisplayName(item.value)}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary-600">
                      {item.label ?? getUploadedImageDisplayName(item.value)}
                    </p>
                    <p className="text-xs text-gray-500">Uploaded</p>
                  </div>
                </div>

                {!readOnly && onRemoveUploaded ? (
                  <button
                    type="button"
                    className="text-xl text-primary-700"
                    onClick={() => onRemoveUploaded(item)}
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}

            {stagedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[#EEEEEE] bg-white px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary-600">
                      {item.file.name}
                    </p>
                    <p
                      className={`text-xs ${
                        item.status === 'error'
                          ? 'text-red-500'
                          : 'text-gray-500'
                      }`}
                    >
                      {statusLabel(item)}
                    </p>
                  </div>
                </div>

                {!readOnly ? (
                  <button
                    type="button"
                    className="text-xl text-primary-700"
                    onClick={() => onRemoveStaged(item.id)}
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
