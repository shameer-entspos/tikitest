import { JSAAppModel } from '@/app/(main)/(user-panel)/user/apps/api';
import { RefObject } from 'react';
import { JSADetailSidebar } from './JSAEDITSIDEBAR';

export function WithJSADetailSidebar({
  children,
  data,
  contentRef,
}: {
  children: any;
  data: JSAAppModel | undefined;
  contentRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex min-h-0 w-full flex-1 justify-between gap-4">
      {/* Sidebar */}
      <JSADetailSidebar data={data} contentRef={contentRef} />
      {children}
    </div>
  );
}
