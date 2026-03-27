import { JSAAppModel } from '@/app/(main)/(user-panel)/user/apps/api';
import { RefObject } from 'react';

import { RollCall } from '@/app/type/roll_call';
import { SiteDetailSidebar } from './site_detail_sidebar';
import { Site } from '@/app/type/Sign_Register_Sites';

export function WithSiteDetailSidebar({
  children,
  data,
  contentRef,
}: {
  children: any;
  data: Site | undefined;
  contentRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex h-full justify-between">
        {/* Sidebar */}
        <SiteDetailSidebar data={data} contentRef={contentRef} />
        {children}
      </div>
    </div>
  );
}
