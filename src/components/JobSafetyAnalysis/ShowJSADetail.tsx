import { useMemo } from 'react';
import { JSATopBar } from './CreateNewComponents/TopBar';
import { JSASubmissionDetail } from './EditSubmissionComponent/JSASubmissionDetail';

export function ShowJSADetail() {
  const memoizedTopBar = useMemo(() => <JSATopBar />, []);
  return (
    <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4">
      {/* TopBar */}
      {memoizedTopBar}
      <JSASubmissionDetail />
    </div>
  );
}
