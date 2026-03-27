'use client';

import { Card } from '@/components/Cards';
import Switch from '@/components/Form/switch';

export default function page() {
  return (
    <>
      <div className="flex min-h-full w-full max-w-[880px] flex-1 flex-col">
        {/* header */}
        <div className="page-heading-edit mb-5 flex flex-col justify-between gap-2 xl:flex-row xl:gap-0">
          {/* icon */}
          <div className="page-heading-edit flex flex-col items-center gap-4 md:flex-row xl:w-1/2">
            <div className="flex w-full items-center gap-4 md:w-max">
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#e2f3ff] p-[5px] lg:h-[50px] lg:w-[50px]"
                style={{
                  boxShadow: '0px 0px 2px 1.3px #0000001d',
                }}
              >
                <svg
                  width="30"
                  height="38"
                  viewBox="0 0 30 38"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 19.0003H26.6667C25.7833 25.8503 21.2 31.967 15 33.867V19.0003ZM15 19.0003H3.33333V9.50033L15 4.31699M15 0.666992L0 7.33366V17.3337C0 26.5837 6.4 35.217 15 37.3337C23.6 35.217 30 26.5837 30 17.3337V7.33366L15 0.666992Z"
                    fill="#0063F7"
                  />
                </svg>
              </span>
              <h3 className="text-lg font-bold text-black md:text-xl lg:text-2xl">
                Security
              </h3>
            </div>
          </div>
        </div>

        <Card>
          <div className="mb-10 flex items-center justify-between last:mb-0">
            <div className="text-base font-normal text-black">
              Allow user to reset password
            </div>
            <div>
              <Switch></Switch>
            </div>
          </div>
          <div className="mb-10 flex items-center justify-between last:mb-0">
            <div className="text-base font-normal text-black">
              Allow organisation & users to be found in external directory
            </div>
            <div>
              <Switch></Switch>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
