import { BottomButton } from './BottomButton';
import { JSASidebar } from './JSASidebar';

export function WithSidebar({ children }: { children: any }) {
  return (
    <div className="flex h-[80vh] flex-1 justify-start">
      {/* Sidebar */}
      <JSASidebar />
      {children}
    </div>
  );
}
