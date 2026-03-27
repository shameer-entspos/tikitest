'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarItem {
  label: string;
  href: string;
}
interface SidebarProps {
  organizationItems: SidebarItem[];
  myAccountItems: SidebarItem[];
}
const SideBar = ({ organizationItems, myAccountItems }: SidebarProps) => {
  const pathname = usePathname();
  return (
    // Add the class "translate-x-0" when the hamburger icon is clicked, and remove the class "translate-x-0" when the close icon is clicked.
    <aside className="absolute left-0 h-[calc(var(--app-vh)_-_72px)] w-full min-w-[196px] max-w-[256px] translate-x-[-100%] overflow-y-auto border-r bg-white shadow-lg transition-all md:static md:translate-x-[0%]">
      <ul className="flex flex-col gap-2 p-2">
        <li className="px-3 py-1">
          <h1 className="text-2xl font-bold">Setting</h1>
        </li>
        {/* <li className="py-1 px-3">
          <h2>Organization</h2>
        </li> */}
        {organizationItems.map((item) => (
          <Link href={item.href} key={item.href} legacyBehavior>
            <a>
              <li
                className={`${
                  pathname === item.href
                    ? 'rounded-full bg-primary-200 px-4 py-1 font-bold text-[#212121]'
                    : 'rounded-full px-4 py-1 text-secondary-500 hover:bg-primary-100 hover:font-bold hover:text-[#212121]'
                } `}
              >
                {item.label}
              </li>
            </a>
          </Link>
        ))}
        <br />
        <li className="px-3 py-1">
          <h2>My Account</h2>
        </li>
        {myAccountItems.map((item) => (
          <Link href={item.href} key={item.href} legacyBehavior>
            <a>
              <li
                className={`${
                  pathname === item.href
                    ? 'rounded-full bg-primary-700 px-4 py-1 font-bold text-[#212121]'
                    : 'rounded-full px-4 py-1 text-secondary-500 hover:bg-primary-100 hover:font-bold hover:text-[#212121]'
                } `}
              >
                {item.label}
              </li>
            </a>
          </Link>
        ))}
      </ul>
    </aside>
  );
};
export { SideBar };
