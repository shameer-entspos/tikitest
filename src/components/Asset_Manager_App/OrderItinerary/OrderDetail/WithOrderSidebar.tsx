import { RefObject } from 'react';
import { SingleAsset } from '@/app/type/single_asset';
import { Orderitinreray } from '@/app/type/order_itinreray';
import { OrderItineraryDetailSidebar } from './OrderItineraySidebar';

export function WithOrderDetailSIdebar({
  children,
  data,
  contentRef,
  appId,
}: {
  children: any;
  data: Orderitinreray | undefined;
  contentRef: RefObject<HTMLDivElement>;
  appId: string;
}) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex h-full justify-between">
        {/* Sidebar */}
        <OrderItineraryDetailSidebar
          data={data}
          contentRef={contentRef}
          appId={appId}
        />
        {children}
      </div>
    </div>
  );
}
