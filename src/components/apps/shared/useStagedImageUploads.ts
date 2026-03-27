'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type StagedImageUploadStatus = 'staged' | 'uploading' | 'error';

export type StagedImageUploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: StagedImageUploadStatus;
  error?: string;
};

type UploadPendingArgs<TResult> = {
  onUploaded?: (
    result: TResult,
    item: StagedImageUploadItem
  ) => void | Promise<void>;
  uploadFile: (
    file: File,
    onProgress: (progress: number) => void
  ) => Promise<TResult>;
};

type UseStagedImageUploadsArgs = {
  accept?: string;
  existingCount?: number;
  maxFileSizeBytes?: number;
  maxFiles?: number;
  multiple?: boolean;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function matchesAccept(file: File, accept?: string) {
  if (!accept?.trim()) return true;

  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  if (!tokens.length) return true;

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return fileName.endsWith(token);
    }

    if (token.endsWith('/*')) {
      return fileType.startsWith(token.slice(0, -1));
    }

    return fileType === token;
  });
}

export function getUploadedImageStorageKey(url: string) {
  const lastSlashIndex = url.lastIndexOf('/');
  const secondLastSlashIndex = url.lastIndexOf('/', lastSlashIndex - 1);

  if (secondLastSlashIndex === -1) {
    return decodeURIComponent(url);
  }

  return decodeURIComponent(url.substring(secondLastSlashIndex + 1));
}

export function getUploadedImageDisplayName(url: string) {
  const segments = url?.split('/') ?? [];
  const lastSegment = segments[segments.length - 1] ?? url;
  const subSegments = lastSegment.split('-');

  if (subSegments.length > 1) {
    return decodeURIComponent(subSegments[subSegments.length - 1] ?? '');
  }

  return decodeURIComponent(lastSegment ?? '');
}

export function useStagedImageUploads({
  accept = 'image/*',
  existingCount = 0,
  maxFileSizeBytes = 20 * 1024 * 1024,
  maxFiles = 5,
  multiple = true,
}: UseStagedImageUploadsArgs = {}) {
  const [items, setItems] = useState<StagedImageUploadItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const itemsRef = useRef<StagedImageUploadItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const stageFiles = useCallback(
    (incomingFiles: File[] | FileList | null | undefined) => {
      if (!incomingFiles) return;

      const files = Array.from(incomingFiles);
      if (!files.length) return;

      const slotsRemaining = Math.max(
        0,
        maxFiles - existingCount - itemsRef.current.length
      );

      if (slotsRemaining <= 0) {
        setErrorMessage(`You can only add up to ${maxFiles} image(s).`);
        return;
      }

      const acceptedFiles = (multiple ? files : files.slice(0, 1)).slice(
        0,
        slotsRemaining
      );

      const nextItems: StagedImageUploadItem[] = [];
      let nextError = '';

      acceptedFiles.forEach((file) => {
        if (!matchesAccept(file, accept)) {
          nextError = 'Only supported image formats can be added here.';
          return;
        }

        if (file.size > maxFileSizeBytes) {
          nextError = `Each image must be ${Math.floor(
            maxFileSizeBytes / (1024 * 1024)
          )}MB or smaller.`;
          return;
        }

        nextItems.push({
          id: makeId(),
          file,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          status: 'staged',
        });
      });

      if (files.length > acceptedFiles.length && !nextError) {
        nextError = `Only ${slotsRemaining} more image(s) can be added.`;
      }

      if (nextItems.length) {
        setItems((currentItems) => [...currentItems, ...nextItems]);
      }

      setErrorMessage(nextError);
    },
    [accept, existingCount, maxFileSizeBytes, maxFiles, multiple]
  );

  const replaceFiles = useCallback(
    (incomingFiles: File[] | FileList | null | undefined) => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      itemsRef.current = [];
      setItems([]);
      setErrorMessage('');
      stageFiles(incomingFiles);
    },
    [stageFiles]
  );

  const removeStaged = useCallback((id: string) => {
    setItems((currentItems) => {
      const found = currentItems.find((item) => item.id === id);
      if (found) {
        URL.revokeObjectURL(found.previewUrl);
      }

      const nextItems = currentItems.filter((item) => item.id !== id);
      itemsRef.current = nextItems;
      return nextItems;
    });
  }, []);

  const clearStaged = useCallback(() => {
    const nextItems = itemsRef.current;
    nextItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    itemsRef.current = [];
    setItems(() => {
      return [];
    });
    setErrorMessage('');
  }, []);

  const setProgress = useCallback((id: string, progress: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              progress,
              status: 'uploading',
              error: undefined,
            }
          : item
      )
    );
  }, []);

  const setUploadError = useCallback((id: string, error: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'error',
              error,
            }
          : item
      )
    );
  }, []);

  const uploadPending = useCallback(
    async <TResult,>({ onUploaded, uploadFile }: UploadPendingArgs<TResult>) => {
      const snapshot = [...items];
      const results: TResult[] = [];

      for (const item of snapshot) {
        try {
          setProgress(item.id, 0);
          const result = await uploadFile(item.file, (progress) => {
            setProgress(item.id, progress);
          });

          if (onUploaded) {
            await onUploaded(result, item);
          }

          results.push(result);
          removeStaged(item.id);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Image upload failed.';
          setUploadError(item.id, message);
          setErrorMessage(message);
          throw error;
        }
      }

      setErrorMessage('');
      return results;
    },
    [items, removeStaged, setProgress, setUploadError]
  );

  const hasStagedFiles = useMemo(() => items.length > 0, [items.length]);

  return {
    clearError: () => setErrorMessage(''),
    clearStaged,
    errorMessage,
    hasStagedFiles,
    isAtLimit: existingCount + items.length >= maxFiles,
    items,
    removeStaged,
    replaceFiles,
    setItems,
    stageFiles,
    uploadPending,
  };
}

export type UseStagedImageUploadsReturn = ReturnType<
  typeof useStagedImageUploads
>;
