'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  MenuItemStyles,
  menuClasses,
} from 'react-pro-sidebar';
import { RiMenuUnfoldFill } from 'react-icons/ri';
import React from 'react';
import { TeamRooms } from '@/app/(main)/(user-panel)/user/chats/api';
import {
  AccordionHeader,
  Accordion,
  AccordionBody,
} from '@material-tailwind/react';

import { AiFillPushpin } from 'react-icons/ai';
import { ProjectList } from '@/app/type/projects';

interface SidebarItem {
  label: string;
  href: string;
}
interface SidebarProps {
  organizationItems: SidebarItem[];
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

const ProjectSideBar = ({ data }: { data: ProjectList | undefined }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [toggled, setToggled] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [hasImage, setHasImage] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>('light');
  const pathname = usePathname();
  function getProjectDueDays(arg0: string): any {
    if (arg0) {
      var date1 = new Date(Date.now());
      var date2 = new Date(arg0);
      var diff = Math.abs(date1.getTime() - date2.getTime());
      var diffDays = Math.ceil(diff / (1000 * 3600 * 24));

      return diffDays;
    }
    return '0';
  }
  const menuItemStyles: MenuItemStyles = {
    root: {
      fontSize: '13px',
      fontWeight: 400,
    },
    icon: {
      color: themes[theme].menu.icon,
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
    },
    SubMenuExpandIcon: {
      color: '#b6b7b9',
    },
    subMenuContent: ({ level }) => ({
      backgroundColor:
        level === 0
          ? hexToRgba(
              themes[theme].menu.menuContent,
              hasImage && !collapsed ? 0.4 : 1
            )
          : 'transparent',
    }),
    button: {
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
      '&:hover': {
        backgroundColor: hexToRgba(
          themes[theme].menu.hover.backgroundColor,
          hasImage ? 0.8 : 1
        ),
        color: themes[theme].menu.hover.color,
      },
    },
    label: ({ open }) => ({
      fontWeight: open ? 600 : undefined,
    }),
  };
  const [accordionState, setAccordionState] = useState<{
    [key: string]: boolean;
  }>({});
  const handleClick = (teamName: string) => {
    setAccordionState((prevState) => ({
      ...prevState,
      [teamName]: !prevState[teamName],
    }));
  };

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
      <div className="flex h-full">
        <Sidebar
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
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div className="flex-1">
              {/* <Menu menuItemStyles={menuItemStyles}>box-shadow: 1px 0px 12px 2px #0000001A;

                  <MenuItem>Calendar</MenuItem>
                  <MenuItem>Documentation</MenuItem>
                </Menu> */}
              <aside
                style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 1.95px 1.95px 9.6px' }}
                className="h-[calc(var(--app-vh)_-_0px)] w-full min-w-[196px] max-w-[256px] overflow-y-auto bg-white px-5 scrollbar-hide"
              >
                <ul className="mt-10 flex flex-col">
                  <li className="">
                    <div className="flex cursor-pointer items-center justify-between px-3">
                      <h1 className="text-[20px] font-semibold text-black">
                        My Projects
                      </h1>
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 25 25"
                        xmlns="http://www.w3.org/2000/svg"
                        className="hidden text-black sm:block"
                      >
                        <path d="M23.0469 8.20312H1.95312C1.64232 8.20312 1.34425 8.07966 1.12448 7.85989C0.904715 7.64012 0.78125 7.34205 0.78125 7.03125C0.78125 6.72045 0.904715 6.42238 1.12448 6.20261C1.34425 5.98284 1.64232 5.85938 1.95312 5.85938H23.0469C23.3577 5.85938 23.6557 5.98284 23.8755 6.20261C24.0953 6.42238 24.2188 6.72045 24.2188 7.03125C24.2188 7.34205 24.0953 7.64012 23.8755 7.85989C23.6557 8.07966 23.3577 8.20312 23.0469 8.20312ZM19.1406 13.6719H5.85938C5.54857 13.6719 5.2505 13.5484 5.03073 13.3286C4.81097 13.1089 4.6875 12.8108 4.6875 12.5C4.6875 12.1892 4.81097 11.8911 5.03073 11.6714C5.2505 11.4516 5.54857 11.3281 5.85938 11.3281H19.1406C19.4514 11.3281 19.7495 11.4516 19.9693 11.6714C20.189 11.8911 20.3125 12.1892 20.3125 12.5C20.3125 12.8108 20.189 13.1089 19.9693 13.3286C19.7495 13.5484 19.4514 13.6719 19.1406 13.6719ZM14.4531 19.1406H10.5469C10.2361 19.1406 9.938 19.0172 9.71823 18.7974C9.49846 18.5776 9.375 18.2796 9.375 17.9688C9.375 17.6579 9.49846 17.3599 9.71823 17.1401C9.938 16.9203 10.2361 16.7969 10.5469 16.7969H14.4531C14.7639 16.7969 15.062 16.9203 15.2818 17.1401C15.5015 17.3599 15.625 17.6579 15.625 17.9688C15.625 18.2796 15.5015 18.5776 15.2818 18.7974C15.062 19.0172 14.7639 19.1406 14.4531 19.1406Z" />
                      </svg>
                    </div>
                  </li>

                  {/* recently views */}
                  <Accordion open={!accordionState['recent']} key={'recent'}>
                    <AccordionHeader
                      onClick={() => handleClick('recent')}
                      className="ml-0 mt-11 flex w-full items-center justify-start gap-2 border-none py-0 md:ml-3"
                    >
                      <svg
                        className={`h-[18px] w-[18px] text-[#616161] ${
                          !accordionState['recent'] ? '' : '-rotate-90'
                        }`}
                        viewBox="0 0 15 15"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.1246 3.12609L1.87464 3.12609C1.76074 3.12645 1.64909 3.15787 1.55172 3.21696C1.45434 3.27604 1.37493 3.36057 1.32202 3.46144C1.26911 3.56231 1.24471 3.67569 1.25145 3.7894C1.25819 3.9031 1.29581 4.01281 1.36027 4.10672L6.98527 12.2317C7.21839 12.5686 7.77964 12.5686 8.01339 12.2317L13.6384 4.10672C13.7035 4.013 13.7417 3.90324 13.7488 3.78935C13.7559 3.67546 13.7317 3.5618 13.6787 3.46071C13.6257 3.35963 13.5461 3.275 13.4484 3.216C13.3507 3.15701 13.2388 3.12591 13.1246 3.12609Z"
                          fill="#616161"
                        />
                      </svg>

                      <span className="w-10 truncate pt-[3px] text-[16px] font-normal text-[#616161] md:w-full">
                        {'Recently Viewed'}
                      </span>
                    </AccordionHeader>
                    <AccordionBody>
                      {(data?.projects ?? [])
                        .filter((project) => {
                          return new Date(project.date ?? 0) >= new Date();
                        })
                        .map((item) => (
                          <div key={item._id} className={'px-3 py-2'}>
                            <div className="flex justify-between">
                              <div className="truncate font-Open-Sans text-base font-normal text-[#000000]">
                                {item.name}
                              </div>
                              <span className="font-Open-Sans text-sm text-[#616161]">
                                {getProjectDueDays(item.date ?? '')}d
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="truncate font-Open-Sans text-sm text-black">
                                Ref: {item.reference}
                              </div>
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 13 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.43031 1.29215C8.27502 1.13643 8.08537 1.0193 7.87659 0.950178C7.66782 0.881053 7.44574 0.861858 7.2282 0.894133C7.01066 0.926408 6.80373 1.00925 6.62402 1.13602C6.44431 1.26278 6.29683 1.42992 6.19344 1.62402L4.29969 5.17715L1.66438 6.05559C1.58851 6.08079 1.52036 6.12497 1.46638 6.18393C1.41241 6.24289 1.37441 6.31467 1.35599 6.39246C1.33758 6.47025 1.33937 6.55145 1.36118 6.62836C1.38299 6.70526 1.42411 6.7753 1.48062 6.83184L3.49344 8.84371L1.01187 11.3253L0.875 12.125L1.67469 11.9881L4.15625 9.50652L6.16813 11.5193C6.22466 11.5759 6.2947 11.617 6.37161 11.6388C6.44851 11.6606 6.52971 11.6624 6.6075 11.644C6.68529 11.6256 6.75707 11.5876 6.81603 11.5336C6.875 11.4796 6.91918 11.4114 6.94438 11.3356L7.82281 8.70121L11.3656 6.80371C11.5587 6.70012 11.7249 6.55283 11.851 6.3736C11.9771 6.19437 12.0595 5.98816 12.0918 5.77141C12.124 5.55467 12.1052 5.33338 12.0367 5.12522C11.9682 4.91706 11.8521 4.72777 11.6975 4.57246L8.43125 1.29121L8.43031 1.29215Z"
                                  fill="#616161"
                                />
                              </svg>
                            </div>
                          </div>
                        ))}
                    </AccordionBody>
                  </Accordion>

                  {/* recently views */}
                  <Accordion open={!accordionState['due']} key={'due'}>
                    <AccordionHeader
                      onClick={() => handleClick('due')}
                      className="ml-0 flex w-full items-center justify-start gap-2 border-none py-0 md:ml-3"
                    >
                      <svg
                        className={`h-[18px] w-[18px] ${
                          !accordionState['due'] ? '' : '-rotate-90'
                        }`}
                        viewBox="0 0 15 15"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.1246 3.12609L1.87464 3.12609C1.76074 3.12645 1.64909 3.15787 1.55172 3.21696C1.45434 3.27604 1.37493 3.36057 1.32202 3.46144C1.26911 3.56231 1.24471 3.67569 1.25145 3.7894C1.25819 3.9031 1.29581 4.01281 1.36027 4.10672L6.98527 12.2317C7.21839 12.5686 7.77964 12.5686 8.01339 12.2317L13.6384 4.10672C13.7035 4.013 13.7417 3.90324 13.7488 3.78935C13.7559 3.67546 13.7317 3.5618 13.6787 3.46071C13.6257 3.35963 13.5461 3.275 13.4484 3.216C13.3507 3.15701 13.2388 3.12591 13.1246 3.12609Z"
                          fill="#616161"
                        />
                      </svg>

                      <span className="w-10 truncate pt-[3px] text-[16px] font-normal text-[#616161] md:w-full">
                        {'Due'}
                      </span>
                    </AccordionHeader>
                    <AccordionBody>
                      {(data?.projects ?? [])
                        .filter((project) => {
                          return new Date(project.date ?? 0) < new Date();
                        })
                        .map((item) => (
                          <div key={item._id} className={'px-3 py-2'}>
                            <div className="flex justify-between">
                              <div className="truncate font-Open-Sans text-base font-normal text-black">
                                {item.name}
                              </div>
                              <span className="font-Open-Sans text-sm">
                                {getProjectDueDays(item.date ?? '')}d ago
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <div className="truncate font-Open-Sans text-sm">
                                {item.reference}
                              </div>
                              {/* <span>
                                <AiFillPushpin />
                              </span> */}
                            </div>
                          </div>
                        ))}
                    </AccordionBody>
                  </Accordion>
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
export { ProjectSideBar };
