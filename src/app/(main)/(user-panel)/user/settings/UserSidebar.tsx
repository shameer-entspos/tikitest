'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Sidebar, MenuItemStyles, menuClasses } from 'react-pro-sidebar';
import { RiMenuUnfoldFill } from 'react-icons/ri';
import React from 'react';
interface SidebarItem {
  label: string;
  href?: string;
}
interface SidebarProps {
  myAccountItems: SidebarItem[];
}
const themes = {
  light: {
    sidebar: {
      backgroundColor: '#ffffff',
      color: '#607489',
    },
    menu: {
      menuContent: '#fbfcfd',
      icon: '#0098e5',
      hover: {
        backgroundColor: '#c5e4ff',
        color: '#44596e',
      },
      disabled: {
        color: '#9fb6cf',
      },
    },
  },
  dark: {
    sidebar: {
      backgroundColor: '#0b2948',
      color: '#8ba1b7',
    },
    menu: {
      menuContent: '#082440',
      icon: '#59d0ff',
      hover: {
        backgroundColor: '#00458b',
        color: '#b6c8d9',
      },
      disabled: {
        color: '#3e5e7e',
      },
    },
  },
};
type Theme = 'light' | 'dark';
// hex to rgba converter
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
const UserSideBar = ({ myAccountItems }: SidebarProps) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [toggled, setToggled] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [hasImage, setHasImage] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>('light');
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      return setSidebar(true);
    }
  }, []);

  if (!sidebar) {
    // Render a loading state or fallback UI
    return <></>;
  }
  return (
    <>
      <div
        className="flex h-full"
        style={{ boxShadow: '0px 1px 1px 0px #00000033' }}
      >
        <Sidebar
          style={{ boxShadow: '0px 1px 1px 0px #00000033' }}
          collapsed={collapsed}
          toggled={toggled}
          onBackdropClick={() => setToggled(false)}
          onBreakPoint={setBroken}
          breakPoint="md"
          backgroundColor={hexToRgba(
            themes[theme].sidebar.backgroundColor,
            hasImage ? 0.9 : 1
          )}
          rootStyles={{
            color: themes[theme].sidebar.color,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '118dvh',
              boxShadow: '0px 2px 8px 0px #00000033',
            }}
          >
            <div className="flex-1">
              <aside className="h-[calc(var(--app-vh)_-_72px)] w-full min-w-[196px] max-w-[250px] overflow-y-auto bg-white scrollbar-hide">
                <ul className="mt-12 flex flex-col gap-3 px-3">
                  <li className="">
                    <h1 className="mb-2 px-4 text-2xl font-semibold text-[#212121]">
                      My Account
                    </h1>
                  </li>

                  {myAccountItems.map((item, index) => (
                    <Link href={item.href ?? ''} key={index} legacyBehavior>
                      <a>
                        <li
                          className={`${item.href === undefined && 'cursor-not-allowed'} ${
                            pathname === item.href
                              ? 'rounded-full bg-[#E2F3FF] py-[6px] font-bold text-black'
                              : 'rounded-full text-[#616161] hover:font-bold'
                          } px-4 py-[3px]`}
                        >
                          {item.label}
                        </li>
                      </a>
                    </Link>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </Sidebar>
        {broken && (
          <button className="p-4" onClick={() => setToggled(!toggled)}>
            <RiMenuUnfoldFill />
          </button>
        )}
      </div>
    </>
  );
};
export { UserSideBar };
